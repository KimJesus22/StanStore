import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const WISHLIST_LIMIT = 100;

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('wishlist_items')
            .select('id, products(*)')
            .eq('user_id', user.id)
            .limit(WISHLIST_LIMIT);

        if (error) {
            console.error('Error fetching wishlist:', error);
            return NextResponse.json({ error: 'Error al obtener la lista de deseos.' }, { status: 500 });
        }

        const formattedItems = (data as unknown as { products: Record<string, unknown>; id: string }[]).map((item) => ({
            ...item.products,
            wishlist_item_id: item.id
        }));

        return NextResponse.json(formattedItems, {
            headers: { 'Cache-Control': 'private, no-store' },
        });
    } catch (error) {
        console.error('Unexpected error in /api/wishlist:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
