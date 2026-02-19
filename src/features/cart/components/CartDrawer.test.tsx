import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartDrawer from './CartDrawer';
import { ThemeProvider } from '@/context/ThemeContext';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: Record<string, string> = {
            title: 'Tu Carrito',
            close: 'Cerrar',
            empty: 'Tu carrito está vacío',
            total: 'Total',
            checkout: 'Finalizar Compra'
        };
        return messages[key] || key;
    },
    useLocale: () => 'es',
}));

vi.mock('@/context/CurrencyContext', () => ({
    useCurrency: () => ({
        formatPrice: (price: number) => `$${price}`,
    }),
}));

const mockUseCart = vi.fn();
vi.mock('../hooks/useCart', () => ({
    useCart: () => mockUseCart(),
}));

// Mock Zustand store - default to empty
const mockRemoveFromCart = vi.fn();
const mockCloseCart = vi.fn();

// We will use a variable to control the store state in the mock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockStoreState: any = {
    items: [],
    isCartOpen: true,
    closeCart: mockCloseCart,
    removeFromCart: mockRemoveFromCart,
};

vi.mock('../stores/useCartStore', () => ({
    useCartStore: () => mockStoreState,
}));

// Helper render
const renderCart = () => {
    return render(
        <ThemeProvider>
            <CartDrawer />
        </ThemeProvider>
    );
};

describe('CartDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store default
        mockStoreState = {
            isCartOpen: true,
            closeCart: mockCloseCart,
            removeFromCart: mockRemoveFromCart, // Still used for remove? No, useCart handles it now likely? Check component.
            items: [], // Store might still keep items if used for persistent count or sync, but drawer uses hook.
        };

        // Default useCart mock
        mockUseCart.mockReturnValue({
            data: [],
            isLoading: false,
        });
    });

    it('shows empty state when cart is empty', () => {
        renderCart();
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /finalizar compra/i })).toBeDisabled();
    });

    it('renders items and calculates total correctly', () => {
        // Setup store with items
        const items = [
            { id: '1', name: 'Product A', price: 500, quantity: 2, image_url: '/img.jpg', artist: 'Artist A' },
        ];

        mockUseCart.mockReturnValue({
            data: items,
            isLoading: false
        });

        renderCart();

        // Check item rendering
        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText('$500 x 2')).toBeInTheDocument();

        // Check total: 500 * 2 = 1000
        // We look for the total row which contains "Total" and "$1000"
        // Since convertPrice is mocked to return `$${price}`, total should be `$1000`
        expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    it('navigates to checkout when button is clicked', () => {
        const items = [
            { id: '1', name: 'Product A', price: 500, quantity: 1, image_url: '/img.jpg', artist: 'Artist A' }
        ];

        mockUseCart.mockReturnValue({
            data: items,
            isLoading: false
        });

        renderCart();

        const checkoutButton = screen.getByRole('button', { name: /finalizar compra/i });

        // Initially disabled because terms are not accepted
        expect(checkoutButton).toBeDisabled();

        // Click terms checkbox
        // We find the checkbox by its role
        const termsCheckbox = screen.getByRole('checkbox');
        fireEvent.click(termsCheckbox);

        // Now it should be enabled
        expect(checkoutButton).not.toBeDisabled();

        fireEvent.click(checkoutButton);

        expect(mockPush).toHaveBeenCalledWith('/es/checkout');
        expect(mockCloseCart).toHaveBeenCalled();
    });
});
