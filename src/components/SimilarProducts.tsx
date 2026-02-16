'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCurrency } from '@/context/CurrencyContext';

interface SimilarProduct {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    artist: string;
    similarity: number;
}

const Section = styled.section`
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
`;

const ScrollContainer = styled.div`
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    scroll-snap-type: x mandatory;

    &::-webkit-scrollbar {
        height: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.border};
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.primary};
        border-radius: 3px;
    }
`;

const ProductCard = styled.div`
    min-width: 200px;
    max-width: 200px;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    scroll-snap-align: start;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);

    &:hover {
        transform: translateY(-4px);
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.secondaryBackground};
`;

const CardContent = styled.div`
    padding: 0.75rem;
`;

const ProductName = styled.h3`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.25rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ArtistName = styled.p`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    margin-bottom: 0.5rem;
`;

const Price = styled.span`
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
`;

const SimilarityBadge = styled.span`
    font-size: 0.65rem;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.secondaryBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 2px 6px;
    border-radius: 8px;
    float: right;
    margin-top: 2px;
`;

const LoadingShimmer = styled.div`
    min-width: 200px;
    height: 280px;
    background: linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.secondaryBackground} 0%,
        ${({ theme }) => theme.colors.border} 50%,
        ${({ theme }) => theme.colors.secondaryBackground} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 16px;
    flex-shrink: 0;

    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`;

export default function SimilarProducts({ productId }: { productId: string }) {
    const [products, setProducts] = useState<SimilarProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const locale = useLocale();
    const t = useTranslations('Product');
    const { formatPrice } = useCurrency();

    useEffect(() => {
        async function fetchSimilar() {
            try {
                const res = await fetch(`/api/products/similar?productId=${productId}&limit=4`);
                const data = await res.json();
                if (data.similar && data.similar.length > 0) {
                    setProducts(data.similar);
                }
            } catch (err) {
                console.error('Error fetching similar products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchSimilar();
    }, [productId]);

    if (!loading && products.length === 0) {
        return null; // No mostrar sección si no hay recomendaciones
    }

    return (
        <Section>
            <SectionTitle>{t('similarProducts')}</SectionTitle>
            <ScrollContainer>
                {loading ? (
                    <>
                        <LoadingShimmer />
                        <LoadingShimmer />
                        <LoadingShimmer />
                    </>
                ) : (
                    products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/${locale}/product/${product.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <ProductCard>
                                <ImageWrapper>
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 150px, 200px"
                                    />
                                </ImageWrapper>
                                <CardContent>
                                    <ProductName>{product.name}</ProductName>
                                    <ArtistName>{product.artist}</ArtistName>
                                    <Price>{formatPrice(product.price)}</Price>
                                    <SimilarityBadge>
                                        {Math.round(product.similarity * 100)}% match
                                    </SimilarityBadge>
                                </CardContent>
                            </ProductCard>
                        </Link>
                    ))
                )}
            </ScrollContainer>
        </Section>
    );
}
