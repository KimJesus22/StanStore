import { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { MiddlewareFactory } from './chain';

function generateCSP() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    const scriptSrc = [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://m.stripe.network",
        "https://va.vercel-scripts.com",
        ...(isProduction ? [] : ["'unsafe-eval'"])
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
        "https://vitals.vercel-insights.com",
        supabaseUrl ? `https://${new URL(supabaseUrl).hostname}` : "https://*.supabase.co",
        ...(isProduction ? [] : ["ws://localhost:3000", "ws://localhost:6006"])
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

    if (process.env.CSP_MODE === 'report-only') {
        policies['report-uri'] = ['/api/csp-reports'];
    }

    return Object.entries(policies)
        .map(([key, values]) => {
            if (values.length === 0) return key;
            return `${key} ${values.join(' ')}`;
        })
        .join('; ');
}

export const withSecurityHeaders: MiddlewareFactory = (next: NextMiddleware) => {
    return async (request: NextRequest, _next: NextFetchEvent) => {
        const response = await next(request, _next);

        if (response) {
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
        }

        return response;
    };
};
