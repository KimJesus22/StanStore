'use client';

import styled from 'styled-components';
import { useCartStore } from '@/store/useCartStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Drawer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1000;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
    color: ${({ theme }) => theme.colors.primary};
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
  color: ${({ theme }) => theme.colors.text}80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const CartItem = styled(motion.div)`
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
  color: ${({ theme }) => theme.colors.text}90;
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
  color: ${({ theme }) => theme.colors.text}60;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;

  &:hover {
    color: #ef4444; /* Keep red for destructive action */
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  padding: 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TermsCheckbox = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  
  input {
    margin-top: 0.25rem;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.primary};
  }

  label {
    cursor: pointer;
    line-height: 1.4;
  }
`;

export default function CartDrawer() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { isCartOpen, closeCart, items, removeFromCart } = useCartStore();
  const { convertPrice } = useCurrency();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    closeCart();
    router.push(`/${locale}/checkout`);
  };



  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <Drawer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>{t('title')} ({items.length})</Title>
              <CloseButton onClick={closeCart}>
                <X size={24} />
              </CloseButton>
            </Header>

            {items.length === 0 ? (
              <EmptyState>
                <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                <p>{t('empty')}</p>
              </EmptyState>
            ) : (
              <Content>
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ItemImage>
                        <Image
                          src={item.image_url}
                          alt={item.name}
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
                          {convertPrice(item.price)} x {item.quantity}
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
                </AnimatePresence>
              </Content>
            )}

            <Footer>
              <TotalRow>
                <span>{t('total')}</span>
                <span>{convertPrice(total)}</span>
              </TotalRow>

              <TermsCheckbox>
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Términos y Condiciones</a> y reconozco que esta acción constituye una <strong>Firma Digital</strong> válida.
                </label>
              </TermsCheckbox>

              <CheckoutButton
                disabled={items.length === 0 || !acceptedTerms}
                onClick={handleCheckout}
                whileHover={{ scale: 1.02, backgroundColor: '#000' }}
                whileTap={{ scale: 0.98 }}
              >
                {t('checkout')}
              </CheckoutButton>
            </Footer>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
}
