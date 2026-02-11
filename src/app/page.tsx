'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { mockProducts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';
import toast from 'react-hot-toast';

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
  color: #111;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
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
  color: #666;
  font-size: 1.1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: #888;
  font-size: 1.1rem;
`;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Validation for build time / missing env vars
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
          // Fallback to mock data on error (e.g. table doesn't exist yet)
          setProducts(mockProducts);
        } else if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // Fallback if table is empty
          setProducts(mockProducts);
        }

      } catch (error) {
        console.error('Error fetching products:', error);
        // Silent fallback instead of toast on init to avoid hydration mismatch/flash
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique artists for the filter from the actual products loaded
  const artists = useMemo(() => {
    const allArtists = products.map(p => p.artist);
    return Array.from(new Set(allArtists)).sort();
  }, [products]);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'Todos') return true;
    return product.artist === selectedCategory;
  });

  return (
    <Main>
      <Header>
        <Title>Novedades</Title>
        <Subtitle>Lo último de tus artistas favoritos</Subtitle>
      </Header>

      {loading ? (
        <LoadingState>Cargando productos...</LoadingState>
      ) : (
        <>
          <CategoryFilter
            categories={artists}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {filteredProducts.length > 0 ? (
            <Grid>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </Grid>
          ) : (
            <NoResults>No se encontraron productos para esta categoría.</NoResults>
          )}
        </>
      )}
    </Main>
  );
}
