import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../useCartStore';

// Mock Product
const mockProduct = {
    id: 'prod_123',
    name: 'Test Product',
    price: 100,
    image_url: 'http://example.com/image.jpg',
    category: 'merch' as const,
    artist: 'Test Artist',
    is_new: false,
    stock: 10,
};

describe('useCartStore', () => {
    beforeEach(() => {
        // Reset store before each test
        const { result } = renderHook(() => useCartStore());
        act(() => {
            result.current.clearCart();
        });
        localStorage.clear();
    });

    it('debe añadir un producto y aumentar la cantidad de items', () => {
        const { result } = renderHook(() => useCartStore());

        expect(result.current.items).toHaveLength(0);

        act(() => {
            result.current.addToCart(mockProduct);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toEqual({ ...mockProduct, quantity: 1 });
    });

    it('debe incrementar la cantidad si el producto ya existe', () => {
        const { result } = renderHook(() => useCartStore());

        act(() => {
            result.current.addToCart(mockProduct);
            result.current.addToCart(mockProduct);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
    });

    it('no debería permitir cantidades negativas (la lógica actual añade de 1 en 1)', () => {
        // Nota: La implementación actual de addToCart no acepta cantidad como argumento,
        // simplemente suma 1. Por lo tanto, es imposible añadir negativo por diseño.
        // Verificamos que al añadir, la cantidad es positiva.
        const { result } = renderHook(() => useCartStore());

        act(() => {
            result.current.addToCart(mockProduct);
        });

        expect(result.current.items[0].quantity).toBeGreaterThan(0);
    });

    it('debe calcular el total correctamente (lógica derivada)', () => {
        const { result } = renderHook(() => useCartStore());

        act(() => {
            result.current.addToCart(mockProduct); // 1 * 100
            result.current.addToCart({ ...mockProduct, id: 'prod_456', price: 50 }); // 1 * 50
        });

        const total = result.current.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        expect(total).toBe(150);
    });

    it('debe eliminar un producto del carrito', () => {
        const { result } = renderHook(() => useCartStore());

        act(() => {
            result.current.addToCart(mockProduct);
        });

        expect(result.current.items).toHaveLength(1);

        act(() => {
            result.current.removeFromCart(mockProduct.id);
        });

        expect(result.current.items).toHaveLength(0);
    });
});
