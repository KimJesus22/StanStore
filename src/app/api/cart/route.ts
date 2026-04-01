import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUANTITY = 99;

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json([]);
        }

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching cart:', error);
            return NextResponse.json({ error: 'Error al obtener el carrito' }, { status: 500 });
        }

        const formattedItems = data.map((item: { products: { id: string; [key: string]: unknown }; quantity: number; id: string }) => ({
            ...item.products,
            quantity: item.quantity,
            id: item.products.id,
            cart_item_id: item.id,
        }));

        return NextResponse.json(formattedItems);
    } catch (error) {
        console.error('Unexpected error in GET /api/cart:', error);
        return NextResponse.json({ error: 'Error al obtener el carrito' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, quantity = 1 } = body;

        if (!productId || !UUID_REGEX.test(String(productId))) {
            return NextResponse.json({ error: 'ID de producto no válido' }, { status: 400 });
        }

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
            return NextResponse.json(
                { error: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` },
                { status: 400 }
            );
        }

        // Validate product exists and has stock before touching the cart
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        if (product.stock !== null && product.stock <= 0) {
            return NextResponse.json({ error: 'Producto sin stock disponible' }, { status: 409 });
        }

        // Insert-first approach: avoids TOCTOU race condition.
        // On unique constraint violation (23505) the item already exists — increment instead.
        const { error: insertError } = await supabase
            .from('cart_items')
            .insert({ user_id: user.id, product_id: productId, quantity: qty });

        if (insertError) {
            if (insertError.code === '23505') {
                const { data: existing, error: fetchError } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', productId)
                    .single();

                if (fetchError || !existing) {
                    console.error('Error fetching existing cart item:', fetchError);
                    return NextResponse.json({ error: 'Error al actualizar el carrito' }, { status: 500 });
                }

                const newQty = Math.min(existing.quantity + qty, MAX_QUANTITY);
                const { error: updateError } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQty })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error('Error updating cart item:', updateError);
                    return NextResponse.json({ error: 'Error al actualizar el carrito' }, { status: 500 });
                }
            } else {
                console.error('Error inserting cart item:', insertError);
                return NextResponse.json({ error: 'Error al añadir al carrito' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error in POST /api/cart:', error);
        return NextResponse.json({ error: 'Error al añadir al carrito' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { productId } = body;

        if (!productId || !UUID_REGEX.test(String(productId))) {
            return NextResponse.json({ error: 'ID de producto no válido' }, { status: 400 });
        }

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) {
            console.error('Error removing from cart:', error);
            return NextResponse.json({ error: 'Error al eliminar del carrito' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error in DELETE /api/cart:', error);
        return NextResponse.json({ error: 'Error al eliminar del carrito' }, { status: 500 });
    }
}
