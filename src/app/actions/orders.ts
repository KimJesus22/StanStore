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

export async function saveOrder(orderData: {
    userId: string;
    total: number;
    items: OrderItem[]
}) {
    try {
        const { userId, total, items } = orderData;

        // MVP Security Check: Ideally verify payment session here
        // For now, we trust the client's trigger after Stripe redirect (Simulated)

        // Insert into Supabase using Admin client
        const { data, error } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: userId,
                total: total,
                status: 'paid', // Assuming success page reached = paid
                items: items, // JSONB snapshot
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving order (Supabase):', error);
            // Log full error for debugging
            return { success: false, error: error.message || 'Database error' };
        }

        return { success: true, order: data };
    } catch (error: unknown) {
        console.error('Unexpected error saving order:', error);
        return { success: false, error: 'Unexpected error: ' + (error instanceof Error ? error.message : String(error)) };
    }
}
