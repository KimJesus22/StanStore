import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Product } from '@/types';

export interface WishlistItem extends Product {
    wishlist_item_id: string;
}

const fetchWishlist = async (): Promise<WishlistItem[]> => {
    const response = await fetch('/api/wishlist');
    if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
    }
    return response.json();
};

export const useWishlist = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: fetchWishlist,
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes, changes less frequently
    });
};
