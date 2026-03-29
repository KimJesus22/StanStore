'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';

interface UseProductsOptions {
    sort: string;
    artists: string[];
    categories: string[];
    stock: boolean;
    price: { min: string; max: string };
    initialProducts?: Product[];
}

export function useProducts({ sort, artists, categories, stock, price, initialProducts }: UseProductsOptions) {
    const [allProducts, setAllProducts] = useState<Product[]>(initialProducts ?? []);
    const [loading, setLoading] = useState(!initialProducts);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase query error:', error);
                setAllProducts(mockProducts);
            } else {
                setAllProducts(data as Product[]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setAllProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialProducts) return;
        fetchProducts();
    }, [initialProducts, fetchProducts]);

    const products = useMemo(() => {
        let result = allProducts;

        if (artists.length > 0) {
            result = result.filter((p) => artists.includes(p.artist));
        }
        if (categories.length > 0) {
            result = result.filter((p) => categories.includes(p.category));
        }
        if (stock) {
            result = result.filter((p) => p.stock > 0);
        }
        if (price.min) {
            result = result.filter((p) => p.price >= parseFloat(price.min));
        }
        if (price.max) {
            result = result.filter((p) => p.price <= parseFloat(price.max));
        }

        const sorted = [...result];
        switch (sort) {
            case 'price_asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'alphabetical':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                sorted.sort((a, b) =>
                    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
                );
                break;
        }

        return sorted;
    }, [allProducts, sort, artists, categories, stock, price.min, price.max]);

    return { products, loading };
}
