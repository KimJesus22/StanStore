'use server';

import { createClient } from '@supabase/supabase-js';

// Use Service Role to ensure we can save orders even if auth context is lost in Server Action
// (Common issue in basic Next.js + Supabase setups without full auth helpers)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OrderItem {
    id: string;
    quantity: number;
    product_id: string;
    name: string;
    price: number;
    image_url: string;
}

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2025-01-27.acacia' as any,
});

export async function saveOrder(orderData: {
    userId: string;
    total: number;
    items: OrderItem[];
    sessionId?: string; // Optional for legacy, required for Legal Tech
}) {
    try {
        const { userId, total, items, sessionId } = orderData;
        let agreedAt: string | null = null;
        let userAgent: string | null = null;

        // Legal Tech: Verify Stripe Session and extract metadata
        if (sessionId) {
            try {
                const session = await stripe.checkout.sessions.retrieve(sessionId);
                if (session.payment_status === 'paid') {
                    // Extract legal metadata
                    agreedAt = session.metadata?.agreedAt || null;
                    userAgent = session.metadata?.userAgent || null;
                }
            } catch (stripeError) {
                console.error('Error verifying Stripe session:', stripeError);
                // We might choose to fail here if strict legal compliance is required, 
                // but for now we proceed with logging.
            }
        }

        // Insert into Supabase using Admin client
        const { data, error } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: userId,
                total: total,
                status: 'paid',
                items: items,
                agreement_accepted_at: agreedAt,
                user_agent: userAgent,
                stripe_session_id: sessionId
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving order (Supabase):', error);
            return { success: false, error: error.message || 'Database error' };
        }

        return { success: true, order: data };
    } catch (error: unknown) {
        console.error('Unexpected error saving order:', error);
        return { success: false, error: 'Unexpected error: ' + (error instanceof Error ? error.message : String(error)) };
    }
}
