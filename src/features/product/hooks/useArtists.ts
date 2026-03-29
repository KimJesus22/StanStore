'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';

export function useArtists(initialProducts?: Product[]) {
    const derived = useMemo(
        () =>
            initialProducts
                ? Array.from(new Set(initialProducts.map((p) => p.artist))).sort()
                : null,
        [initialProducts],
    );

    const [artists, setArtists] = useState<string[]>(derived ?? []);
    const [loading, setLoading] = useState(!derived);

    useEffect(() => {
        if (derived !== null) {
            setArtists(derived);
            setLoading(false);
            return;
        }

        const fetchArtists = async () => {
            try {
                const { data } = await supabase.from('products').select('artist');
                if (data) {
                    const unique = Array.from(new Set(data.map((p) => p.artist))).sort();
                    setArtists(unique);
                } else {
                    const unique = Array.from(new Set(mockProducts.map((p) => p.artist))).sort();
                    setArtists(unique);
                }
            } catch (error) {
                console.error('Error fetching artists:', error);
                const unique = Array.from(new Set(mockProducts.map((p) => p.artist))).sort();
                setArtists(unique);
            } finally {
                setLoading(false);
            }
        };
        fetchArtists();
    }, [derived]);

    return { artists, loading };
}
