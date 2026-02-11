'use server';

import { supabase } from '@/lib/supabaseClient';

interface OrderItem {
    id: string;
    quantity: number;
    product_id: string; // Linking to product, though we store snapshot in JSON
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

        // Insert into Supabase
        const { data, error } = await supabase
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
            console.error('Error saving order:', error);
            return { success: false, error: error.message };
        }

        return { success: true, order: data };
    } catch (error) {
        console.error('Unexpected error saving order:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
