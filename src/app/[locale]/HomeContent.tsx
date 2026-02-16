'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { mockProducts } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import FilterSidebar from '@/components/FilterSidebar';
import SortSelector from '@/components/SortSelector';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/types';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import NoResultsFound from '@/components/NoResultsFound';

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL State
    const currentSort = searchParams.get('sort') || 'newest';
    const artistParamString = searchParams.get('artist');
    const categoryParamString = searchParams.get('category');

    // Memoize array params to prevent unnecessary re-renders/fetches
    const artistParams = useMemo(() =>
        artistParamString ? artistParamString.split(',').filter(Boolean) : [],
        [artistParamString]);

    const categoryParams = useMemo(() =>
        categoryParamString ? categoryParamString.split(',').filter(Boolean) : [],
        [categoryParamString]);

    const stockParam = searchParams.get('stock') === 'true';
    const minPriceParam = searchParams.get('min') || '';
    const maxPriceParam = searchParams.get('max') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [allArtists, setAllArtists] = useState<string[]>([]); // Derived from full dataset roughly or specific query
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile drawer state

    // Helper to close drawer when applying filters (optional strategy, currently instant)
    // We can auto-close or let user click 'View Results'.

    // Update URL helper
    const updateUrl = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page if we had pagination? (not implemented yet)
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Handlers
    const handleSortChange = (sort: string) => updateUrl('sort', sort);

    const handleArtistChange = (artist: string) => {
        const newArtists = artistParams.includes(artist)
            ? artistParams.filter(a => a !== artist)
            : [...artistParams, artist];
        updateUrl('artist', newArtists.length > 0 ? newArtists.join(',') : null);
    };

    const handleCategoryChange = (category: string) => {
        const newCategories = categoryParams.includes(category)
            ? categoryParams.filter(c => c !== category)
            : [...categoryParams, category];
        updateUrl('category', newCategories.length > 0 ? newCategories.join(',') : null);
    };

    const handleStockChange = (checked: boolean) => {
        updateUrl('stock', checked ? 'true' : null);
    };

    const handlePriceChange = (min: string, max: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (min) params.set('min', min); else params.delete('min');
        if (max) params.set('max', max); else params.delete('max');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleReset = () => {
        router.push(pathname);
    };

    // Close drawer on resize to desktop (cleanup)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsFilterOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Unique Artists for Sidebar (Ideally this is a separate RPC or table query)
    useEffect(() => {
        const fetchArtists = async () => {
            const { data } = await supabase.from('products').select('artist');
            if (data) {
                const unique = Array.from(new Set(data.map(p => p.artist))).sort();
                setAllArtists(unique);
            } else {
                // Fallback to mock
                const unique = Array.from(new Set(mockProducts.map(p => p.artist))).sort();
                setAllArtists(unique);
            }
        };
        fetchArtists();
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('products').select('*');

            // Apply Filters
            if (artistParams.length > 0) {
                query = query.in('artist', artistParams);
            }
            if (categoryParams.length > 0) {
                query = query.in('category', categoryParams);
            }
            if (stockParam) {
                query = query.gt('stock', 0);
            }
            if (minPriceParam) {
                query = query.gte('price', parseFloat(minPriceParam));
            }
            if (maxPriceParam) {
                query = query.lte('price', parseFloat(maxPriceParam));
            }

            // Apply Sorting
            switch (currentSort) {
                case 'price_asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'alphabetical':
                    query = query.order('name', { ascending: true });
                    break;
                case 'newest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', error);
                setProducts(mockProducts); // Fallback relies on client filtering (omitted for brevity in this block, assumed mostly DB driven)
            } else {
                setProducts(data as Product[]);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(mockProducts);
        } finally {
            setLoading(false);
        }
    }, [currentSort, artistParams, categoryParams, stockParam, minPriceParam, maxPriceParam]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const commonFilterProps = {
        artists: allArtists,
        selectedArtists: artistParams,
        selectedCategories: categoryParams,
        inStockOnly: stockParam,
        priceRange: { min: minPriceParam, max: maxPriceParam },
        onArtistChange: handleArtistChange,
        onCategoryChange: handleCategoryChange,
        onStockChange: handleStockChange,
        onPriceChange: handlePriceChange,
        onReset: handleReset
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
                            currentSort={currentSort}
                            onSortChange={handleSortChange}
                        />
                    </ControlsContainer>

                    {loading ? (
                        <Grid>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </Grid>
                    ) : (
                        <>
                            {products.length > 0 ? (
                                <Grid>
                                    {products.map((product, index) => (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ))}
                                </Grid>
                            ) : (
                                <NoResultsFound onReset={handleReset} />
                            )}
                        </>
                    )}
                </ProductSection>
            </ContentLayout>
        </Main>
    );
}
