'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getReviewsAction } from '@/app/actions/getReviewsAction';
import StarRating from '@/components/ui/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
}

interface InfiniteReviewsListProps {
    initialReviews: Review[];
    productId: string;
}

export default function InfiniteReviewsList({ initialReviews, productId }: InfiniteReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [page, setPage] = useState(2); // Start fetching from page 2
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const t = useTranslations('pdp.reviews');

    const loadMoreReviews = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // Add artificial delay to make the spinner visible and transition smoother (optional)
        // await new Promise(r => setTimeout(r, 500));

        const newReviews = await getReviewsAction(productId, page);

        if (newReviews && newReviews.length > 0) {
            setReviews(prev => [...prev, ...newReviews]);
            setPage(prev => prev + 1);
            if (newReviews.length < 5) { // Assuming limit is 5
                setHasMore(false);
            }
        } else {
            setHasMore(false);
        }

        setIsLoading(false);
    }, [page, isLoading, hasMore, productId]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMoreReviews();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const target = observerTarget.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [loadMoreReviews, hasMore, isLoading]);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                {t('title')} ({reviews.length}{hasMore ? '+' : ''})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review: Review) => (
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

            {/* Sentinel for Infinite Scroll */}
            {(hasMore || isLoading) && (
                <div
                    ref={observerTarget}
                    style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        padding: '1rem',
                        color: '#999',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isLoading && <Loader2 className="animate-spin" size={20} />}
                    <span>{isLoading ? 'Cargando más reseñas...' : 'Cargar más'}</span>
                </div>
            )}

            {!hasMore && reviews.length > 5 && (
                <p style={{ textAlign: 'center', color: '#ccc', marginTop: '2rem', fontSize: '0.8rem' }}>
                    Has llegado al final.
                </p>
            )}
        </div>
    );
}
