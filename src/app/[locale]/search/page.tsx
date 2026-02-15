'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styled from 'styled-components';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData';
import SearchResults from '@/components/SearchResults';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
`;

function SearchPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchResults() {
            if (!query) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Simulating network delay for "thinking" effect as requested
                await new Promise(resolve => setTimeout(resolve, 800));

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${query}%,artist.ilike.%${query}%,category.ilike.%${query}%`);

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.error('Search error:', error);
                // Fallback to filtering mock data if DB fails or is empty for demo
                const fallback = mockProducts.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.artist.toLowerCase().includes(query.toLowerCase())
                );
                setProducts(fallback);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    return (
        <PageContainer>
            <SearchResults query={query} products={products} loading={loading} />
        </PageContainer>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<PageContainer>Cargando buscador...</PageContainer>}>
            <SearchPageContent />
        </Suspense>
    );
}
