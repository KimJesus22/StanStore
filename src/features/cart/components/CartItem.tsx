'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';
import { useCurrency } from '@/context/CurrencyContext';
import { useCartStore, CartItem as CartItemType } from '../stores/useCartStore';

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const ItemContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ItemArtist = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text}CC;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text}99;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;

  &:hover {
    color: #ef4444; /* Keep red for destructive action */
  }
`;

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { removeFromCart } = useCartStore();
    const { formatPrice } = useCurrency();

    return (
        <ItemContainer
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
        >
            <ItemImage>
                <ProductImage
                    src={item.image_url}
                    product={item}
                    fill
                    sizes="80px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    style={{ objectFit: 'cover' }}
                />
            </ItemImage>
            <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemArtist>{item.artist}</ItemArtist>
                <ItemPrice>
                    {formatPrice(item.price)} x {item.quantity}
                </ItemPrice>
            </ItemDetails>
            <RemoveButton
                onClick={() => removeFromCart(item.id)}
                aria-label={`Eliminar ${item.name} del carrito`}
            >
                <Trash2 size={18} />
            </RemoveButton>
        </ItemContainer>
    );
}
