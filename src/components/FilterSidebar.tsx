'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';

const Sidebar = styled.aside`
  width: 250px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 2rem;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  opacity: 0.9;
  
  &:hover {
    opacity: 1;
  }
`;

const Checkbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 16px;
  height: 16px;
`;

const SwitchLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.text}99;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  margin-top: 1rem;

  &:hover {
      color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
  }
`;

interface FilterSidebarProps {
    artists: string[];
    selectedArtists: string[];
    selectedCategories: string[];
    inStockOnly: boolean;
    priceRange: { min: string; max: string };
    onArtistChange: (artist: string) => void;
    onCategoryChange: (category: string) => void;
    onStockChange: (inStock: boolean) => void;
    onPriceChange: (min: string, max: string) => void;
    onReset: () => void;
}

export default function FilterSidebar({
    artists,
    selectedArtists,
    selectedCategories,
    inStockOnly,
    priceRange,
    onArtistChange,
    onCategoryChange,
    onStockChange,
    onPriceChange,
    onReset
}: FilterSidebarProps) {
    const t = useTranslations('Home.filters');
    const categories = ['album', 'lightstick', 'merch'];

    // Local state for debouncing
    const [localMin, setLocalMin] = useState(priceRange.min);
    const [localMax, setLocalMax] = useState(priceRange.max);

    // Sync local state when props change (e.g. on reset or URL navigation)
    useEffect(() => {
        setLocalMin(priceRange.min);
        setLocalMax(priceRange.max);
    }, [priceRange.min, priceRange.max]);

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only fire if values are different from current props to avoid loops
            if (localMin !== priceRange.min || localMax !== priceRange.max) {
                onPriceChange(localMin, localMax);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [localMin, localMax, onPriceChange, priceRange.min, priceRange.max]);

    return (
        <Sidebar>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('title')}</h2>
                {(selectedArtists.length > 0 || selectedCategories.length > 0 || inStockOnly || priceRange.min || priceRange.max) && (
                    <ResetButton onClick={onReset}>{t('reset')}</ResetButton>
                )}
            </div>

            <FilterSection>
                <SectionTitle>{t('availability')}</SectionTitle>
                <SwitchLabel>
                    <Checkbox
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => onStockChange(e.target.checked)}
                    />
                    {t('inStock')}
                </SwitchLabel>
            </FilterSection>

            <FilterSection>
                <SectionTitle>{t('price')}</SectionTitle>
                <PriceContainer>
                    <PriceInput
                        type="number"
                        placeholder={t('min')}
                        value={localMin}
                        onChange={(e) => setLocalMin(e.target.value)}
                        min="0"
                    />
                    <span>-</span>
                    <PriceInput
                        type="number"
                        placeholder={t('max')}
                        value={localMax}
                        onChange={(e) => setLocalMax(e.target.value)}
                        min="0"
                    />
                </PriceContainer>
            </FilterSection>

            <FilterSection>
                <SectionTitle>{t('category')}</SectionTitle>
                {categories.map(cat => (
                    <CheckboxLabel key={cat}>
                        <Checkbox
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => onCategoryChange(cat)}
                        />
                        {t(`categories.${cat}` as any)}
                    </CheckboxLabel>
                ))}
            </FilterSection>

            <FilterSection>
                <SectionTitle>{t('artist')}</SectionTitle>
                {artists.map(artist => (
                    <CheckboxLabel key={artist}>
                        <Checkbox
                            type="checkbox"
                            checked={selectedArtists.includes(artist)}
                            onChange={() => onArtistChange(artist)}
                        />
                        {artist}
                    </CheckboxLabel>
                ))}
            </FilterSection>
        </Sidebar>
    );
}
