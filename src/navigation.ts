import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'ko', 'pt-BR', 'fr-CA'] as const;
export const localePrefix = 'always'; // Default

export const pathnames = {
    '/': '/',
    '/privacy': {
        en: '/privacy-policy',
        es: '/politica-de-privacidad',
        ko: '/privacy-policy',
        'pt-BR': '/politica-de-privacidade',
        'fr-CA': '/politique-de-confidentialite'
    },
    '/artists': '/artists',
    '/profile': '/profile',
    '/track-order': '/track-order',
    '/terms': '/terms',
    '/admin': '/admin',
    '/search': '/search',
    '/product/[id]': '/product/[id]'
} as const;

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix, pathnames });
