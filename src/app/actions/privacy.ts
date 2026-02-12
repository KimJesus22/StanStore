'use server';

import { supabase } from '@/lib/supabaseClient';

export async function getUserData(userId: string) {
    try {
        // 1. Fetch Auth User Info (Simulated by verifying session, usually we get strict data from auth.users via admin but RLS allows accessing own data)
        // Actually we can just query simulated profile data if we had a profiles table.
        // For now we will fetch related relational data.

        // 2. Fetch Orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId);

        // 3. Fetch Reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId);

        // 4. Construct Export Object
        const exportData = {
            generated_at: new Date().toISOString(),
            user_id: userId,
            personal_data: {
                note: "Basic profile data is managed via Supabase Auth. This export contains your activity data."
            },
            orders: orders || [],
            reviews: reviews || [],
        };

        return { success: true, data: exportData };

    } catch (error) {
        console.error('Export Error:', error);
        return { success: false, error: 'Failed to export data' };
    }
}
