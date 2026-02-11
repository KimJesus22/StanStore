'use client';

import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const FilterButton = styled.button<{ $isActive: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  border: none;
  background-color: ${({ $isActive }) => ($isActive ? '#10CFBD' : '#f3f4f6')};
  color: ${({ $isActive }) => ($isActive ? '#fff' : '#4b5563')};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? '#0fbdae' : '#e5e7eb')};
  }
`;

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    allLabel?: string;
}

export default function CategoryFilter({
    categories,
    selectedCategory,
    onSelectCategory,
    allLabel = 'Todos',
}: CategoryFilterProps) {
    return (
        <FilterContainer>
            <FilterButton
                $isActive={selectedCategory === 'Todos' || selectedCategory === allLabel}
                onClick={() => onSelectCategory(allLabel)}
            >
                {allLabel}
            </FilterButton>
            {categories.map((category) => (
                <FilterButton
                    key={category}
                    $isActive={selectedCategory === category}
                    onClick={() => onSelectCategory(category)}
                >
                    {category}
                </FilterButton>
            ))}
        </FilterContainer>
    );
}
