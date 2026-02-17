import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper to create client if standard path doesn't exist (Duplicated for simplicity, ideally shared)
const createSupabaseServerClient = async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    );
};

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ items: [] });
        }

        const { data, error } = await supabase
            .from('wishlist_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching wishlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formattedItems = data.map((item: { products: { [key: string]: unknown }; id: string }) => ({
            ...item.products,
            wishlist_item_id: item.id
        }));

        return NextResponse.json(formattedItems);
    } catch (error) {
        console.error('Unexpected error in /api/wishlist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
