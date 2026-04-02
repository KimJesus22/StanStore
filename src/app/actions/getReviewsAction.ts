'use server';

import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LIMIT = 50;

export async function getReviewsAction(productId: string, page: number, limit: number = 5) {
    if (!productId || !UUID_REGEX.test(productId)) {
        throw new Error('ID de producto inválido.');
    }

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching reviews:', error);
        throw new Error('Error al obtener las reseñas.');
    }

    return data;
}
