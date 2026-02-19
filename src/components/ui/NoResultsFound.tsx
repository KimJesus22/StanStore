'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { ProductCard } from '@/features/product';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockData'; // Using mock as fallback for now

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1rem;
  width: 100%;
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.text}99;
  margin-bottom: 2rem;
  max-width: 400px;
`;

const ResetButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const PopularSection = styled.div`
  margin-top: 4rem;
  width: 100%;
  text-align: left;
`;

const PopularTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
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

interface NoResultsFoundProps {
  onReset: () => void;
}

export default function NoResultsFound({ onReset }: NoResultsFoundProps) {
  const t = useTranslations('Home.noResults');
  const popularProducts = mockProducts.slice(0, 4); // Show 4 random items

  return (
    <Container>
      <IconWrapper>🔍</IconWrapper>
      <Title>{t('title')}</Title>
      <Message>{t('message')}</Message>
      <ResetButton onClick={onReset}>{t('reset')}</ResetButton>

      <PopularSection>
        <PopularTitle>{t('popular')}</PopularTitle>
        <Grid>
          {popularProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </Grid>
      </PopularSection>
    </Container>
  );
}
