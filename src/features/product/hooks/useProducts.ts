import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';

interface UseProductsOptions {
    sort: string;
    artists: string[];
    categories: string[];
    stock: boolean;
    price: { min: string; max: string };
}

export function useProducts({ sort, artists, categories, stock, price }: UseProductsOptions) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('products').select('*');

            if (artists.length > 0) {
                query = query.in('artist', artists);
            }
            if (categories.length > 0) {
                query = query.in('category', categories);
            }
            if (stock) {
                query = query.gt('stock', 0);
            }
            if (price.min) {
                query = query.gte('price', parseFloat(price.min));
            }
            if (price.max) {
                query = query.lte('price', parseFloat(price.max));
            }

            switch (sort) {
                case 'price_asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'alphabetical':
                    query = query.order('name', { ascending: true });
                    break;
                case 'newest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', error);
                setProducts(mockProducts);
            } else {
                setProducts(data as Product[]);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    }, [sort, artists, categories, stock, price.min, price.max]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading };
}
