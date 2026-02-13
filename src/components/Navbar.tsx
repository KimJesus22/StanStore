'use client';

import styled from 'styled-components';
import { Search, ShoppingCart, User, Shield, X } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdmin } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  letter-spacing: -0.5px;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
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
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SearchContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ $isOpen, theme }) => ($isOpen ? theme.colors.secondaryBackground : 'transparent')};
  border-radius: 50px;
  padding: ${({ $isOpen }) => ($isOpen ? '0.5rem 1rem' : '0')};
  transition: all 0.3s ease;
  width: ${({ $isOpen }) => ($isOpen ? '300px' : '40px')};
  overflow: hidden;
  border: ${({ $isOpen, theme }) => ($isOpen ? `1px solid ${theme.colors.border}` : 'none')};

  @media (max-width: 640px) {
    width: ${({ $isOpen }) => ($isOpen ? '160px' : '40px')};
  }
`;

const SearchInput = styled.input<{ $isOpen: boolean }>`
  border: none;
  background: transparent;
  outline: none;
  margin-left: 0.5rem;
  width: 100%;
  font-size: 1rem;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  color: ${({ theme }) => theme.colors.text};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.2s 0.1s;
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
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
`;

const RelativeContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export default function Navbar() {
  const t = useTranslations('Navbar');
  const { items, toggleCart } = useCartStore();
  const { user, openAuthModal } = useAuthStore();
  const { isAdmin } = useAdmin();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Search Logic
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Effect to navigate on debounced query
  useEffect(() => {
    if (debouncedQuery) {
      router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery, router]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      openAuthModal();
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setQuery('');
    }
  };

  return (
    <Nav>
      <Logo href="/">StanStore</Logo>
      <IconsContainer>
        <LanguageSwitcher />

        <SearchContainer $isOpen={isSearchOpen}>
          <IconWrapper onClick={toggleSearch} aria-label={t('search')}>
            {isSearchOpen ? <Search size={20} color="#666" /> : <Search />}
          </IconWrapper>
          <SearchInput
            $isOpen={isSearchOpen}
            placeholder={`${t('search')}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputRef}
          />
          {isSearchOpen && query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#999" />
            </button>
          )}
        </SearchContainer>

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
