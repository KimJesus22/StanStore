'use client';
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCartStore } from '@/store/useCartStore';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import SimilarProducts from './SimilarProducts';
import { verifyPurchase } from '@/app/actions/reviews';
import { useCurrency } from '@/context/CurrencyContext';

const BLUR_DATA_URL = "data:image/png;base664,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: flex;
  gap: 4rem;
  min-height: 80vh;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem 1rem;
    gap: 2rem;
  }
`;

const ImageWrapper = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  aspect-ratio: 1 / 1;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const InfoWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text}80;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 2rem;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Artist = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text}80;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
`;

const ProductName = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
  line-height: 1.1;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text}90;
  margin-bottom: 3rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50px;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const QtyButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QtyValue = styled.span`
  width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  height: 56px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: transform 0.2s, background-color 0.2s;
  padding: 0 2rem;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const StockBadge = styled.div`
  display: inline-block;
  background-color: #fff0f0;
  color: #e53e3e;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  border: 1px solid #fed7d7;
`;



import SpotifyPlayer from './SpotifyPlayer';
import ArtistInfo from './ArtistInfo';
import TrackPreviews from './TrackPreviews';
import YouTubePlayer from './YouTubePlayer';
import FanModeEffects from './FanModeEffects';
import { Sparkles } from 'lucide-react';

const FanButton = styled.button<{ $isActive: boolean, $themeColor?: string }>`
  background: ${props => props.$isActive ? (props.$themeColor || '#10CFBD') : 'transparent'};
  color: ${props => props.$isActive ? '#fff' : (props.$themeColor || '#10CFBD')};
  border: 2px solid ${props => props.$themeColor || '#10CFBD'};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
      transform: scale(1.05);
      background: ${props => props.$themeColor || '#10CFBD'};
      color: #fff;
  }
`;

export default function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations('Product');
  const addToCart = useCartStore((state) => state.addToCart);
  const { convertPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(product?.stock || 0);
  const [canReview, setCanReview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFanMode, setIsFanMode] = useState(false);

  useEffect(() => {
    const checkUserEligibility = async () => {
      if (!product) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const purchased = await verifyPurchase(product.id, user.id);
        setCanReview(purchased);
      }
    };

    checkUserEligibility();
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const channel = supabase
      .channel(`product-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`,
        },
        (payload) => {
          console.log('Stock updated:', payload);
          if (payload.new && typeof payload.new.stock === 'number') {
            setCurrentStock(payload.new.stock);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next > currentStock) {
        toast.error(t('stockLimit', { stock: currentStock }));
        return prev;
      }
      return Math.max(1, next);
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > currentStock) {
      toast.error(t('stockLimit', { stock: currentStock }));
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    toast.success(t('addedToCart', { quantity, count: quantity }), {
      style: {
        border: '1px solid #10CFBD',
        padding: '16px',
        color: '#111',
      },
      iconTheme: {
        primary: '#10CFBD',
        secondary: '#FFFAEE',
      },
    });
  };

  if (!product) {
    return (
      <NotFoundContainer>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{t('notFound')}</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>{t('notFoundMessage')}</p>
        <Link href="/" passHref>
          <AddToCartButton as="a" style={{ display: 'inline-flex', maxWidth: '200px' }}>
            {t('backHome')}
          </AddToCartButton>
        </Link>
      </NotFoundContainer>
    );
  }

  const isOutOfStock = currentStock === 0;

  return (
    <Container>
      <FanModeEffects
        isActive={isFanMode}
        artist={product.artist}
        themeColor={product.theme_color}
      />

      <ImageWrapper>
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          style={{ objectFit: 'cover' }}
        />
      </ImageWrapper>

      <InfoWrapper>
        <BackLink href="/">
          <ArrowLeft size={20} />
          {t('back')}
        </BackLink>

        {product.theme_color && (
          <FanButton
            onClick={() => setIsFanMode(!isFanMode)}
            $isActive={isFanMode}
            $themeColor={product.theme_color}
          >
            <Sparkles size={18} />
            {isFanMode ? 'MODO FAN ACTIVADO' : 'ACTIVAR MODO FAN'}
          </FanButton>
        )}

        <Artist>{product.artist}</Artist>
        <ProductName>{product.name}</ProductName>

        {currentStock > 0 && currentStock < 10 && (
          <StockBadge>
            {t('onlyLeft', { count: currentStock })}
          </StockBadge>
        )}

        <Price>{convertPrice(product.price)}</Price>

        <Description>
          {product.description || "Sin descripción disponible para este producto."}
        </Description>

        <Controls>
          <QuantitySelector>
            <QtyButton
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isOutOfStock}
            >
              <Minus size={18} />
            </QtyButton>
            <QtyValue>{isOutOfStock ? 0 : quantity}</QtyValue>
            <QtyButton
              onClick={() => handleQuantityChange(1)}
              disabled={isOutOfStock || quantity >= currentStock}
            >
              <Plus size={18} />
            </QtyButton>
          </QuantitySelector>

          <AddToCartButton
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={20} />
            {isOutOfStock ? t('outOfStock') : t('addToCart')}
          </AddToCartButton>
        </Controls>

        {product.spotify_album_id && (
          <SpotifyPlayer albumId={product.spotify_album_id} />
        )}

        {product.spotify_album_id && (
          <TrackPreviews albumId={product.spotify_album_id} />
        )}

        <ArtistInfo artistName={product.artist} />

        {product.youtube_video_id && (
          <YouTubePlayer videoId={product.youtube_video_id} />
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Opiniones de los fans</h2>

          {canReview && userId && (
            <ReviewForm
              productId={product.id}
              userId={userId}
              onReviewSubmitted={() => {
                setCanReview(false);
                toast.success('¡Reseña enviada!');
              }}
            />
          )}

          <ReviewList productId={product.id} />

          <SimilarProducts productId={product.id} />
        </div>

      </InfoWrapper>
    </Container>
  );
}
