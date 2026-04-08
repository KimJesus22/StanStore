'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { revalidateTag } from 'next/cache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 50;
const MAX_TOTAL = 1_000_000; // MXN

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
    items: OrderItem[];
    sessionId?: string;
}) {
    try {
        const { userId, total, items, sessionId } = orderData;

        // 1. Verify the caller owns the account being charged
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'No autorizado.' };
        if (user.id !== userId) return { success: false, error: 'No autorizado.' };

        // 2. Input validation
        if (!UUID_REGEX.test(userId)) {
            return { success: false, error: 'Usuario inválido.' };
        }
        if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
            return { success: false, error: 'Items de la orden inválidos.' };
        }
        if (typeof total !== 'number' || total <= 0 || total > MAX_TOTAL) {
            return { success: false, error: 'Total de la orden inválido.' };
        }

        let agreedAt: string | null = null;
        let userAgent: string | null = null;

        // 3. If sessionId provided, payment must be confirmed — failure blocks the insert
        if (sessionId) {
            try {
                const session = await stripe.checkout.sessions.retrieve(sessionId);
                if (session.payment_status !== 'paid') {
                    return { success: false, error: 'El pago no ha sido confirmado.' };
                }
                agreedAt = session.metadata?.agreedAt || null;
                userAgent = session.metadata?.userAgent || null;
            } catch (stripeError) {
                console.error('Error verifying Stripe session:', stripeError);
                return { success: false, error: 'No se pudo verificar el pago.' };
            }
        }

        // 4. Insert using admin client (lazy init, fail-fast on missing SERVICE_ROLE_KEY)
        const admin = createAdminClient();
        const { data, error } = await admin
            .from('orders')
            .insert({
                user_id: userId,
                total,
                status: 'paid',
                items,
                agreement_accepted_at: agreedAt,
                user_agent: userAgent,
                stripe_session_id: sessionId ?? null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving order (Supabase):', error);
            return { success: false, error: 'Error al guardar la orden.' };
        }

        // 5. Revalidate cache — revalidateTag accepts a single string argument
        try {
            revalidateTag('products', 'default');
            for (const item of items) {
                if (item.product_id && UUID_REGEX.test(item.product_id)) {
                    revalidateTag(`product-${item.product_id}`, 'default');
                }
            }
        } catch (revalidateError) {
            console.error('Error revalidating cache:', revalidateError);
        }

        return { success: true, order: data };
    } catch (error: unknown) {
        console.error('Unexpected error saving order:', error);
        return { success: false, error: 'Error inesperado al procesar la orden.' };
    }
}
