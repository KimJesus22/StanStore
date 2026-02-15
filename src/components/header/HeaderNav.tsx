'use client';

import styled from 'styled-components';
import { Link, useRouter } from '@/navigation';
import { ShoppingCart, User, Shield, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdmin } from '@/hooks/useAdmin';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

const NavContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const IconWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 44px; /* Touch target size */
  min-height: 44px; /* Touch target size */
  border-radius: 50%; /* Circular touch area */

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
  }

  &:active {
    transform: scale(0.92);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 0.7rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.background};
  pointer-events: none;
`;

const RelativeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export default function HeaderNav() {
    const t = useTranslations('Navbar');
    const { items, toggleCart } = useCartStore();
    const { user, openAuthModal } = useAuthStore();
    const { isAdmin } = useAdmin();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const handleProfileClick = () => {
        if (user) {
            router.push('/profile');
        } else {
            openAuthModal();
        }
    };

    return (
        <NavContainer>
            <IconWrapper as={Link} href="/artists" aria-label="Artistas" style={{ textDecoration: 'none' }}>
                <Music size={20} />
            </IconWrapper>

            <LanguageSwitcher />

            <IconWrapper aria-label={t('cart')} onClick={toggleCart}>
                <RelativeContainer>
                    <ShoppingCart />
                    {mounted && totalItems > 0 && <Badge>{totalItems}</Badge>}
                </RelativeContainer>
            </IconWrapper>

            {mounted ? (
                <>
                    {isAdmin && (
                        <IconWrapper
                            aria-label="Panel Administrador"
                            onClick={() => router.push('/admin')}
                            title="Panel de Administración"
                        >
                            <Shield />
                        </IconWrapper>
                    )}
                    <IconWrapper
                        aria-label={user ? t('profile') : "Iniciar Sesión"}
                        onClick={handleProfileClick}
                        title={user ? user.email || "Usuario" : "Iniciar Sesión"}
                    >
                        <User color={user ? "#00796B" : "#333"} />
                    </IconWrapper>
                </>
            ) : (
                <IconWrapper>
                    <User />
                </IconWrapper>
            )}
        </NavContainer>
    );
}
