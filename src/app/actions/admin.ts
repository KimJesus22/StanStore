'use server';

import { supabase } from '@/lib/supabaseClient';
import { ProductSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/app/actions/audit';

export async function createProduct(formData: {
    name: string;
    price: number;
    category: string;
    artist: string;
    description: string;
    image_url: string;
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

        const { data, error } = await supabase
            .from('products')
            .insert({
                ...validatedFields.data,
                is_new: true
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            await logAuditAction('PRODUCT_CREATION_FAILED', { error: error.message, data: validatedFields.data });
            return { success: false, error: 'Error al guardar en base de datos: ' + error.message };
        }

        await logAuditAction('PRODUCT_CREATED', {
            name: data.name,
            price: data.price,
            productId: data.id
        });

        revalidatePath('/');
        return { success: true, product: data };

    } catch (error: any) {
        console.error('Create Product Error:', error);
        await logAuditAction('PRODUCT_CREATION_ERROR', { error: error.message });
        return { success: false, error: 'Error inesperado al crear el producto' };
    }
}
