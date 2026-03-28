import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Keep for types
import { stripe } from '@/lib/stripe'; // Centralized client
import { supabase } from '@/lib/supabaseClient';
import { logAuditAction } from '@/app/actions/audit';

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     description: Webhook para recibir eventos de Stripe.
 *     x-hidden: true
 */
export async function POST(req: Request) {
    // Shared 'stripe' instance is used here. 
    // It's already initialized with the correct API version and Secret Key.

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return new NextResponse(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`, { status: 400 });
    }

    // Version Mismatch Check
    if (event.api_version && event.api_version !== process.env.STRIPE_API_VERSION) {
        console.warn(`⚠️ Stripe Version Mismatch: Webhook (${event.api_version}) !== App (${process.env.STRIPE_API_VERSION}). Check Stripe Dashboard.`);
        await logAuditAction('STRIPE_VERSION_MISMATCH', {
            webhookVersion: event.api_version,
            appVersion: process.env.STRIPE_API_VERSION
        });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve items from metadata
        const itemsJson = session.metadata?.items;

        if (itemsJson) {
            try {
                const items = JSON.parse(itemsJson) as { id: string; quantity: number }[];

                console.log(`Processing order for session ${session.id}, items:`, items);

                for (const item of items) {
                    // Call RPC function to decrement stock atomically
                    const { error } = await supabase.rpc('decrement_stock', {
                        product_id: item.id,
                        quantity_to_decrement: item.quantity
                    });

                    if (error) {
                        console.error(`Failed to decrement stock for item ${item.id}:`, error);

                        // Log critical error for manual review
                        await logAuditAction('INVENTORY_SYNC_FAILED', {
                            sessionId: session.id,
                            productId: item.id,
                            error: error.message
                        });
                    } else {
                        console.log(`Stock decremented for item ${item.id}`);
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

        const { error } = await supabase
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

        console.log(`[webhook] Orden ${orderId} marcada como pagada (PI: ${paymentIntent.id})`);
    }

    return NextResponse.json({ received: true });
}
