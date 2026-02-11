'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styled from 'styled-components';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { Search, Frown, TrendingUp } from 'lucide-react';
import { mockProducts } from '@/data/mockData';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const QueryText = styled.span`
  color: #10CFBD;
  font-style: italic;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  color: #666;
`;

const SuggestionTitle = styled.h3`
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #111;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            if (!query) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
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

    if (loading) {
        return <Container><p style={{ textAlign: 'center' }}>Buscando resultados...</p></Container>;
    }

    if (!query) {
        return (
            <EmptyState>
                <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h2>Escribe algo para buscar</h2>
            </EmptyState>
        );
    }

    if (products.length === 0) {
        return (
            <>
                <Header>
                    <Title>Sin resultados para <QueryText>"{query}"</QueryText></Title>
                </Header>

                <EmptyState>
                    <Frown size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No encontramos productos que coincidan con tu búsqueda.</p>
                </EmptyState>

                <Container>
                    <SuggestionTitle>
                        <TrendingUp size={20} color="#10CFBD" />
                        Quizás te interese
                    </SuggestionTitle>
                    <Grid>
                        {mockProducts.slice(0, 3).map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </Grid>
                </Container>
            </>
        );
    }

    return (
        <Container>
            <Header>
                <Title>Resultados para <QueryText>"{query}"</QueryText></Title>
                <p>{products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
            </Header>

            <Grid>
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </Grid>
        </Container>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Container>Cargando...</Container>}>
            <SearchResults />
        </Suspense>
    );
}
