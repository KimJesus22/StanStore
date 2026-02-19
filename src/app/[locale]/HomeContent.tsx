'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';

import {
    ProductList,
    FilterSidebar,
    SortSelector,
    useProductFilters,
    useProducts,
    useArtists
} from '@/features/product';

const Main = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  opacity: 0.9;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 3rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const ProductSection = styled.div`
  flex: 1;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
`;

// Styled Components for Mobile
const MobileFilterButton = styled.button`
  display: none;
  width: 100%;
  padding: 0.8rem;
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const DrawerContent = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1000;
  padding: 1.5rem;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

const ApplyButton = styled.button`
  margin-top: auto;
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-weight: 700;
  position: sticky;
  bottom: 0;
  cursor: pointer;
`;

const DesktopSidebarWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export default function Home() {
    const t = useTranslations('Home');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Hooks from Feature
    const { filters, handlers } = useProductFilters();
    const { products, loading } = useProducts(filters);
    const { artists } = useArtists();

    // Close drawer on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsFilterOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const commonFilterProps = {
        artists,
        selectedArtists: filters.artists,
        selectedCategories: filters.categories,
        inStockOnly: filters.stock,
        priceRange: filters.price,
        onArtistChange: handlers.onArtistChange,
        onCategoryChange: handlers.onCategoryChange,
        onStockChange: handlers.onStockChange,
        onPriceChange: handlers.onPriceChange,
        onReset: handlers.onReset
    };

    return (
        <Main>
            <Header>
                <Title>{t('title')}</Title>
                <Subtitle>{t('subtitle')}</Subtitle>
            </Header>

            <MobileFilterButton onClick={() => setIsFilterOpen(true)} aria-label={t('filters.mobileFilter')}>
                <span aria-hidden="true">⚡</span> {t('filters.mobileFilter')}
            </MobileFilterButton>

            {/* Mobile Drawer */}
            <DrawerOverlay $isOpen={isFilterOpen} onClick={() => setIsFilterOpen(false)} />
            <DrawerContent $isOpen={isFilterOpen}>
                <DrawerHeader>
                    <h3>{t('filters.title')}</h3>
                    <CloseButton onClick={() => setIsFilterOpen(false)} aria-label={t('common.close') || 'Cerrar'}>×</CloseButton>
                </DrawerHeader>

                <FilterSidebar {...commonFilterProps} />

                <ApplyButton onClick={() => setIsFilterOpen(false)}>
                    {t('filters.viewResults')}
                </ApplyButton>
            </DrawerContent>

            <ContentLayout>
                <DesktopSidebarWrapper>
                    <FilterSidebar {...commonFilterProps} />
                </DesktopSidebarWrapper>

                <ProductSection>
                    <ControlsContainer>
                        <SortSelector
                            currentSort={filters.sort}
                            onSortChange={handlers.onSortChange}
                        />
                    </ControlsContainer>

                    <ProductList
                        products={products}
                        loading={loading}
                        onReset={handlers.onReset}
                    />
                </ProductSection>
            </ContentLayout>
        </Main>
    );
}
