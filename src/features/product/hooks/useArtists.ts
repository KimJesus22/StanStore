'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { mockProducts } from '@/data/mockData';

export function useArtists() {
    const [artists, setArtists] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const { data } = await supabase.from('products').select('artist');
                if (data) {
                    const unique = Array.from(new Set(data.map(p => p.artist))).sort();
                    setArtists(unique);
                } else {
                    const unique = Array.from(new Set(mockProducts.map(p => p.artist))).sort();
                    setArtists(unique);
                }
            } catch (error) {
                console.error('Error fetching artists:', error);
                const unique = Array.from(new Set(mockProducts.map(p => p.artist))).sort();
                setArtists(unique);
            } finally {
                setLoading(false);
            }
        };
        fetchArtists();
    }, []);

    return { artists, loading };
}
