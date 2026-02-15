'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { mockProducts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import { useTranslations } from 'next-intl';

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text}CC;
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1.1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1.1rem;
`;

export default function Home() {
    const t = useTranslations('Home');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Translate 'Todos' logic is a bit tricky if keys match categories. 
    // For now we keep 'Todos' as internal state key or translate it in display.
    // Ideally, CategoryFilter should probably handle 'All' translation.

    useEffect(() => {
        // Initial fetch
        const fetchProducts = async () => {
            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    console.warn('Supabase credentials missing. Using mock data.');
                    setProducts(mockProducts);
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*');

                if (error) {
                    console.error('Supabase query error:', error);
                    setProducts(mockProducts);
                } else if (data && data.length > 0) {
                    setProducts(data as Product[]);
                } else {
                    setProducts(mockProducts);
                }

            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const artists = useMemo(() => {
        // We want to prefix 'All' (translated) in the CategoryFilter, but we pass artists list
        const allArtists = products.map(p => p.artist);
        return Array.from(new Set(allArtists)).sort();
    }, [products]);

    const filteredProducts = products.filter((product) => {
        // Check if current selected is 'Todos' or translated 'All'
        // To simplify: we can assume 'Todos' is the "All" key internally if we don't translate state value
        if (selectedCategory === 'Todos' || selectedCategory === t('categoryAll')) return true;
        return product.artist === selectedCategory;
    });

    return (
        <Main>
            <Header>
                <Title>{t('title')}</Title>
                <Subtitle>{t('subtitle')}</Subtitle>
            </Header>

            {loading ? (
                <LoadingState>{t('loading')}</LoadingState>
            ) : (
                <>
                    <CategoryFilter
                        categories={artists}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        allLabel={t('categoryAll')} // Pass translation ref if component supports it
                    />

                    {filteredProducts.length > 0 ? (
                        <Grid>
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </Grid>
                    ) : (
                        <NoResults>{t('noResults')}</NoResults>
                    )}
                </>
            )}
        </Main>
    );
}
