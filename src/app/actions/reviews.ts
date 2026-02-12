'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

interface SubmitReviewParams {
    productId: string;
    rating: number;
    comment: string;
    userId: string;
}

export async function submitReview({ productId, rating, comment, userId }: SubmitReviewParams) {
    try {
        // 1. Verify Purchase
        const hasPurchased = await verifyPurchase(productId, userId);
        if (!hasPurchased) {
            return { success: false, error: 'Debes comprar este producto para dejar una reseña.' };
        }

        // 2. Sanitize Comment
        const cleanComment = DOMPurify.sanitize(comment);

        // 3. Insert Review
        const { error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                product_id: productId,
                rating,
                comment: cleanComment,
            });

        if (error) {
            console.error('Error submitting review:', error);
            if (error.code === '23505') { // Unique violation if we added a constraint (optional)
                return { success: false, error: 'Ya has enviado una reseña para este producto.' };
            }
            return { success: false, error: 'Error al guardar la reseña.' };
        }

        revalidatePath(`/product/${productId}`);
        return { success: true };

    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: 'Ocurrió un error inesperado.' };
    }
}

export async function verifyPurchase(productId: string, userId: string): Promise<boolean> {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('items')
            .eq('user_id', userId);

        if (error || !orders) {
            console.error('Error fetching orders:', error);
            return false;
        }

        // Check if productId exists in any order's items
        // items is a JSONB array of objects with an 'id' property
        for (const order of orders) {
            const items = order.items as unknown as Array<{ id: string }>;
            if (Array.isArray(items) && items.some((item) => item.id === productId)) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Error verifying purchase:', error);
        return false;
    }
}

export async function getReviews(productId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data;
}
