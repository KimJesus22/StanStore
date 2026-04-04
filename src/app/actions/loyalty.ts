'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POINTS_COST = 500;
const DISCOUNT_AMOUNT = 50; // MXN

/**
 * Deducts 500 loyalty points from the authenticated user.
 *
 * The conditional UPDATE (.gte guard) ensures only one concurrent request
 * puede tener éxito — PostgreSQL serializa escrituras a nivel de fila.
 * La respuesta del UPDATE incluye las filas afectadas: si es vacía, significa
 * que otra request ya dedujo los puntos antes y se devuelve error.
 */
export async function redeemLoyaltyPoints(userId: string): Promise<{
    success: boolean;
    discount?: number;
    error?: string;
}> {
    if (!userId || !UUID_REGEX.test(userId)) {
        return { success: false, error: 'Usuario no identificado.' };
    }

    // Verify the caller owns the account being charged
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autorizado.' };
    if (user.id !== userId) return { success: false, error: 'No autorizado.' };

    const admin = createAdminClient();

    // 1. Fetch current points for informative error messaging
    const { data: rewards, error: fetchError } = await admin
        .from('user_rewards')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

    if (fetchError || !rewards) {
        return { success: false, error: 'No se encontraron datos de lealtad.' };
    }

    if (rewards.loyalty_points < POINTS_COST) {
        return {
            success: false,
            error: `Necesitas al menos ${POINTS_COST} puntos. Tienes ${rewards.loyalty_points}.`,
        };
    }

    // 2. Conditional update — .select() devuelve las filas afectadas.
    // Si una request concurrente ya dedujo los puntos, loyalty_points < POINTS_COST
    // y el guard .gte() falla → 0 filas devueltas → redemption duplicado bloqueado.
    const { data: updated, error: updateError } = await admin
        .from('user_rewards')
        .update({
            loyalty_points: rewards.loyalty_points - POINTS_COST,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .gte('loyalty_points', POINTS_COST)
        .select('loyalty_points');

    if (updateError) {
        console.error('Error deducting points:', updateError);
        return { success: false, error: 'Error al deducir puntos. Intenta de nuevo.' };
    }

    if (!updated || updated.length === 0) {
        return { success: false, error: 'Puntos insuficientes. Verifica tu saldo e intenta de nuevo.' };
    }

    return { success: true, discount: DISCOUNT_AMOUNT };
}
