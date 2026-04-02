import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditAction } from '@/app/actions/audit';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     description: Webhook para recibir eventos de Stripe.
 *     x-hidden: true
 */
export async function POST(req: Request) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return new NextResponse('Webhook not configured', { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        // Do not expose Stripe's internal error message to the caller
        console.error('Webhook signature verification failed.', err);
        return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    // Version Mismatch Check
    if (event.api_version && event.api_version !== process.env.STRIPE_API_VERSION) {
        console.warn(`Stripe Version Mismatch: Webhook (${event.api_version}) !== App (${process.env.STRIPE_API_VERSION}). Check Stripe Dashboard.`);
        await logAuditAction('STRIPE_VERSION_MISMATCH', {
            webhookVersion: event.api_version,
            appVersion: process.env.STRIPE_API_VERSION
        });
    }

    // Webhooks run without a user session — must use service role to bypass RLS
    // for stock decrements and order updates.
    const supabaseAdmin = createAdminClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const itemsJson = session.metadata?.items;

        if (itemsJson) {
            try {
                const rawItems = JSON.parse(itemsJson) as unknown[];

                // Validate each item: UUID id and positive integer quantity
                const items = rawItems.filter(
                    (item): item is { id: string; quantity: number } =>
                        item !== null &&
                        typeof item === 'object' &&
                        'id' in item &&
                        'quantity' in item &&
                        typeof (item as { id: unknown }).id === 'string' &&
                        UUID_REGEX.test((item as { id: string }).id) &&
                        Number.isInteger((item as { quantity: unknown }).quantity) &&
                        (item as { quantity: number }).quantity > 0 &&
                        (item as { quantity: number }).quantity <= 99
                );

                if (items.length === 0) {
                    console.warn(`[webhook] checkout.session.completed: no valid items in metadata for session ${session.id}`);
                    return NextResponse.json({ received: true });
                }

                for (const item of items) {
                    const { error } = await supabaseAdmin.rpc('decrement_stock', {
                        product_id: item.id,
                        quantity_to_decrement: item.quantity
                    });

                    if (error) {
                        console.error(`Failed to decrement stock for item ${item.id}:`, error);
                        await logAuditAction('INVENTORY_SYNC_FAILED', {
                            sessionId: session.id,
                            productId: item.id,
                            error: error.message
                        });
                    }
                }

                await logAuditAction('ORDER_PROCESSED', { sessionId: session.id, itemCount: items.length });

            } catch (e) {
                console.error('Error processing items JSON:', e);
                return new NextResponse('Error processing items', { status: 500 });
            }
        }
    }

    // ── Flujo Google Pay / Apple Pay (PaymentIntent directo) ─────────────────
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (!orderId) {
            // PaymentIntent sin orden asociada (ej: test desde Stripe Dashboard)
            console.warn(`[webhook] payment_intent.succeeded sin order_id en metadata. PI: ${paymentIntent.id}`);
            return NextResponse.json({ received: true });
        }

        // Validate orderId before using in DB query
        if (!UUID_REGEX.test(orderId)) {
            console.warn(`[webhook] order_id inválido en metadata del PI ${paymentIntent.id}: ${orderId}`);
            return NextResponse.json({ received: true });
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId);

        if (error) {
            console.error(`[webhook] Error actualizando orden ${orderId}:`, error);
            await logAuditAction('ORDER_PAYMENT_SYNC_FAILED', {
                paymentIntentId: paymentIntent.id,
                orderId,
                error: error.message,
            });
            // Devolver 500 para que Stripe reintente el webhook automáticamente
            return new NextResponse('Error actualizando la orden', { status: 500 });
        }

        await logAuditAction('ORDER_PAID', {
            paymentIntentId: paymentIntent.id,
            orderId,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        });
    }

    return NextResponse.json({ received: true });
}
