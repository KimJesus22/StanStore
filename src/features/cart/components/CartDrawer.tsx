'use client';

import styled from 'styled-components';
import { useCartStore } from '../stores/useCartStore';
import { useCart } from '../hooks/useCart';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';
import CartItem from './CartItem';
import { Link } from '@/navigation';

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
  min-width: 44px;
  min-height: 44px;
  padding: 0.625rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.border};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
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

const ContinueShoppingButton = styled.button`
  width: 100%;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border}; /* Subtle border */
  padding: 0.75rem;
  border-radius: 50px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
    border-color: ${({ theme }) => theme.colors.text};
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
  const { isCartOpen, closeCart } = useCartStore();
  const { data: serverItems, isLoading } = useCart();

  // Fallback to empty array if undefined
  const items = serverItems || [];

  const { formatPrice } = useCurrency();
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
              <CloseButton onClick={closeCart} aria-label={t('close')}>
                <X size={24} />
              </CloseButton>
            </Header>

            {isLoading ? (
              <EmptyState>
                <Loader2 className="animate-spin" size={48} style={{ opacity: 0.2 }} />
                <p>Cargando carrito...</p>
              </EmptyState>
            ) : items.length === 0 ? (
              <EmptyState>
                <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                <p>{t('empty')}</p>
              </EmptyState>
            ) : (
              <Content>
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </Content>
            )}

            <Footer>
              <TotalRow>
                <span>{t('total')}</span>
                <span>{formatPrice(total)}</span>
              </TotalRow>

              <TermsCheckbox>
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  Acepto los <Link href="/terms" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Términos y Condiciones</Link> y reconozco que esta acción constituye una <strong>Firma Digital</strong> válida.
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

              <ContinueShoppingButton onClick={closeCart}>
                Seguir comprando
              </ContinueShoppingButton>
            </Footer>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
}
