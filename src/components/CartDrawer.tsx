'use client';

import styled from 'styled-components';
import { useCartStore } from '@/store/useCartStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Drawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100%;
  background-color: #fff;
  z-index: 1000;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #111;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  margin-top: 3rem;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
  flex-shrink: 0;

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
  color: #111;
`;

const ItemArtist = styled.div`
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #10CFBD;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;

  &:hover {
    color: #ef4444;
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background-color: #fff;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
`;

const CheckoutButton = styled.button`
  width: 100%;
  background-color: #111;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #000;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, removeFromCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const { createCheckoutSession } = await import('@/app/actions/stripe');

      const { url, error } = await createCheckoutSession(
        items.map(item => ({ id: item.id, quantity: item.quantity }))
      );

      if (error) {
        toast.error('Error al iniciar el pago: ' + error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Overlay $isOpen={isCartOpen} onClick={closeCart} />
      <Drawer $isOpen={isCartOpen} onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Tu Carrito ({items.length})</Title>
          <CloseButton onClick={closeCart}>
            <X size={24} />
          </CloseButton>
        </Header>

        {items.length === 0 ? (
          <EmptyState>
            <ShoppingBag size={48} style={{ opacity: 0.2 }} />
            <p>Tu carrito está vacío</p>
          </EmptyState>
        ) : (
          <Content>
            {items.map((item) => (
              <CartItem key={item.id}>
                <ItemImage>
                  <img src={item.image_url} alt={item.name} />
                </ItemImage>
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemArtist>{item.artist}</ItemArtist>
                  <ItemPrice>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </ItemPrice>
                </ItemDetails>
                <RemoveButton
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={18} />
                </RemoveButton>
              </CartItem>
            ))}
          </Content>
        )}

        <Footer>
          <TotalRow>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </TotalRow>
          <CheckoutButton
            disabled={items.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? 'Redirigiendo...' : 'Pagar Ahora con Stripe'}
          </CheckoutButton>
        </Footer>
      </Drawer>
    </>
  );
}
