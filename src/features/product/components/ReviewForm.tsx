'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import StarRating from '@/components/ui/StarRating';
// Import the server action directly. Next.js handles the rest.
// Note: We need to pass this as a prop or import it. Importing server action in client component works in Next.js 14+
import { submitReview } from '@/app/actions/reviews';

interface ReviewFormProps {
    productId: string;
    userId: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, userId, onReviewSubmitted }: ReviewFormProps) {
    const t = useTranslations('pdp.reviews');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error(t('errorRating'));
            return;
        }
        if (!comment.trim()) {
            toast.error(t('errorComment'));
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitReview({ productId, rating, comment, userId });

            if (result.success) {
                toast.success(t('success'));
                setRating(0);
                setComment('');
                if (onReviewSubmitted) onReviewSubmitted();
            } else {
                toast.error(result.error || 'Error al enviar la reseña.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('writeReview')}</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('rating')}</label>
                <StarRating rating={rating} setRating={setRating} interactive />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('comment')}</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    placeholder={t('placeholder')}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                style={{
                    backgroundColor: '#111',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: submitting ? 0.7 : 1
                }}
            >
                {submitting ? t('submitting') : t('submit')}
            </button>
        </form>
    );
}
