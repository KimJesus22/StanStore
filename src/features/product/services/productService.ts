import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';

export const getProducts = unstable_cache(
    async (): Promise<Product[]> => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data as Product[];
    },
    ['getProducts'],
    {
        revalidate: 3600,
        tags: ['products'],
    }
);

export const getProductById = unstable_cache(
    async (id: string): Promise<Product | null> => {
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
    },
    ['getProductById'],
    {
        revalidate: 3600,
        tags: ['products'],
    }
);
