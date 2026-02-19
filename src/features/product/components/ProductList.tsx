'use client';

import styled from 'styled-components';
import ProductCard from './ProductCard';
import ProductSkeleton from '@/components/ui/ProductSkeleton';
import NoResultsFound from '@/components/ui/NoResultsFound';
import { Product } from '@/types';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

interface ProductListProps {
    products: Product[];
    loading: boolean;
    onReset: () => void;
}

export default function ProductList({ products, loading, onReset }: ProductListProps) {
    if (loading) {
        return (
            <Grid>
                {Array.from({ length: 6 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </Grid>
        );
    }

    if (products.length === 0) {
        return <NoResultsFound onReset={onReset} />;
    }

    return (
        <Grid>
            {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} priority={index < 4} />
            ))}
        </Grid>
    );
}
