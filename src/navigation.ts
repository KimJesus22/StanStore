import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'ko'] as const;
export const localePrefix = 'always'; // Default

export const pathnames = {
    '/': '/',
    '/privacy': {
        en: '/privacy-policy',
        es: '/politica-de-privacidad',
        ko: '/privacy-policy'
    }
} as const;

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix, pathnames });
