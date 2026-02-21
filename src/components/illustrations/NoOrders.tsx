import React from 'react';

interface NoOrdersProps {
    className?: string;
}

/**
 * Ilustración SVG: Recibo en blanco (sin órdenes).
 * Usa `currentColor` para heredar el color del padre vía Tailwind.
 */
const NoOrders: React.FC<NoOrdersProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 220"
        fill="none"
        className={className}
        aria-hidden="true"
    >
        {/* Cuerpo del recibo */}
        <rect
            x="45"
            y="20"
            width="110"
            height="155"
            rx="6"
            stroke="currentColor"
            strokeWidth="5"
            fill="currentColor"
            fillOpacity="0.06"
        />
        {/* Borde dentado inferior (efecto ticket) */}
        <path
            d="M45 175 L55 185 L65 175 L75 185 L85 175 L95 185 L105 175 L115 185 L125 175 L135 185 L145 175 L155 185"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Líneas del recibo (simulan texto) */}
        <line
            x1="65"
            y1="55"
            x2="135"
            y2="55"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.35"
        />
        <line
            x1="65"
            y1="75"
            x2="120"
            y2="75"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.25"
        />
        <line
            x1="65"
            y1="95"
            x2="130"
            y2="95"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.2"
        />
        {/* Separador punteado */}
        <line
            x1="60"
            y1="118"
            x2="140"
            y2="118"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.3"
        />
        {/* Total: línea más gruesa */}
        <line
            x1="65"
            y1="140"
            x2="100"
            y2="140"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
        />
        {/* Valor del total */}
        <line
            x1="115"
            y1="140"
            x2="135"
            y2="140"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
        />
    </svg>
);

export default NoOrders;
