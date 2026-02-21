'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { Search, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SearchProduct } from '@/app/actions/search';

// ── Styled components ─────────────────────────────────────────────────────────

const Dropdown = styled(motion.div)<{ $inline?: boolean }>`
  position: ${({ $inline }) => ($inline ? 'static' : 'absolute')};
  top: calc(100% + 8px);
  right: 0;
  min-width: ${({ $inline }) => ($inline ? 'auto' : '380px')};
  width: ${({ $inline }) => ($inline ? '100%' : 'auto')};
  background: ${({ theme }) => theme.colors.background};
  border: ${({ $inline, theme }) => ($inline ? 'none' : `1px solid ${theme.colors.border}`)};
  border-radius: ${({ $inline }) => ($inline ? '0' : '16px')};
  box-shadow: ${({ $inline }) => ($inline ? 'none' : '0 12px 40px rgba(0,0,0,0.12)')};
  z-index: 300;
  overflow: hidden;
`;

const Section = styled.div`
  padding: 0.5rem 0;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 0.25rem 0;
`;

// ── Sugerencias de texto ──────────────────────────────────────────────────────

const SuggestionItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 1rem;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.secondaryBackground : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.secondaryBackground};
  }

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ── Mini-tarjetas de producto ─────────────────────────────────────────────────

const ProductItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 1rem;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.secondaryBackground : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.secondaryBackground};
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0; /* permite text-overflow */
`;

const ProductName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.15rem;
`;

const ProductArtist = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const ProductPrice = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const EmptySuggestion = styled.p`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SearchDropdownProps {
  suggestions: string[];
  products: SearchProduct[];
  /** Índice activo en la lista plana: 0..suggestions-1, luego suggestions..+products */
  activeIndex: number;
  onSuggestionSelect: (s: string) => void;
  onProductSelect: (p: SearchProduct) => void;
  /** En móvil el dropdown es estático (sin sombra ni posición absoluta) */
  inline?: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

const formatMXN = (price: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price);

export default function SearchDropdown({
  suggestions,
  products,
  activeIndex,
  onSuggestionSelect,
  onProductSelect,
  inline = false,
}: SearchDropdownProps) {
  const hasSuggestions = suggestions.length > 0;
  const hasProducts    = products.length > 0;

  if (!hasSuggestions && !hasProducts) return null;

  return (
    <Dropdown
      $inline={inline}
      role="listbox"
      aria-label="Resultados de búsqueda"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: -8, scale: 0.98   }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {/* ── Sección A: Sugerencias populares ── */}
      {hasSuggestions && (
        <Section>
          <SectionLabel>
            <TrendingUp size={12} />
            Sugerencias populares
          </SectionLabel>

          {suggestions.map((s, i) => (
            <SuggestionItem
              key={s}
              role="option"
              aria-selected={activeIndex === i}
              $active={activeIndex === i}
              // onMouseDown en lugar de onClick para que no dispare blur en el input antes del clic
              onMouseDown={(e) => { e.preventDefault(); onSuggestionSelect(s); }}
            >
              <Search size={14} opacity={0.4} aria-hidden="true" />
              <span>{s}</span>
            </SuggestionItem>
          ))}
        </Section>
      )}

      {hasSuggestions && hasProducts && <Divider />}

      {/* ── Sección B: Productos sugeridos ── */}
      {hasProducts && (
        <Section>
          <SectionLabel>
            <Package size={12} />
            Productos sugeridos
          </SectionLabel>

          {products.map((p, i) => {
            const flatIndex = suggestions.length + i;
            return (
              <ProductItem
                key={p.id}
                role="option"
                aria-selected={activeIndex === flatIndex}
                $active={activeIndex === flatIndex}
                onMouseDown={(e) => { e.preventDefault(); onProductSelect(p); }}
              >
                <ProductImageWrapper>
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    sizes="44px"
                    style={{ objectFit: 'cover' }}
                  />
                </ProductImageWrapper>

                <ProductInfo>
                  <ProductName>{p.name}</ProductName>
                  <ProductArtist>{p.artist}</ProductArtist>
                </ProductInfo>

                <ProductPrice>{formatMXN(p.price)}</ProductPrice>
              </ProductItem>
            );
          })}
        </Section>
      )}

      {!hasSuggestions && !hasProducts && (
        <EmptySuggestion>Sin resultados</EmptySuggestion>
      )}
    </Dropdown>
  );
}
