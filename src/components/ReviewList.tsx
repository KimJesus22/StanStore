'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabaseClient';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string; // We might want to fetch user profile name later
}

interface ReviewListProps {
    productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const t = useTranslations('pdp.reviews');
    // We can get the current locale from next-intl, but for date-fns we need the object
    // Mapping string locale to date-fns locale object
    // This is a simplified example. Ideally move this to a utility.

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reviews:', error);
            } else {
                setReviews(data || []);
            }
            setLoading(false);
        };

        fetchReviews();

        // Subscribe to new reviews
        const channel = supabase
            .channel(`reviews-${productId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'reviews',
                    filter: `product_id=eq.${productId}`,
                },
                (payload) => {
                    setReviews((prev) => [payload.new as Review, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId]);

    if (loading) return <p>{t('loading')}</p>;

    if (reviews.length === 0) {
        return <p style={{ color: '#888', marginTop: '1rem' }}>{t('noReviews')}</p>;
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                {t('title')} ({reviews.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review) => (
                    <div key={review.id} style={{ borderBottom: '1px solid #f9f9f9', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <StarRating rating={review.rating} />
                            <span style={{ fontSize: '0.85rem', color: '#999' }}>
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: es })}
                            </span>
                        </div>
                        <p style={{ color: '#444', lineHeight: '1.5' }}>{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
