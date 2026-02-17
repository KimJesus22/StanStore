import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Product } from '@/types';

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
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: fetchCart,
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 0, // Critical data (inventory), always fetch fresh or very low stale time
        refetchOnWindowFocus: true,
    });

    const addToCartMutation = useMutation({
        mutationFn: addToCartApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    return {
        ...query,
        addToCart: addToCartMutation.mutate,
        addToCartAsync: addToCartMutation.mutateAsync,
        isAdding: addToCartMutation.isPending,
    };
};
