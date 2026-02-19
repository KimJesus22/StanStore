import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';

export function useProductFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL State
    const currentSort = searchParams.get('sort') || 'newest';
    const artistParamString = searchParams.get('artist');
    const categoryParamString = searchParams.get('category');

    const artistParams = useMemo(() =>
        artistParamString ? artistParamString.split(',').filter(Boolean) : [],
        [artistParamString]);

    const categoryParams = useMemo(() =>
        categoryParamString ? categoryParamString.split(',').filter(Boolean) : [],
        [categoryParamString]);

    const stockParam = searchParams.get('stock') === 'true';
    const minPriceParam = searchParams.get('min') || '';
    const maxPriceParam = searchParams.get('max') || '';

    const updateUrl = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

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

    return {
        filters: {
            sort: currentSort,
            artists: artistParams,
            categories: categoryParams,
            stock: stockParam,
            price: { min: minPriceParam, max: maxPriceParam },
        },
        handlers: {
            onSortChange: handleSortChange,
            onArtistChange: handleArtistChange,
            onCategoryChange: handleCategoryChange,
            onStockChange: handleStockChange,
            onPriceChange: handlePriceChange,
            onReset: handleReset,
        }
    };
}
