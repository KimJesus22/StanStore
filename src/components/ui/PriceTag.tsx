'use client';

import { useFormatter } from 'next-intl';

interface PriceTagProps {
    amount: number;
    currency?: string;
    className?: string; // Para permitir estilos personalizados (styled-components o tailwind)
}

export default function PriceTag({ amount, currency = 'USD', className }: PriceTagProps) {
    const format = useFormatter();

    return (
        <span className={className}>
            {format.number(amount, {
                style: 'currency',
                currency: currency
            })}
        </span>
    );
}
