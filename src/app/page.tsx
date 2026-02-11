'use client';

import styled from 'styled-components';
import { mockProducts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';

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
  gap: 2rem; /* Espacio entre tarjetas */
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en móviles pequeños */
    gap: 1rem;
  }
`;

export default function Home() {
  return (
    <Main>
      <Header>
        <Title>Novedades</Title>
        <Subtitle>Lo último de tus artistas favoritos</Subtitle>
      </Header>

      <Grid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    </Main>
  );
}
