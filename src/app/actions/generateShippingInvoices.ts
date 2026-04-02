'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/requireAdmin';
import { stripe } from '@/lib/stripe';
import { logAuditAction } from '@/app/actions/audit';
import {
    calculateGoShipping,
    type GoSplitStrategy,
} from '@/lib/calculateGoShipping';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ─── Types ─── */

interface GenerateResult {
    success: boolean;
    /** How many payment links were generated */
    generated: number;
    /** Errors per userId, if any */
    errors: Record<string, string>;
}

interface Participant {
    id: string;
    user_id: string;
    items_count: number;
    total_weight: number;
    email: string | null;
}

interface EmailTask {
    to: string;
    shippingCost: number;
    proportion: number;
    paymentLinkUrl: string;
}

/* ─── Action ─── */

/**
 * generateShippingInvoices(groupOrderId)
 *
 * Runs after the organizer closes the GO and enters the real international
 * shipping invoice amount.  For each participant who completed Pago 1 this
 * action:
 *   1. Reads the final EMS cost from the group_orders row.
 *   2. Splits the cost among participants with calculateGoShipping().
 *   3. Creates individual Stripe Payment Links in parallel.
 *   4. Persists the link + amount to group_order_participants.
 *   5. (Optional) Sends notification emails via Resend in parallel.
 *
 * Idempotent: participants who already have a payment link are skipped.
 *
 * @param groupOrderId  UUID of the group_orders row
 */
