'use client';

import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getRecommendationCriteria } from '@/lib/recommendations';
import { useCurrency } from '@/context/CurrencyContext';
import type { Product } from '@/types';

// ── Constantes ────────────────────────────────────────────────────────────────

const LIMIT = 4;

type RecoProduct = Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'artist' | 'category'>;
type Mode = 'personalized' | 'fallback';

// ── Queries ───────────────────────────────────────────────────────────────────

async function fetchPersonalized(
  targetArtist: string | null,
  targetCategory: string | null,
  excludeIds: string[],
): Promise<RecoProduct[]> {
  const applyExclude = (q: ReturnType<typeof supabase.from>) =>
    excludeIds.length > 0
      ? q.not('id', 'in', `(${excludeIds.join(',')})`)
      : q;

  if (targetArtist) {
    const { data } = await applyExclude(
      supabase
        .from('products')
        .select('id, name, price, image_url, artist, category')
        .eq('artist', targetArtist)
        .gt('stock', 0)
        .limit(LIMIT),
    );
    if (data && data.length > 0) return data as RecoProduct[];
  }

  if (targetCategory) {
    const { data } = await applyExclude(
      supabase
        .from('products')
        .select('id, name, price, image_url, artist, category')
        .eq('category', targetCategory)
        .gt('stock', 0)
        .limit(LIMIT),
    );
    if (data && data.length > 0) return data as RecoProduct[];
  }

  return [];
}

async function fetchFallback(): Promise<RecoProduct[]> {
  // Primero intenta novedades
  const { data: newData } = await supabase
    .from('products')
    .select('id, name, price, image_url, artist, category')
    .eq('is_new', true)
    .gt('stock', 0)
    .limit(LIMIT);

  if (newData && newData.length > 0) return newData as RecoProduct[];

  // Si no hay novedades, devuelve los 4 primeros en stock
  const { data } = await supabase
    .from('products')
    .select('id, name, price, image_url, artist, category')
    .gt('stock', 0)
    .limit(LIMIT);

  return (data ?? []) as RecoProduct[];
}

// ── Styled components ─────────────────────────────────────────────────────────

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Section = styled.section`
  margin-top: 4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Badge = styled.span<{ $mode: Mode }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  background: ${({ $mode, theme }) =>
    $mode === 'personalized'
      ? theme.colors.primary + '18'
      : theme.colors.secondaryBackground};
  color: ${({ $mode, theme }) =>
    $mode === 'personalized'
      ? theme.colors.primary
      : theme.colors.textMuted};
  border: 1px solid ${({ $mode, theme }) =>
    $mode === 'personalized'
      ? theme.colors.primary + '40'
      : theme.colors.border};
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: -0.75rem 0 1.5rem;
`;

const ScrollContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    /* Carrusel horizontal en móvil */
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 0.75rem;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar { display: none; }
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  @media (max-width: 480px) {
    min-width: 180px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: ${({ theme }) => theme.colors.secondaryBackground};
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 0.75rem;
`;

const ProductName = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.2rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArtistName = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 0.5rem;
`;

const PriceText = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const SkeletonCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.secondaryBackground} 0%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.secondaryBackground} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  aspect-ratio: 1 / 1.4;

  @media (max-width: 480px) {
    min-width: 180px;
    flex-shrink: 0;
  }
`;

// ── Componente ────────────────────────────────────────────────────────────────

export default function PersonalizedRecommendations() {
  const locale             = useLocale();
  const { formatPrice }    = useCurrency();
  const { items: history } = useRecentlyViewed();

  const criteria = useMemo(() => getRecommendationCriteria(history), [history]);

  const [products, setProducts] = useState<RecoProduct[]>([]);
  const [mode, setMode]         = useState<Mode>('fallback');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      if (history.length > 0) {
        const recs = await fetchPersonalized(
          criteria.targetArtist,
          criteria.targetCategory,
          criteria.excludeIds,
        );
        if (!cancelled) {
          if (recs.length > 0) {
            setProducts(recs);
            setMode('personalized');
          } else {
            // El artista/categoría no tiene más productos → fallback
            const fb = await fetchFallback();
            if (!cancelled) { setProducts(fb); setMode('fallback'); }
          }
        }
      } else {
        const fb = await fetchFallback();
        if (!cancelled) { setProducts(fb); setMode('fallback'); }
      }

      if (!cancelled) setLoading(false);
    };

    run().catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length, criteria.targetArtist, criteria.targetCategory]);

  // No renderizar si ya terminó y no hay nada
  if (!loading && products.length === 0) return null;

  const title    = mode === 'personalized' ? 'Basado en lo que te gusta' : 'Lo más nuevo';
  const subtitle = mode === 'personalized' && criteria.targetArtist
    ? `Más productos de ${criteria.targetArtist} que podrían interesarte`
    : 'Descubre los últimos lanzamientos';

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        <Badge $mode={mode}>
          {mode === 'personalized'
            ? <><Sparkles size={10} /> Para ti</>
            : <><TrendingUp size={10} /> Novedades</>}
        </Badge>
      </SectionHeader>

      <Subtitle>{subtitle}</Subtitle>

      <ScrollContainer>
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/product/${p.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card>
                  <ImageWrapper>
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 480px) 180px, (max-width: 900px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </ImageWrapper>
                  <CardContent>
                    <ProductName>{p.name}</ProductName>
                    <ArtistName>{p.artist}</ArtistName>
                    <PriceText>{formatPrice(p.price)}</PriceText>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </ScrollContainer>
    </Section>
  );
}
