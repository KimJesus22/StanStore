import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';
import { NextRequest, NextResponse } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'es',
    localePrefix
});

// Simple in-memory rate limit map (for demo purposes)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per IP for API routes

// Extend NextRequest to include geo property (Vercel specific)
declare module 'next/server' {
    interface NextRequest {
        geo?: {
            country?: string;
            region?: string;
            city?: string;
            latitude?: string;
            longitude?: string;
        };
    }
}

export default function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Rate Limiting (API Routes & Actions only)
    if (pathname.startsWith('/api') || request.method === 'POST') {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const record = rateLimit.get(ip);

        if (record) {
            if (now - record.startTime > RATE_LIMIT_WINDOW) {
                rateLimit.set(ip, { count: 1, startTime: now });
            } else {
                record.count++;
                if (record.count > MAX_REQUESTS) {
                    return new NextResponse('Too Many Requests', { status: 429 });
                }
            }
        } else {
            rateLimit.set(ip, { count: 1, startTime: now });
        }
    }

    // 2. Security: Block suspicious IPs from /admin (Simulated Blacklist)
    const BLACKLISTED_IPS = ['1.2.3.4', '5.6.7.8']; // Example IPs
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (pathname.startsWith('/admin') && BLACKLISTED_IPS.includes(ip)) {
        return new NextResponse('Access Denied: Suspicious Activity Detected', { status: 403 });
    }

    // 3. CSP Headers & Geo-Detection
    const response = intlMiddleware(request);

    // Geo-Detection (Vercel specific) - usa header x-vercel-ip-country como fuente principal
    // En localhost no existe el header de Vercel, así que defaultea a 'MX' (tienda mexicana)
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const country = vercelCountry || 'MX';
    const currency = country === 'MX' ? 'MXN' : 'USD';

    // Siempre actualizar la cookie de moneda basada en la ubicación actual
    response.cookies.set('NEXT_CURRENCY', currency);

    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://res.cloudinary.com; 
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com; 
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
  `;

    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim();

    response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
    );

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(es|en|ko)/:path*']
};
