import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HeaderSearch from './header/HeaderSearch';
import { SearchResults, ProductDetails } from '@/features/product';
import { CartDrawer, useCartStore } from '@/features/cart'; // Fixed import
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme } from '../theme'; // Relative path since file is in src/components
import type { Product } from '../types';

const mockAddToCart = vi.fn();
// Default mock implementation
const mockUseCartFn = vi.fn(() => ({
    addToCart: mockAddToCart,
    addToCartAsync: mockAddToCart,
    isAdding: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: [] as any[], // Default empty
}));

vi.mock('@/features/cart', async () => {
    const actual = await vi.importActual('@/features/cart');
    return {
        ...actual,
        useCart: () => mockUseCartFn(),
    };
});

// CartDrawer imports useCart from its internal path, need to mock that too
vi.mock('@/features/cart/hooks/useCart', () => ({
    useCart: () => mockUseCartFn(),
}));

// --- Mocks ---

// Mock Next.js Navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ children, href, ...props }: { children: React.ReactNode; href: any;[key: string]: unknown }) => {
        const hrefStr = typeof href === 'object' && href.pathname && href.params
            ? href.pathname.replace('[id]', href.params.id)
            : href;


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <a href={hrefStr} {...(props as any)}>{children}</a>;
    },
}));

// Mock Navigation (custom wrapper)
vi.mock('@/navigation', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ children, href, ...props }: { children: React.ReactNode; href: any;[key: string]: unknown }) => {
        const hrefStr = typeof href === 'object' && href.pathname && href.params
            ? href.pathname.replace('[id]', href.params.id)
            : href;


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <a href={hrefStr} {...(props as any)}>{children}</a>;
    },
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock Next-Intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            'search': 'Search',
            'addToCart': 'Add to Cart',
            'checkout': 'Checkout',
            'title': 'Cart',
            'empty': 'Your cart is empty',
            'total': 'Total',
            'close': 'Close',
            'addedToCart': 'Added to cart',
            'stockLimit': 'Stock limit reached',
            'back': 'Back',
            'outOfStock': 'Out of Stock',
        };
        return translations[key] || key;
    },
    useLocale: () => 'en',
    useFormatter: () => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        number: (val: number, options?: any) => {
            if (options?.style === 'currency') return `$${val}`;
            return String(val);
        },
        dateTime: (date: Date) => date.toLocaleDateString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        list: (list: any[]) => list.join(', '),
    }),
}));

// Mock Currency Context
vi.mock('@/context/CurrencyContext', () => ({
    useCurrency: () => ({
        formatPrice: (price: number) => `$${price}`,
    }),
    CurrencyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        })),
        removeChannel: vi.fn(),
    },
}));

// Mock Toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock Dynamic Imports (Simple bypass)
vi.mock('next/dynamic', () => ({
    __esModule: true,
    default: (fn: () => React.ComponentType<unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _Component = fn();
        return function MockDynamicComponent() {
            return <div data-testid="dynamic-component" />;
        };
    },
}));
// But wait, the dynamic imports in ProductDetails are returning Promises/Components.
// For testing, simpler to just mock the child components directly if needed.
// Or trust that JSDOM can handle them if they are simple.

// Mock Product Data
const mockProduct: Product = {
    id: 'prod_1',
    name: 'BTS Album',
    artist: 'BTS',
    price: 30,
    image_url: '/test.jpg',
    stock: 10,
    category: 'album',
    description: 'Best album',
    is_new: false,
};

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const renderWithTheme = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={lightTheme}>
                {ui}
            </ThemeProvider>
        </QueryClientProvider>
    );
};

// --- Tests ---

describe('Integration Flow: User Journey', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCartStore.getState().clearCart();
        useCartStore.getState().closeCart();
        mockUseCartFn.mockReturnValue({
            addToCart: mockAddToCart,
            addToCartAsync: mockAddToCart,
            isAdding: false,
            data: [],
        });
    });

    it('Search -> Select Product -> Add to Cart -> Verify Cart', async () => {
        const user = userEvent.setup();

        // 1. User loads Home and Types "BTS" in search
        // We render HeaderSearch isolated to simulate this step
        const { unmount: unmountSearch } = renderWithTheme(<HeaderSearch />);

        const searchInput = screen.getByPlaceholderText('Search...');
        await user.type(searchInput, 'BTS');

        // Wait for debounce (500ms) and router push
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith({ pathname: '/search', query: { q: 'BTS' } });
        }, { timeout: 5000 });

        unmountSearch();

        // 2. User sees results and clicks on first result
        // We render SearchResults with the mock product
        // Note: Real app would fetch data. Here we simulate the state "after fetch".
        const { unmount: unmountResults } = renderWithTheme(
            <SearchResults query="BTS" products={[mockProduct]} loading={false} />
        );

        // Verify product is visible
        expect(screen.getByText('BTS Album')).toBeInTheDocument();

        // Simulate click (In real app, this is a Link. In test, checking the href is enough or simulating nav)
        // Check if the link has correct href
        const productLink = screen.getByRole('link', { name: /BTS Album/i }); // ProductCard wraps in Link
        expect(productLink).toHaveAttribute('href', '/product/prod_1');

        unmountResults();

        // 3. User is now on Product Page and clicks "Add to Cart"
        const { unmount: unmountDetails } = renderWithTheme(<ProductDetails product={mockProduct} />);

        // Verify we are on details page
        expect(screen.getByText('BTS Album')).toBeInTheDocument();
        expect(screen.getByText('$30')).toBeInTheDocument();

        // Click Add to Cart
        const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
        await user.click(addToCartBtn);

        // Verify Toast (optional) or Store update
        // We know store updates trigger "openCart".

        unmountDetails();

        // 4. Open Cart and Verify
        // We assume CartDrawer is present in Layout. We render it now.
        // We manually open it or assume it opened automatically (useCartStore logic says yes)

        // Ensure we simulate cart having items now
        mockUseCartFn.mockReturnValue({
            addToCart: mockAddToCart,
            addToCartAsync: mockAddToCart,
            isAdding: false,
            data: [{ ...mockProduct, quantity: 1 }],
        });

        // Ensure cart is open in store (ProductDetails calls addToCart which calls openCart)
        // expect(useCartStore.getState().items).toHaveLength(1); // Removed as items are now in React Query
        expect(mockAddToCart).toHaveBeenCalled();
        expect(useCartStore.getState().isCartOpen).toBe(true);

        renderWithTheme(<CartDrawer />);

        // Verify Drawer Content
        // It's animated, so might need waitFor
        await waitFor(() => {
            expect(screen.getByText('Cart (1)')).toBeInTheDocument();
            expect(screen.getByText('BTS Album')).toBeInTheDocument();
            expect(screen.getByText('$30 x 1')).toBeInTheDocument();
        });
    });
});
