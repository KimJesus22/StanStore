import React from 'react';

interface CartEmptyProps {
    className?: string;
}

/**
 * Ilustración SVG: Caja vacía (carrito sin productos).
 * Usa `currentColor` para heredar el color del padre vía Tailwind.
 */
const CartEmpty: React.FC<CartEmptyProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        fill="none"
        className={className}
        aria-hidden="true"
    >
        {/* Fondo de la caja (cara frontal) */}
        <rect
            x="40"
            y="80"
            width="120"
            height="90"
            rx="6"
            stroke="currentColor"
            strokeWidth="5"
            fill="currentColor"
            fillOpacity="0.06"
        />
        {/* Línea divisoria del cartón */}
        <line
            x1="100"
            y1="80"
            x2="100"
            y2="170"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.4"
        />
        {/* Solapa izquierda */}
        <path
            d="M40 80 L55 50 L100 50 L100 80"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.04"
        />
        {/* Solapa derecha */}
        <path
            d="M100 80 L100 50 L145 50 L160 80"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.04"
        />
        {/* Signo de interrogación dentro de la caja */}
        <path
            d="M88 115 Q88 105, 100 105 Q112 105, 112 115 Q112 122, 100 125"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
        />
        <circle cx="100" cy="140" r="3" fill="currentColor" />
    </svg>
);

export default CartEmpty;
