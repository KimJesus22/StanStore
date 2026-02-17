import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Assumes server client helper exists or we use standard createServerClient
import { cookies } from 'next/headers';

// Helper to create client if standard path doesn't exist
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
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
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
            // Return empty cart for unauthenticated users (or handle guest cart logic if complex, but simple empty array for now)
            return NextResponse.json({ items: [] });
        }

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching cart:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formattedItems = data.map((item: { products: { id: string;[key: string]: unknown }; quantity: number; id: string }) => ({
            ...item.products,
            quantity: item.quantity,
            id: item.products.id,
            cart_item_id: item.id
        }));

        return NextResponse.json(formattedItems);
    } catch (error) {
        console.error('Unexpected error in /api/cart:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, quantity = 1 } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Check if item already exists in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        let error;

        if (existingItem) {
            // Update quantity
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);
            error = updateError;
        } else {
            // Insert new item
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity: quantity
                });
            error = insertError;
        }

        if (error) {
            console.error('Error adding to cart:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Unexpected error in POST /api/cart:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
