import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tier hierarchy for comparison
const TIER_RANK: Record<string, number> = {
    BRONZE: 0,
    SILVER: 1,
    GOLD: 2,
};

/**
 * GET /api/rewards/download?id=<reward_uuid>
 *
 * 1. Authenticates the user via Supabase session cookies
 * 2. Fetches the user's tier_level from user_rewards
 * 3. Checks if the user's tier meets the reward's required_tier
 * 4. Generates a 60-second Signed URL from the private "rewards" bucket
 * 5. Redirects the user to the signed URL for download
 */
export async function GET(request: NextRequest) {
    try {
        const rewardId = request.nextUrl.searchParams.get('id');

        if (!rewardId || !UUID_REGEX.test(rewardId)) {
            return NextResponse.json(
                { error: 'Se requiere el parámetro "id" del reward y debe ser un UUID válido.' },
                { status: 400 }
            );
        }

        // ─── 1. Authenticate User ───────────────────────────────────────────
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Debes iniciar sesión para descargar recompensas.' },
                { status: 401 }
            );
        }

        // ─── 2. Fetch user's tier ───────────────────────────────────────────
        const { data: userRewards, error: rewardsError } = await supabase
            .from('user_rewards')
            .select('tier_level')
            .eq('id', user.id)
            .single();

        if (rewardsError || !userRewards) {
            return NextResponse.json(
                { error: 'No se encontraron datos de lealtad. Participa en un Group Order para comenzar.' },
                { status: 403 }
            );
        }

        // ─── 3. Fetch the reward and check tier ─────────────────────────────
        const { data: reward, error: rewardError } = await supabase
            .from('digital_rewards')
            .select('title, file_path, required_tier')
            .eq('id', rewardId)
            .single();

        if (rewardError || !reward) {
            return NextResponse.json(
                { error: 'Recompensa no encontrada.' },
                { status: 404 }
            );
        }

        const userRank = TIER_RANK[userRewards.tier_level] ?? 0;
        const requiredRank = TIER_RANK[reward.required_tier] ?? 0;

        if (userRank < requiredRank) {
            return NextResponse.json(
                {
                    error: `Necesitas nivel ${reward.required_tier} o superior para descargar "${reward.title}". Tu nivel actual: ${userRewards.tier_level}.`,
                },
                { status: 403 }
            );
        }

        // ─── 4. Generate Signed URL (requires service role) ─────────────────
        const adminClient = createAdminClient();

        const { data: signedUrlData, error: signedUrlError } = await adminClient
            .storage
            .from('rewards')
            .createSignedUrl(reward.file_path, 60); // 60 seconds

        if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error('Signed URL error:', signedUrlError);
            return NextResponse.json(
                { error: 'Error al generar el enlace de descarga. Intenta de nuevo.' },
                { status: 500 }
            );
        }

        // ─── 5. Redirect to download ───────────────────────────────────────
        return NextResponse.redirect(signedUrlData.signedUrl);

    } catch (error) {
        console.error('Unexpected error in /api/rewards/download:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        );
    }
}
