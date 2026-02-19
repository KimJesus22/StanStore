import { createClient } from '@/lib/supabase/server';
import ProofGrid from './ProofGrid';

export const revalidate = 3600; // ISR: regenerate every hour

export default async function ProofPage() {
    const supabase = await createClient();

    // Fetch SUCCESS updates that have a photo — these are the "proof" entries
    const { data: updates } = await supabase
        .from('go_updates')
        .select(`
            id,
            title,
            content,
            image_url,
            created_at,
            group_orders ( title )
        `)
        .eq('status_type', 'SUCCESS')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(60);

    // Count total SUCCESS updates (for the badge)
    const { count: totalDelivered } = await supabase
        .from('go_updates')
        .select('*', { count: 'exact', head: true })
        .eq('status_type', 'SUCCESS');

    return (
        <ProofGrid
            updates={updates ?? []}
            totalDelivered={totalDelivered ?? 0}
        />
    );
}
