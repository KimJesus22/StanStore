import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabaseClient';
import InfiniteReviewsList from './InfiniteReviewsList';

interface ProductReviewsListProps {
    productId: string;
}

export default async function ProductReviewsList({ productId }: ProductReviewsListProps) {
    const t = await getTranslations('pdp.reviews');

    // Fetch only the first 5 reviews (Page 1) server-side
    // This ensures fast initial load and SEO for the first few items
    const { data: initialReviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(0, 4); // Limit to 5 (0-4)

    if (error) {
        console.error('Error fetching reviews:', error);
        return <p style={{ color: 'red' }}>Error al cargar reseñas.</p>;
    }

    if (!initialReviews || initialReviews.length === 0) {
        return <p style={{ color: '#888', marginTop: '1rem' }}>{t('noReviews')}</p>;
    }

    return (
        <InfiniteReviewsList
            initialReviews={initialReviews}
            productId={productId}
        />
    );
}
