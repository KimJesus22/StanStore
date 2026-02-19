'use client';

import styled from 'styled-components';
import { Search, X } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

const SearchContainer = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  background: ${({ $isOpen, theme }) => ($isOpen ? theme.colors.secondaryBackground : 'transparent')};
  border-radius: 50px;
  padding: ${({ $isOpen }) => ($isOpen ? '0.25rem 0.5rem' : '0')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${({ $isOpen }) => ($isOpen ? '300px' : '44px')}; /* 44px base touch size */
  height: 44px; /* Ensure 44px height */
  overflow: hidden;
  border: ${({ $isOpen, theme }) => ($isOpen ? `1px solid ${theme.colors.border}` : '1px solid transparent')};
  margin-right: 0.5rem;

  @media (max-width: 640px) {
    width: 44px; /* Only show icon size on mobile */
    background: transparent;
    padding: 0;
    border: none;
    margin-right: 0;
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
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.secondaryBackground};
  }

  &:active {
    transform: scale(0.92);
  }

  svg {
    width: 20px;
    height: 20px;
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
  height: 100%;

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileSearchPanel = styled(motion.div)`
  position: absolute;
  top: 100%; /* Below header */
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: none;
  z-index: 99;

  @media (max-width: 640px) {
    display: block;
  }
`;

const MobileSearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 12px;
  padding: 0.75rem 1rem; /* Comfortable padding */
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MobileInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 0.75rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0,0,0,0.05);
  }
`;

export default function HeaderSearch() {
  const t = useTranslations('Navbar');
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const isSearching = query !== debouncedQuery && query.length > 0;

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useOnClickOutside([searchContainerRef, mobileSearchRef], () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  });

  useEffect(() => {
    if (isSearchOpen) {
      if (window.innerWidth <= 640) {
        // Small delay to ensure render
        setTimeout(() => mobileInputRef.current?.focus(), 50);
      } else {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (debouncedQuery) {
      router.push({ pathname: '/search', query: { q: debouncedQuery } });
    }
  }, [debouncedQuery, router]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    // Keep focus
    if (window.innerWidth <= 640) {
      mobileInputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <SearchContainer $isOpen={isSearchOpen} ref={searchContainerRef}>
        <label htmlFor="search-input" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
          {t('search')}
        </label>
        <IconWrapper onClick={toggleSearch} aria-label={t('search')}>
          <Search />
        </IconWrapper>
        <SearchInput
          id="search-input"
          $isOpen={isSearchOpen}
          placeholder={`${t('search')}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
        />
        {isSearchOpen && (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
            {isSearching ? (
              <Spinner size={16} color="#666" />
            ) : (
              query && (
                <ClearButton onClick={clearSearch} aria-label={t('clearSearch')} className="desktop-clear-btn" style={{ display: 'none' }}>
                  <X size={16} color="#555" />
                </ClearButton>
              )
            )}
          </div>
        )}
        <style jsx>{`
          @media (min-width: 641px) {
            .desktop-clear-btn { display: flex !important; }
          }
        `}</style>
      </SearchContainer>

      <AnimatePresence>
        {isSearchOpen && (
          <MobileSearchPanel
            ref={mobileSearchRef}
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.25, type: "spring", bounce: 0 }}
          >
            <MobileSearchInputWrapper>
              <Search size={20} color="#666" />
              <MobileInput
                ref={mobileInputRef}
                placeholder={`${t('search')}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('search')}
              />
              {isSearching ? (
                <Spinner size={18} color="#666" />
              ) : (
                query && (
                  <ClearButton onClick={clearSearch} aria-label={t('clearSearch')}>
                    <X size={18} color="#555" />
                  </ClearButton>
                )
              )}
            </MobileSearchInputWrapper>
          </MobileSearchPanel>
        )}
      </AnimatePresence>
    </>
  );
}
