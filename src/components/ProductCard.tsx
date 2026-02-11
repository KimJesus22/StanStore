'use client';

import styled from 'styled-components';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative; /* Para posicionar elementos si fuera necesario */
  padding-bottom: 10px;

  &:hover {
    transform: translateY(-5px);
  }

  &:hover .add-to-cart-btn {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #fca5a5;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Artist = styled.span`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111;
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
  color: #10CFBD;
`;

const AddButton = styled.button`
  background-color: #111;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0; 
  transform: translateY(10px);
  transition: all 0.2s ease;
  
  /* Clase para el selector del hover del padre */
  &.add-to-cart-btn {
    /* Estado inicial */
  }

  &:hover {
    background-color: #10CFBD;
    transform: scale(1.1) !important;
  }
  
  /* En móvil, mostrar siempre */
  @media (max-width: 768px) {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegar al detalle del producto si se hace click en el botón
    addToCart(product);
    toast.success('Producto añadido correctamente', {
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

  return (
    <CardLink href={`/product/${product.id}`}>
      <Card>
        <ImageContainer>
          <img src={product.image_url} alt={product.name} loading="lazy" />
        </ImageContainer>
        <Artist>{product.artist}</Artist>
        <ProductName>{product.name}</ProductName>
        <Footer>
          <Price>${product.price.toFixed(2)}</Price>
          <AddButton
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            aria-label="Añadir al carrito"
          >
            <ShoppingBag size={16} />
          </AddButton>
        </Footer>
      </Card>
    </CardLink>
  );
}
