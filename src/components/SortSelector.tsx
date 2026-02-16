'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  justify-content: flex-end;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

interface SortSelectorProps {
    currentSort: string;
    onSortChange: (sort: string) => void;
}

export default function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
    const t = useTranslations('Home.sort');

    return (
        <Container>
            <Label htmlFor="sort-select">{t('label')}</Label>
            <Select
                id="sort-select"
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
            >
                <option value="newest">{t('newest')}</option>
                <option value="price_asc">{t('price_asc')}</option>
                <option value="price_desc">{t('price_desc')}</option>
                <option value="alphabetical">{t('alphabetical')}</option>
            </Select>
        </Container>
    );
}
