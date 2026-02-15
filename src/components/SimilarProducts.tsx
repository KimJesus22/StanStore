'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #a855f7, #ec4899);
        border-radius: 3px;
    }
`;

const ProductCard = styled.div`
    min-width: 200px;
    max-width: 200px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    scroll-snap-align: start;
    flex-shrink: 0;

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(168, 85, 247, 0.4);
        box-shadow: 0 8px 25px rgba(168, 85, 247, 0.15);
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
`;

const CardContent = styled.div`
    padding: 0.75rem;
`;

const ProductName = styled.h3`
    font-size: 0.85rem;
    font-weight: 600;
    color: #f1f1f1;
    margin-bottom: 0.25rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ArtistName = styled.p`
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.5rem;
`;

const Price = styled.span`
    font-size: 0.9rem;
    font-weight: 700;
    color: #a855f7;
`;

const SimilarityBadge = styled.span`
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(168, 85, 247, 0.15);
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
        rgba(255, 255, 255, 0.03) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.03) 100%
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
            <SectionTitle>✨ Quizás te guste...</SectionTitle>
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
                                        sizes="200px"
                                    />
                                </ImageWrapper>
                                <CardContent>
                                    <ProductName>{product.name}</ProductName>
                                    <ArtistName>{product.artist}</ArtistName>
                                    <Price>${product.price.toFixed(2)}</Price>
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
