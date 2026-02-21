import React from 'react';

interface SearchEmptyProps {
    className?: string;
}

/**
 * Ilustración SVG: Lupa triste (búsqueda sin resultados).
 * Usa `currentColor` para heredar el color del padre vía Tailwind.
 */
const SearchEmpty: React.FC<SearchEmptyProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        fill="none"
        className={className}
        aria-hidden="true"
    >
        {/* Cuerpo de la lupa */}
        <circle
            cx="90"
            cy="85"
            r="55"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
        />
        {/* Cristal interior con opacidad sutil */}
        <circle cx="90" cy="85" r="45" fill="currentColor" opacity="0.06" />
        {/* Mango */}
        <line
            x1="132"
            y1="127"
            x2="172"
            y2="167"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
        />
        {/* Ojo izquierdo — arco "triste" */}
        <path
            d="M72 78 Q72 72, 78 72"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
        />
        {/* Ojo derecho — arco "triste" */}
        <path
            d="M102 72 Q108 72, 108 78"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
        />
        {/* Boca triste */}
        <path
            d="M75 102 Q90 92, 105 102"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
        />
    </svg>
);

export default SearchEmpty;
