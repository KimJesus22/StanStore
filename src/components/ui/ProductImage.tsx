'use client';

import Image, { ImageProps } from 'next/image';
import { Product } from '@/types';

type BaseProps = Omit<ImageProps, 'alt'>;

// Hacemos que sea obligatorio pasar uno de estos tres para satisfacer la accesibilidad
type Props = BaseProps & (
    | { alt: string; product?: never; isDecorative?: never }
    | { product: Product; alt?: string; isDecorative?: never } // Puede recibir alt opcional para sobrescribir
    | { isDecorative: true; alt?: never; product?: never }
);

export default function ProductImage(props: Props) {
    const { alt, product, isDecorative, ...rest } = props;

    let finalAlt = '';

    if (isDecorative) {
        finalAlt = '';
    } else if (alt) {
        finalAlt = alt;
    } else if (product) {
        // Fallback inteligente
        finalAlt = `${product.name} - ${product.category} merchandise`;
    }

    return (
        <Image
            alt={finalAlt}
            {...rest}
        />
    );
}
