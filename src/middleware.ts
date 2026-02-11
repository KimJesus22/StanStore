import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limit map (for demo purposes)
// In production, use Redis (e.g., Upstash) for distributed state
const rateLimit = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per IP for API routes

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // 1. Security Headers
    // CSP: Content Security Policy
    // Allow scripts from self, Supabase, Stripe
    // Allow styles from self and inline (styled-components needs inline)
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co;
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

    // Replace newlines with spaces
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

    // 2. Rate Limiting (API Routes & Actions only)
    // We use the pathname to filter
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith('/api') || request.method === 'POST') {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();

        const record = rateLimit.get(ip);

        if (record) {
            if (now - record.startTime > RATE_LIMIT_WINDOW) {
                // Reset window
                rateLimit.set(ip, { count: 1, startTime: now });
            } else {
                // Increment count
                record.count++;
                if (record.count > MAX_REQUESTS) {
                    return new NextResponse('Too Many Requests', { status: 429 });
                }
            }
        } else {
            // New record
            rateLimit.set(ip, { count: 1, startTime: now });
        }

        // Cleanup old records occasionally (simple garbage collection simulation)
        if (rateLimit.size > 1000) {
            rateLimit.clear();
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> actually we WANT to match api for rate limit, so we keep them
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!_next/static|_next/image|favicon.ico).*)',
        },
    ],
};
