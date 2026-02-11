'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { mockProducts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Extract unique artists for the filter
  // We remove duplicates and sort them
  const artists = useMemo(() => {
    const allArtists = mockProducts.map(p => p.artist);
    return Array.from(new Set(allArtists)).sort();
  }, []);

  const filteredProducts = mockProducts.filter((product) => {
    if (selectedCategory === 'Todos') return true;
    return product.artist === selectedCategory;
  });

  return (
    <Main>
      <Header>
        <Title>Novedades</Title>
        <Subtitle>Lo último de tus artistas favoritos</Subtitle>
      </Header>

      <CategoryFilter
        categories={artists}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredProducts.length > 0 ? (
        <Grid>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      ) : (
        <NoResults>No se encontraron productos para esta categoría.</NoResults>
      )}
    </Main>
  );
}
