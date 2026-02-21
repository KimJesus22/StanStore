'use client';

import styled from 'styled-components';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import Spinner from '@/components/ui/Spinner';
import { TrendingUp } from 'lucide-react';
import { mockProducts } from '@/data/mockData';
import { useTranslations } from 'next-intl';
import EmptyState from '@/components/ui/EmptyState';
import { SearchEmpty } from '@/components/illustrations';
import { Link } from '@/navigation';

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
  const tEmpty = useTranslations('EmptyStates');

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
      <EmptyState
        icon={<SearchEmpty />}
        title={tEmpty('searchNoQueryTitle')}
        description={tEmpty('searchNoQueryDesc')}
      />
    );
  }

  if (products.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Resultados para <QueryText>&ldquo;{query}&rdquo;</QueryText></Title>
        </Header>

        <EmptyState
          icon={<SearchEmpty />}
          title={tEmpty('searchTitle', { query })}
          description={tEmpty('searchDesc')}
          action={
            <Link
              href="/"
              className="inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
            >
              {tEmpty('searchAction')}
            </Link>
          }
        />

        {/* Categorías sugeridas */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['album', 'merch', 'lightstick'].map((cat) => (
            <Link
              key={cat}
              href={`/?category=${cat}` as '/'}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-black hover:text-black dark:border-gray-700 dark:text-gray-400 dark:hover:border-white dark:hover:text-white"
            >
              {cat === 'album' ? 'Álbumes' : cat === 'merch' ? 'Ropa' : 'Accesorios'}
            </Link>
          ))}
        </div>

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
