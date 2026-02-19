'use client';

import styled from 'styled-components';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import Spinner from '@/components/Spinner';
import { Frown, TrendingUp } from 'lucide-react';
import { mockProducts } from '@/data/mockData';

const Container = styled.div`
  width: 100%;
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

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const QueryText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-style: italic;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text}99;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 20px;
  margin: 2rem 0;
`;

const EmptyIconWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1.5rem;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text}99;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const SuggestionSection = styled.div`
  margin-top: 3rem;
  width: 100%;
`;

const SuggestionTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface SearchResultsProps {
  query: string | null;
  products: Product[];
  loading: boolean;
}

export default function SearchResults({ query, products, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size={48} />
        <p>Buscando lo mejor del K-Pop...</p>
      </LoadingContainer>
    );
  }

  if (!query) {
    return (
      <EmptyStateContainer>
        <EmptyIconWrapper>
          <TrendingUp size={48} color="#10CFBD" />
        </EmptyIconWrapper>
        <EmptyTitle>¿Qué estás buscando hoy?</EmptyTitle>
        <EmptyText>Escribe el nombre de tu grupo o artista favorito para empezar.</EmptyText>
      </EmptyStateContainer>
    );
  }

  if (products.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Resultados para <QueryText>&ldquo;{query}&rdquo;</QueryText></Title>
        </Header>

        <EmptyStateContainer>
          <EmptyIconWrapper>
            <Frown size={48} color="#FF6B6B" />
          </EmptyIconWrapper>
          <EmptyTitle>Vaya, no hemos encontrado merch de ese artista 😢</EmptyTitle>
          <EmptyText>Intenta buscar con otro nombre o revisa nuestra sección de sugerencias.</EmptyText>
        </EmptyStateContainer>

        <SuggestionSection>
          <SuggestionTitle>
            <TrendingUp size={20} color="#10CFBD" />
            Quizás te interese
          </SuggestionTitle>
          <Grid>
            {mockProducts.slice(0, 3).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </Grid>
        </SuggestionSection>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Resultados para <QueryText>&ldquo;{query}&rdquo;</QueryText></Title>
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
