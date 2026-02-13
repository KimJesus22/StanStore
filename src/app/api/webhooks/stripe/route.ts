
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';
import { logAuditAction } from '@/app/actions/audit';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2025-01-27.acacia' as any,
    });

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

    return new NextResponse('Received', { status: 200 });
}
