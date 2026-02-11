'use client';

import styled from 'styled-components';
import { Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  letter-spacing: -0.5px;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const IconWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }

  /* Ajuste de tamaño para móviles si es necesario */
  svg {
    width: 24px;
    height: 24px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444; /* Rojo vibrante */
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #fff;
`;

const RelativeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

import { useAuthStore } from '@/store/useAuthStore';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const { user, openAuthModal, signOut } = useAuthStore();
  const { isAdmin } = useAdmin();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <Nav>
      <Logo href="/">StanStore</Logo>
      <IconsContainer>
        <IconWrapper aria-label="Buscar">
          <Search />
        </IconWrapper>
        <IconWrapper aria-label="Carrito" onClick={toggleCart}>
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
              aria-label={user ? "Mi Perfil" : "Iniciar Sesión"}
              onClick={handleProfileClick}
              title={user ? user.email || "Usuario" : "Iniciar Sesión"}
            >
              <User color={user ? "#10CFBD" : "#333"} />
            </IconWrapper>
          </>
        ) : (
          <IconWrapper>
            <User />
          </IconWrapper>
        )}
      </IconsContainer>
    </Nav>
  );
}
