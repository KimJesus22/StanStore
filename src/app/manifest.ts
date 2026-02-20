import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FanShield Store',
        short_name: 'FanShield',
        description: 'Tu tienda de confianza para merch de K-pop. Encuentra los mejores álbumes, lightsticks y accesorios.',
        start_url: '/',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#10CFBD',
        icons: [
            {
                src: '/icons/icon-192x192.svg', // Asumiendo SVG o PNG
                sizes: '192x192',
                type: 'image/svg+xml', // Ajustar si son PNG
                purpose: 'any',
            },
            {
                src: '/icons/icon-512x512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
        ],
    };
}
