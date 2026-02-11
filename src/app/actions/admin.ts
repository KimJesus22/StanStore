'use server';

import { supabase } from '@/lib/supabaseClient';
import { ProductSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

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
            return { success: false, error: 'Error al guardar en base de datos: ' + error.message };
        }

        revalidatePath('/');
        return { success: true, product: data };

    } catch (error) {
        console.error('Create Product Error:', error);
        return { success: false, error: 'Error inesperado al crear el producto' };
    }
}
