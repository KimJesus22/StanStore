'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useCartStore } from '../stores/useCartStore';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export interface CartItem extends Product {
    quantity: number;
    cart_item_id: string;
}

const fetchCart = async (): Promise<CartItem[]> => {
    const response = await fetch('/api/cart');
    if (!response.ok) {
        throw new Error('Failed to fetch cart');
    }
    return response.json();
};

const addToCartApi = async ({ productId, quantity }: { productId: string; quantity: number }) => {
    const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
        throw new Error('Failed to add to cart');
    }
    return response.json();
};

export const useCart = () => {
    const user = useAuth((state) => state.user);
    const queryClient = useQueryClient();
    const zustandAddToCart = useCartStore((state) => state.addToCart);

    const query = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: fetchCart,
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 0, // Critical data (inventory), always fetch fresh or very low stale time
        refetchOnWindowFocus: true,
    });

    const addToCartMutation = useMutation({
        mutationFn: addToCartApi,

        // ── Optimistic Update ──────────────────────────────────
        onMutate: async (variables) => {
            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['cart'] });

            // 2. Snapshot the previous cart state (for rollback)
            const previousItems = useCartStore.getState().items;

            // 3. Optimistically update Zustand store → badge sube INSTANTÁNEAMENTE
            const product = (variables as AddToCartWithProduct).product;
            if (product) {
                zustandAddToCart(product);
            }

            // Return context with the snapshot for rollback
            return { previousItems };
        },

        onSuccess: (_data, variables) => {
            const product = (variables as AddToCartWithProduct).product;
            const name = product?.name ?? 'Producto';
            toast.success(`✅ ${name} añadido al carrito`, {
                style: {
                    background: '#10B981',
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                },
                iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#10B981',
                },
            });
        },

        onError: (_error, _variables, context) => {
            // ── Rollback ───────────────────────────────────────
            // Revert Zustand store to previous snapshot
            if (context?.previousItems) {
                useCartStore.setState({ items: context.previousItems });
            }

            // Show error toast
            toast.error('Error al añadir al carrito. Inténtalo de nuevo.', {
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                },
                iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#EF4444',
                },
            });
        },

        onSettled: () => {
            // ── Sync with server ───────────────────────────────
            // Always refetch after error or success to ensure server/client are in sync
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const addToCart = (params: AddToCartParams) => {
        if (!user) {
            useAuth.getState().openAuthModal();
            return;
        }
        addToCartMutation.mutate(params);
    };

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId: string) => {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            if (!response.ok) throw new Error('Failed to remove from cart');
            return response.json();
        },
        onMutate: async (productId: string) => {
            await queryClient.cancelQueries({ queryKey: ['cart'] });
            const previousItems = queryClient.getQueryData<CartItem[]>(['cart', user?.id]);
            // Optimistic update: remove from React Query cache immediately
            queryClient.setQueryData<CartItem[]>(['cart', user?.id], (old) =>
                old ? old.filter((item) => item.id !== productId) : []
            );
            // Also update Zustand store for badge count
            useCartStore.getState().removeFromCart(productId);
            return { previousItems };
        },
        onError: (_error, _productId, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(['cart', user?.id], context.previousItems);
            }
            toast.error('Error al eliminar del carrito. Inténtalo de nuevo.');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const removeFromCart = (productId: string) => {
        if (!user) {
            useCartStore.getState().removeFromCart(productId);
            return;
        }
        removeFromCartMutation.mutate(productId);
    };

    return {
        ...query,
        addToCart,
        addToCartAsync: addToCartMutation.mutateAsync,
        isAdding: addToCartMutation.isPending,
        removeFromCart,
        isRemoving: removeFromCartMutation.isPending,
    };
};

// ── Types ──────────────────────────────────────────────────
interface AddToCartBase {
    productId: string;
    quantity: number;
}

interface AddToCartWithProduct extends AddToCartBase {
    product: Product;
}

export type AddToCartParams = AddToCartBase | AddToCartWithProduct;
