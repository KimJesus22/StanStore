'use client';

import { Star } from 'lucide-react';
import React from 'react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    interactive?: boolean;
}

export default function StarRating({ rating, setRating, interactive = false }: StarRatingProps) {
    const [hover, setHover] = React.useState(0);

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <label key={index} style={{ cursor: interactive ? 'pointer' : 'default' }}>
                        {interactive && (
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => setRating && setRating(ratingValue)}
                                style={{ display: 'none' }}
                            />
                        )}
                        <Star
                            size={20}
                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                            fill={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                            onMouseEnter={() => interactive && setHover(ratingValue)}
                            onMouseLeave={() => interactive && setHover(0)}
                        />
                    </label>
                );
            })}
        </div>
    );
}
