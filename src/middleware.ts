import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix, pathnames } from './navigation';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

function generateCSP() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    // Dominios permitidos
    const scriptSrc = [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://m.stripe.network",
        "https://va.vercel-scripts.com", // Vercel Analytics
        ...(isProduction ? [] : ["'unsafe-eval'"]) // More loose for dev if needed
    ];

    const styleSrc = [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
    ];

    const imgSrc = [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com",
        "https://i.ytimg.com",
        supabaseUrl ? `https://${new URL(supabaseUrl).hostname}` : "https://*.supabase.co"
    ];

    const connectSrc = [
        "'self'",
        "https://api.stripe.com",
        "https://maps.googleapis.com",
        "https://vitals.vercel-insights.com", // Vercel Vitals
        supabaseUrl ? `https://${new URL(supabaseUrl).hostname}` : "https://*.supabase.co",
        ...(isProduction ? [] : ["ws://localhost:3000", "ws://localhost:6006"]) // Websockets for local dev
    ];

    const frameSrc = [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
        "https://www.youtube.com"
    ];

    const fontSrc = [
        "'self'",
        "https://fonts.gstatic.com"
    ];

    const policies: { [key: string]: string[] } = {
        'default-src': ["'self'"],
        'script-src': scriptSrc,
        'style-src': styleSrc,
        'img-src': imgSrc,
        'font-src': fontSrc,
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'block-all-mixed-content': [],
        'upgrade-insecure-requests': [],
        'connect-src': connectSrc,
        'frame-src': frameSrc
    };

    // Add report-uri if not in strict mode or desired
    // For report-only, we MUST have a report-uri or report-to
    if (process.env.CSP_MODE === 'report-only') {
        // Using report-uri for broader compatibility, report-to is newer
        policies['report-uri'] = ['/api/csp-reports'];
    }

    return Object.entries(policies)
        .map(([key, values]) => {
            if (values.length === 0) return key;
            return `${key} ${values.join(' ')}`;
        })
        .join('; ');
}

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'es',
    localePrefix,
    pathnames
});

// Simple in-memory rate limit map (for demo purposes)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per IP for API routes

// Simple in-memory cache for blocked IPs to minimize DB calls
// Optimization: In a real edge environment, this cache is per-isolate.
// For shared caching across regions, consider using Vercel KV or Edge Config.
const blockedIpCache = new Map<string, { blocked: boolean, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

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

export default async function middleware(request: NextRequest) {
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

    // 2. Security: Block suspicious IPs from /admin (Dynamic Blacklist via Supabase)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('cf-connecting-ip') ||
        'unknown';

    // Skip localhost/unknown for development to avoid blocking self inadvertently if data is stale
    if (ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
        const now = Date.now();
        const cached = blockedIpCache.get(ip);
        let isBlocked = false;

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            isBlocked = cached.blocked;
        } else {
            // Check Supabase if not in cache or expired
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('blocked_ips')
                    .select('id')
                    .eq('ip_address', ip)
                    .single();

                isBlocked = !!data && !error;

                // Update cache
                blockedIpCache.set(ip, { blocked: isBlocked, timestamp: now });
            } catch (err) {
                console.error('Error checking blocked IP:', err);
                // Fail open (allow access) on DB error to prevent accidental outages
                isBlocked = false;
            }
        }

        if (isBlocked) {
            return new NextResponse(JSON.stringify({ error: 'Access Denied' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 3. CSP Headers & Geo-Detection
    const response = intlMiddleware(request);

    // Geo-Detection (Vercel specific) - usa header x-vercel-ip-country como fuente principal
    // En localhost no existe el header de Vercel, así que defaultea a 'MX' (tienda mexicana)

    // Verificar si ya existe una preferencia de moneda
    const existingCurrency = request.cookies.get('NEXT_CURRENCY')?.value;
    let currency = existingCurrency;

    if (!currency) {
        const vercelCountry = request.headers.get('x-vercel-ip-country');
        const country = vercelCountry || 'MX';
        currency = country === 'MX' ? 'MXN' : 'USD';
    }

    // Asegurar que la cookie esté presente (o renovarla)
    response.cookies.set('NEXT_CURRENCY', currency);

    const csp = generateCSP();
    const cspHeaderName = process.env.CSP_MODE === 'report-only'
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

    response.headers.set(cspHeaderName, csp);

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
