'use server';

import { createClient } from '@/lib/supabase/server';

// No acepta userId como parámetro — siempre se deriva de la sesión del servidor
// para evitar IDOR (un usuario autenticado accediendo a datos de otro usuario).
export async function getUserData() {
    try {
        const supabase = await createClient();

        // 1. Verificar sesión — el usuario solo puede exportar sus propios datos
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'No autorizado.' };

        const userId = user.id;

        // 2. Fetch Orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId);

        if (ordersError) console.error('Error fetching orders:', ordersError);

        // 3. Fetch Reviews
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId);

        if (reviewsError) console.error('Error fetching reviews:', reviewsError);

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
        return { success: false, error: 'Error al exportar los datos.' };
    }
}
