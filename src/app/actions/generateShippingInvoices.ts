'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { logAuditAction } from '@/app/actions/audit';
import {
    calculateGoShipping,
    type GoSplitStrategy,
} from '@/lib/calculateGoShipping';

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

/* ─── Action ─── */

/**
 * generateShippingInvoices(groupOrderId)
 *
 * Runs after the organizer closes the GO and enters the real international
 * shipping invoice amount.  For each participant who completed Pago 1 this
 * action:
 *   1. Reads the final EMS cost from the group_orders row.
 *   2. Splits the cost among participants with calculateGoShipping().
 *   3. Creates an individual Stripe Payment Link for each participant.
 *   4. Persists the link + amount to group_order_participants.
 *   5. (Optional) Sends a notification email via Resend if configured.
 *
 * Idempotent: participants who already have a payment link are skipped.
 *
 * @param groupOrderId  UUID of the group_orders row
 */
export async function generateShippingInvoices(
    groupOrderId: string
): Promise<GenerateResult> {
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
        throw new Error(`Group Order not found: ${groupOrderId}`);
    }

    if (!go.actual_ems_cost || go.actual_ems_cost <= 0) {
        throw new Error(
            'actual_ems_cost must be set on the group_orders row before generating invoices.'
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
        throw new Error(`Failed to fetch participants: ${rowsError.message}`);
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
        // All participants already have links
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

    // Map userId → { share, participant }
    const shareMap = new Map(
        shares.map(s => [s.userId, s])
    );

    // ── 4. Create Stripe Payment Links ───────────────────────────────────────

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    for (const participant of participants) {
        const share = shareMap.get(participant.user_id);
        if (!share || share.shippingCost <= 0) continue;

        try {
            // Create a one-off Stripe Product + Price for this participant's invoice
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

            // ── 6. (Optional) Send email via Resend ─────────────────────────

            if (participant.email && process.env.RESEND_API_KEY) {
                await sendShippingEmail({
                    to: participant.email,
                    goTitle: go.title as string,
                    shippingCost: share.shippingCost,
                    proportion: share.proportion,
                    paymentLinkUrl: paymentLink.url,
                });
            }

            generated++;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Failed to generate invoice for ${participant.user_id}:`, msg);
            errors[participant.user_id] = msg;

            await logAuditAction('GO_SHIPPING_INVOICE_FAILED', {
                groupOrderId,
                participantId: participant.id,
                userId: participant.user_id,
                error: msg,
            });
        }
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
}: {
    to: string;
    goTitle: string;
    shippingCost: number;
    proportion: number;
    paymentLinkUrl: string;
}) {
    // Lazy import — only runs if RESEND_API_KEY is present
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

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
