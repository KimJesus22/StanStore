import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isCartOpen: boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            isCartOpen: false,
            addToCart: (product) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            isCartOpen: true, // Auto open cart
                        };
                    }
                    return {
                        items: [...state.items, { ...product, quantity: 1 }],
                        isCartOpen: true, // Auto open cart
                    };
                });
            },
            removeFromCart: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
            },
            clearCart: () => set({ items: [] }),
            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),
            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
        }),
        {
            name: 'stanstore-cart',
            partialize: (state) => ({ items: state.items }), // Persist only items
        }
    )
);
