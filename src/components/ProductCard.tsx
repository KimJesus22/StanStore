'use client';

import styled from 'styled-components';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { Link } from '@/navigation';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
`;

const Card = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  width: 100%;
  cursor: pointer;
  position: relative;
  padding-bottom: 10px;

  /* Remove CSS hover since we use framer motion, but keep child selector logic if needed */
  &:hover .add-to-cart-btn {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Artist = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text}; /* Removed opacity for max contrast */
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const Price = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const AddButton = styled(motion.button)`
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0; 
  /* transform is handled by class selector in CSS mostly, but we can animate scale with framer */
  
  &.add-to-cart-btn {
    /* Estado inicial controlable por CSS del padre */
  }

  /* En móvil, mostrar siempre */
  @media (max-width: 768px) {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface ProductCardProps {
  /**
   * El producto a mostrar en la tarjeta.
   */
  product: Product;
  /**
   * Índice para animación escalonada (staggered).
   */
  index?: number;
  /**
   * Si es true, muestra un estado de carga (skeleton).
   */
  isLoading?: boolean;
}

const SkeletonCard = styled.div`
  width: 100%;
  height: 350px;
  background-color: #f0f0f0;
  border-radius: 12px;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const OutOfStockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
  text-transform: uppercase;
  border-radius: 12px;
`;

export default function ProductCard({ product, index = 0, isLoading = false }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { convertPrice } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock > 0) {
      addToCart(product);
      toast.success(`✅ ${product.name} añadido al carrito`, {
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#10B981',
        },
      });
    } else {
      toast.error('Producto sin stock', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          fontWeight: 500,
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#EF4444',
        },
      });
    }
  };

  if (isLoading) {
    return <SkeletonCard />;
  }

  const isOutOfStock = product.stock === 0;
  const productUrl = `/product/${product.id}`;

  return (
    <Card
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={isOutOfStock ? '#' : productUrl} style={{ textDecoration: 'none', color: 'inherit', flex: 1, pointerEvents: isOutOfStock ? 'none' : 'auto' }}>
        <ImageContainer>
          {isOutOfStock && <OutOfStockOverlay>Agotado</OutOfStockOverlay>}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            priority={false}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ objectFit: 'contain', filter: isOutOfStock ? 'grayscale(100%)' : 'none' }}
          />
        </ImageContainer>
        <Artist>{product.artist}</Artist>
        <ProductName>{product.name}</ProductName>
      </Link>
      <Footer>
        <Price>{convertPrice(product.price)}</Price>
        {!isOutOfStock && (
          <AddButton
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            aria-label={`Añadir ${product.name} al carrito`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingBag size={16} />
          </AddButton>
        )}
      </Footer>
    </Card>
  );
}
