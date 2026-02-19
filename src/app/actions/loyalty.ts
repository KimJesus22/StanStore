'use server';

import { createAdminClient } from '@/lib/supabase/admin';

const POINTS_COST = 500;
const DISCOUNT_AMOUNT = 50; // MXN

/**
 * Atomically deducts 500 loyalty points from a user.
 * Returns the discount amount if successful, or an error.
 *
 * Uses the service-role client to bypass RLS and ensure
 * the deduction is authoritative.
 */
export async function redeemLoyaltyPoints(userId: string): Promise<{
    success: boolean;
    discount?: number;
    error?: string;
}> {
    if (!userId) {
        return { success: false, error: 'Usuario no identificado.' };
    }

    const admin = createAdminClient();

    // 1. Fetch current points
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

    // 2. Atomic deduction using conditional update
    const { error: updateError } = await admin
        .from('user_rewards')
        .update({
            loyalty_points: rewards.loyalty_points - POINTS_COST,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .gte('loyalty_points', POINTS_COST); // Guard against race conditions

    if (updateError) {
        console.error('Error deducting points:', updateError);
        return { success: false, error: 'Error al deducir puntos. Intenta de nuevo.' };
    }

    return { success: true, discount: DISCOUNT_AMOUNT };
}
