'use server';

import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ProductSchema } from '@/lib/validations';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/app/actions/audit';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Server-side admin guard
// Verifies the caller is an authenticated admin before any write operation.
// Uses cookie-based session (not service_role) so it reads auth.uid() from
// the actual HTTP request — bypassing the AdminGuard client-side check is
// not enough to defeat this.
// ---------------------------------------------------------------------------
async function verifyAdmin(): Promise<{ error: string } | null> {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'No autorizado: sesión inválida' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return { error: 'No autorizado: se requiere rol de administrador' };
    }

    return null;
}

export async function createProduct(formData: {
    name: string;
    price: number;
    category: string;
    artist: string;
    description: string;
    image_url: string;
    spotify_album_id?: string;
}) {
    const adminErr = await verifyAdmin();
    if (adminErr) return { success: false, error: adminErr.error };

    try {
        const validatedFields = ProductSchema.safeParse(formData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors
            };
        }

        const db = createAdminClient();
        const { data, error } = await db
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
            return { success: false, error: 'Error al guardar el producto. Inténtalo de nuevo.' };
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
    const adminErr = await verifyAdmin();
    if (adminErr) return { success: false, error: adminErr.error };

    try {
        const validatedFields = ProductSchema.safeParse(formData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors
            };
        }

        const db = createAdminClient();
        const { data, error } = await db
            .from('products')
            .update({
                ...validatedFields.data,
            })
            .eq('id', formData.id)
            .select()
            .single() as PostgrestSingleResponse<Product>;

        if (error) {
            console.error('Update Product Error:', error);
            await logAuditAction('PRODUCT_UPDATE_FAILED', { error: error.message, productId: formData.id });
            return { success: false, error: 'Error al actualizar el producto. Inténtalo de nuevo.' };
        }

        if (data) {
            await logAuditAction('PRODUCT_UPDATED', {
                name: data.name,
                productId: data.id
            });

            revalidatePath(`/product/${data.id}`);
            revalidatePath('/', 'layout');

            return { success: true, product: data };
        }
        return { success: false, error: 'No se devolvieron datos del producto actualizado' };

    } catch (error: unknown) {
        console.error('Update Product Exception:', error);
        return { success: false, error: 'Error inesperado al actualizar el producto' };
    }
}

export async function deleteProduct(productId: string) {
    const adminErr = await verifyAdmin();
    if (adminErr) return { success: false, error: adminErr.error };

    try {
        const db = createAdminClient();
        const { error } = await db
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('Supabase Delete Error:', error);
            await logAuditAction('PRODUCT_DELETION_FAILED', { error: error.message, productId });
            return { success: false, error: 'Error al eliminar el producto. Inténtalo de nuevo.' };
        }

        await logAuditAction('PRODUCT_DELETED', { productId });
        revalidatePath('/');
        return { success: true };

    } catch (error: unknown) {
        console.error('Delete Product Error:', error);
        return { success: false, error: 'Error inesperado al eliminar el producto' };
    }
}
