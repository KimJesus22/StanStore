'use server';

import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';
import { ProductSchema } from '@/lib/validations';
import { Product } from '@/types';
import { revalidatePath, revalidateTag } from 'next/cache';
import { logAuditAction } from '@/app/actions/audit';

// Use Service Role to ensure we can create products even if auth context is lost
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function createProduct(formData: {
    name: string;
    price: number;
    category: string;
    artist: string;
    description: string;
    image_url: string;
    spotify_album_id?: string;
}) {
    try {
        // 1. Validate Input
        const validatedFields = ProductSchema.safeParse(formData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors
            };
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert({
                ...validatedFields.data,
                is_new: true
            })
            .select()
             
            .single() as PostgrestSingleResponse<Product>;

        if (error) {
            console.error('Supabase Error:', error);
            await logAuditAction('PRODUCT_CREATION_FAILED', { error: error.message, data: validatedFields.data });
            return { success: false, error: 'Error al guardar en base de datos: ' + error.message };
        }

        if (data) {
            await logAuditAction('PRODUCT_CREATED', {
                name: data.name,
                price: data.price,
                productId: data.id
            });
            revalidatePath('/');
            return { success: true, product: data };
        }
        return { success: false, error: 'No se devolvieron datos del producto' };

    } catch (error: unknown) {
        console.error('Create Product Error:', error);
        await logAuditAction('PRODUCT_CREATION_ERROR', { error: error instanceof Error ? error.message : String(error) });
        return { success: false, error: 'Error inesperado al crear el producto' };
    }
}

export async function updateProduct(formData: {
    id: string;
    name: string;
    price: number;
    category: string;
    artist: string;
    description: string;
    image_url: string;
    spotify_album_id?: string;
    is_new?: boolean;
}) {
    try {
        // 1. Validate Input (Partial validation since it's an update, but we have full object here)
        const validatedFields = ProductSchema.safeParse(formData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors
            };
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .update({
                ...validatedFields.data,
                // Ensure we don't accidentally unset fields if not provided, though validation handles required ones
            })
            .eq('id', formData.id)
            .select()
             
            .single() as PostgrestSingleResponse<Product>;

        if (error) {
            console.error('Update Product Error:', error);
            await logAuditAction('PRODUCT_UPDATE_FAILED', { error: error.message, productId: formData.id });
            return { success: false, error: 'Error al actualizar: ' + error.message };
        }

        if (data) {
            await logAuditAction('PRODUCT_UPDATED', {
                name: data.name,
                productId: data.id
            });

            // Cache Invalidation
            revalidatePath(`/product/${data.id}`); // Invalidate specific product page
            // revalidateTag('products'); // Invalidate product lists using this tag (Commented out due to build error: Expected 2 arguments)
            revalidatePath('/', 'layout'); // Fallback: Invalidate everything to ensure lists are updated

            return { success: true, product: data };
        }
        return { success: false, error: 'No se devolvieron datos del producto actualizado' };

    } catch (error: unknown) {
        console.error('Update Product Exception:', error);
        return { success: false, error: 'Error inesperado al actualizar el producto' };
    }
}

export async function deleteProduct(productId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('Supabase Delete Error:', error);
            await logAuditAction('PRODUCT_DELETION_FAILED', { error: error.message, productId });
            return { success: false, error: 'Error al eliminar: ' + error.message };
        }

        await logAuditAction('PRODUCT_DELETED', { productId });
        revalidatePath('/');
        return { success: true };

    } catch (error: unknown) {
        console.error('Delete Product Error:', error);
        return { success: false, error: 'Error inesperado al eliminar el producto' };
    }
}