export async function generateShippingInvoices(
    groupOrderId: string
): Promise<GenerateResult> {
    // ── 0. Admin guard ────────────────────────────────────────────────────────

    const denial = await requireAdmin();
    if (denial === 'unauthenticated') throw new Error('No autorizado.');
    if (denial === 'forbidden') throw new Error('Se requiere rol de administrador.');

    if (!groupOrderId || !UUID_REGEX.test(groupOrderId)) {
        throw new Error('ID de grupo inválido.');
    }

    const supabase = await createClient();
    const errors: Record<string, string> = {};
    let generated = 0;

    // ── 1. Load the GO and confirm it has an actual_ems_cost ────────────────

    const { data: go, error: goError } = await supabase
        .from('group_orders')
        .select('id, title, actual_ems_cost, split_strategy, status')
        .eq('id', groupOrderId)
        .single();

    if (goError || !go) {
        throw new Error('Group order no encontrado.');
    }

    if (!go.actual_ems_cost || go.actual_ems_cost <= 0) {
        throw new Error(
            'Ingresa el costo EMS real antes de generar facturas.'
        );
    }

    // ── 2. Fetch participants who paid Pago 1 and don't have a link yet ─────

    const { data: rows, error: rowsError } = await supabase
        .from('group_order_participants')
        .select(`
            id,
            user_id,
            items_count,
            total_weight,
            ems_payment_link_url,
            profiles ( email )
        `)
        .eq('group_order_id', groupOrderId)
        .eq('payment_1_status', 'PAID');

    if (rowsError) {
        throw new Error('Error al obtener los participantes.');
    }

    if (!rows || rows.length === 0) {
        return { success: true, generated: 0, errors: {} };
    }

    // Filter out participants who already have a link (idempotency)
    const pending = rows.filter(r => !r.ems_payment_link_url) as unknown as (typeof rows[0] & { profiles: { email: string | null } | null })[];
    const participants: Participant[] = pending.map(r => ({
        id: r.id,
        user_id: r.user_id,
        items_count: r.items_count ?? 0,
        total_weight: r.total_weight ?? 0,
        email: (r.profiles as { email: string | null } | null)?.email ?? null,
    }));

    if (participants.length === 0) {
        return { success: true, generated: 0, errors: {} };
    }

    // ── 3. Calculate each participant's share ────────────────────────────────

    const shares = calculateGoShipping(
        go.actual_ems_cost as number,
        participants.map(p => ({
            userId: p.user_id,
            itemsCount: p.items_count,
            totalWeight: p.total_weight,
        })),
        (go.split_strategy as GoSplitStrategy) ?? 'per-item'
    );

    const shareMap = new Map(shares.map(s => [s.userId, s]));

    // ── 4. Create Stripe Payment Links in parallel ───────────────────────────

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const emailQueue: EmailTask[] = [];

    const settled = await Promise.allSettled(
        participants.map(async (participant) => {
            const share = shareMap.get(participant.user_id);
            if (!share || share.shippingCost <= 0) return null;

            // Sequential within one participant (product → price → link)
            const product = await stripe.products.create({
                name: `Envío EMS – ${go.title}`,
                metadata: {
                    group_order_id: groupOrderId,
                    participant_id: participant.id,
                    user_id: participant.user_id,
                },
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(share.shippingCost * 100), // MXN centavos
                currency: 'mxn',
            });

            const paymentLink = await stripe.paymentLinks.create({
                line_items: [{ price: price.id, quantity: 1 }],
                after_completion: {
                    type: 'redirect',
                    redirect: { url: `${baseUrl}/es/go-success?goId=${groupOrderId}` },
                },
                metadata: {
                    group_order_id: groupOrderId,
                    participant_id: participant.id,
                    user_id: participant.user_id,
                    payment_type: 'ems_shipping',
                },
            });

            // ── 5. Persist link + amount in Supabase ────────────────────────

            await supabase
                .from('group_order_participants')
                .update({
                    actual_ems_cost: share.shippingCost,
                    ems_payment_link_url: paymentLink.url,
                    ems_stripe_price_id: price.id,
                    payment_2_status: 'PENDING',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', participant.id);

            if (participant.email) {
                emailQueue.push({
                    to: participant.email,
                    shippingCost: share.shippingCost,
                    proportion: share.proportion,
                    paymentLinkUrl: paymentLink.url,
                });
            }

            return participant.user_id;
        })
    );

    // ── 6. Collect results ───────────────────────────────────────────────────

    for (let i = 0; i < settled.length; i++) {
        const result = settled[i];
        const participant = participants[i];

        if (result.status === 'fulfilled' && result.value !== null) {
            generated++;
        } else if (result.status === 'rejected') {
            errors[participant.user_id] = 'Error al generar la factura de envío.';
            console.error(`Failed for participant ${participant.id}:`, result.reason);

            await logAuditAction('GO_SHIPPING_INVOICE_FAILED', {
                groupOrderId,
                participantId: participant.id,
                userId: participant.user_id,
                error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            });
        }
    }

    // ── 7. Send all emails in parallel (failures don't affect the result) ───

    if (emailQueue.length > 0 && process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await Promise.allSettled(
            emailQueue.map(task =>
                sendShippingEmail({ ...task, goTitle: go.title as string, resend })
            )
        );
    }

    await logAuditAction('GO_SHIPPING_INVOICES_GENERATED', {
        groupOrderId,
        generated,
        failed: Object.keys(errors).length,
        totalEms: go.actual_ems_cost,
    });

    return {
        success: Object.keys(errors).length === 0,
        generated,
        errors,
    };
}

/* ─── Email helper (Resend) ─── */

async function sendShippingEmail({
    to,
    goTitle,
    shippingCost,
    proportion,
    paymentLinkUrl,
    resend,
}: {
    to: string;
    goTitle: string;
    shippingCost: number;
    proportion: number;
    paymentLinkUrl: string;
    resend: InstanceType<typeof import('resend').Resend>;
}) {
    const pctLabel = `${(proportion * 100).toFixed(1)}%`;
    const amountLabel = `$${shippingCost.toFixed(2)} MXN`;

    await resend.emails.send({
        from: 'StanStore <no-reply@stanstore.com>',
        to,
        subject: `Tu parte del envío está lista – ${goTitle}`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
                <h2 style="margin-bottom:4px">¡Tu paquete está en camino! 📦</h2>
                <p style="color:#555">El organizador del <strong>${goTitle}</strong> ya tiene
                el costo real del envío internacional.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <tr>
                        <td style="padding:8px 0;color:#555">Tu proporción del envío</td>
                        <td style="padding:8px 0;text-align:right;font-weight:600">${pctLabel}</td>
                    </tr>
                    <tr style="border-top:1px solid #eee">
                        <td style="padding:8px 0;color:#555">Costo de envío a pagar</td>
                        <td style="padding:8px 0;text-align:right;font-weight:700;font-size:1.1em">${amountLabel}</td>
                    </tr>
                </table>

                <a href="${paymentLinkUrl}"
                   style="display:block;text-align:center;background:#7c3aed;color:#fff;
                          padding:14px;border-radius:10px;text-decoration:none;font-weight:700;
                          font-size:1rem;margin:20px 0">
                    Pagar mi parte del envío →
                </a>

                <p style="font-size:0.8rem;color:#999;margin-top:24px">
                    Una vez que todos los participantes paguen, el organizador
                    coordinará la entrega a domicilio. Gracias por tu paciencia.
                </p>
            </div>
        `,
    });
}
