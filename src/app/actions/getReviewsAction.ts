'use server';

import { supabase } from '@/lib/supabaseClient';

export async function getReviewsAction(productId: string, page: number, limit: number = 5) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching reviews page:', page, error);
            return [];
        }

        return data;
    } catch (err) {
        console.error('Unexpected error in getReviewsAction:', err);
        return [];
    }
}
