'use client';

import styled from 'styled-components';
import { Search, X } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabaseClient';
import { getSearchSuggestions } from '@/app/actions/search';
import type { SearchProduct } from '@/app/actions/search';
import SearchDropdown from './SearchDropdown';

// ── Styled components ─────────────────────────────────────────────────────────

/**
 * Wrapper exterior con overflow visible para que el dropdown no quede recortado.
 * SearchContainer tiene overflow:hidden para la animación de expansión,
 * por lo que el dropdown vive aquí, fuera de ese contenedor.
 */
const SearchWrapper = styled.div`
  position: relative;
`;

const SearchContainer = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  background: ${({ $isOpen, theme }) => ($isOpen ? theme.colors.secondaryBackground : 'transparent')};
  border-radius: 50px;
  padding: ${({ $isOpen }) => ($isOpen ? '0.25rem 0.5rem' : '0')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${({ $isOpen }) => ($isOpen ? '300px' : '44px')};
  height: 44px;
  overflow: hidden;
  border: ${({ $isOpen, theme }) => ($isOpen ? `1px solid ${theme.colors.border}` : '1px solid transparent')};
  margin-right: 0.5rem;

  @media (max-width: 640px) {
    width: 44px;
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
  &:active { transform: scale(0.92); }
  svg { width: 20px; height: 20px; }
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

  @media (max-width: 640px) { display: none; }
`;

const MobileSearchPanel = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: none;
  z-index: 200;

  @media (max-width: 640px) { display: block; }
`;

const MobileSearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  border-radius: 12px;
  padding: 0.75rem 1rem;
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

const MobileSuggestionsWrapper = styled.div`
  margin-top: 0.75rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
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
  &:hover { background-color: rgba(0,0,0,0.05); }
`;

// ── Componente ────────────────────────────────────────────────────────────────

export default function HeaderSearch() {
  const t = useTranslations('Navbar');
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [products, setProducts]         = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [activeIndex, setActiveIndex]   = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const isSearching    = (query !== debouncedQuery && query.length > 0) || isLoading;
  const totalItems     = suggestions.length + products.length;
  const showDropdown   = isSearchOpen && debouncedQuery.length >= 2 && totalItems > 0;

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef  = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  const mobileInputRef   = useRef<HTMLInputElement>(null);

  // ── Handlers (declarados antes de los hooks que los referencian) ──────────────

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setQuery('');
    setSuggestions([]);
    setProducts([]);
    setActiveIndex(-1);
  }, []);

  // Cierra al hacer clic fuera de la barra de búsqueda
  useOnClickOutside([searchWrapperRef, mobileSearchRef], () => {
    if (isSearchOpen) closeSearch();
  });

  // Auto-focus al abrir
  useEffect(() => {
    if (!isSearchOpen) return;
    const delay = setTimeout(() => {
      (window.innerWidth <= 640 ? mobileInputRef : inputRef).current?.focus();
    }, 50);
    return () => clearTimeout(delay);
  }, [isSearchOpen]);

  // Fetch sugerencias + productos fuzzy en paralelo (Server Action)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setProducts([]);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getSearchSuggestions(debouncedQuery)
      .then(({ suggestions: s, products: p }) => {
        if (!cancelled) {
          setSuggestions(s);
          setProducts(p);
          setActiveIndex(-1);
          setIsLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Navega a resultados y registra la búsqueda en el historial
  useEffect(() => {
    if (!debouncedQuery) return;
    router.push({ pathname: '/search', query: { q: debouncedQuery } });
    supabase.rpc('log_search_query', { search_term: debouncedQuery }).then(() => null);
  }, [debouncedQuery, router]);

  const handleSuggestionSelect = useCallback((s: string) => {
    setQuery(s);
    router.push({ pathname: '/search', query: { q: s } });
    supabase.rpc('log_search_query', { search_term: s }).then(() => null);
    setIsSearchOpen(false);
  }, [router]);

  const handleProductSelect = useCallback((p: SearchProduct) => {
    router.push({ pathname: '/product/[id]', params: { id: p.id } });
    closeSearch();
  }, [router, closeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => (i + 1 >= totalItems ? 0 : i + 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => (i <= 0 ? totalItems - 1 : i - 1));
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[activeIndex]);
        } else if (activeIndex >= suggestions.length && activeIndex < totalItems) {
          handleProductSelect(products[activeIndex - suggestions.length]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
    }
  };

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setSuggestions([]);
    setProducts([]);
    setActiveIndex(-1);
    (window.innerWidth <= 640 ? mobileInputRef : inputRef).current?.focus();
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────────────── */}
      <SearchWrapper ref={searchWrapperRef}>
        <SearchContainer $isOpen={isSearchOpen}>
          <label
            htmlFor="search-input"
            style={{ position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
          >
            {t('search')}
          </label>

          <IconWrapper onClick={() => setIsSearchOpen(v => !v)} aria-label={t('search')}>
            <Search />
          </IconWrapper>

          <SearchInput
            id="search-input"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
            $isOpen={isSearchOpen}
            placeholder={`${t('search')}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            autoComplete="off"
          />

          {isSearchOpen && (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
              {isSearching ? (
                <Spinner size={16} color="#666" />
              ) : (
                query && (
                  <ClearButton onClick={clearSearch} aria-label={t('clearSearch')}>
                    <X size={16} color="#555" />
                  </ClearButton>
                )
              )}
            </div>
          )}
        </SearchContainer>

        {/* Dropdown fuera de SearchContainer para escapar de overflow:hidden */}
        <AnimatePresence>
          {showDropdown && (
            <SearchDropdown
              suggestions={suggestions}
              products={products}
              activeIndex={activeIndex}
              onSuggestionSelect={handleSuggestionSelect}
              onProductSelect={handleProductSelect}
            />
          )}
        </AnimatePresence>
      </SearchWrapper>

      {/* ── Mobile ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <MobileSearchPanel
            ref={mobileSearchRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -20 }}
            transition={{ duration: 0.2, type: 'spring', bounce: 0 }}
          >
            <MobileSearchInputWrapper>
              <Search size={20} color="#666" />
              <MobileInput
                ref={mobileInputRef}
                placeholder={`${t('search')}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={t('search')}
                autoComplete="off"
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

            {/* Sugerencias inline debajo del input en móvil */}
            {showDropdown && (
              <MobileSuggestionsWrapper>
                <SearchDropdown
                  inline
                  suggestions={suggestions}
                  products={products}
                  activeIndex={activeIndex}
                  onSuggestionSelect={handleSuggestionSelect}
                  onProductSelect={handleProductSelect}
                />
              </MobileSuggestionsWrapper>
            )}
          </MobileSearchPanel>
        )}
      </AnimatePresence>
    </>
  );
}
