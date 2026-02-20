import { supabase } from '@/lib/supabaseClient';
import { cacheLife, cacheTag } from 'next/cache';
import { Product } from '@/types';

export async function getProducts(): Promise<Product[]> {
    "use cache";
    cacheLife('hours');
    cacheTag('products');

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
    "use cache";
    cacheLife('hours');
    cacheTag('products', `product-${id}`);

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return data as Product;
}
