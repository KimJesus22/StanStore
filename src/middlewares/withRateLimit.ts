import { createClient } from '@supabase/supabase-js';
import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { MiddlewareFactory } from './chain';

const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 20;

const blockedIpCache = new Map<string, { blocked: boolean, timestamp: number }>();
const CACHE_TTL = 60 * 1000;

export const withRateLimit: MiddlewareFactory = (next: NextMiddleware) => {
    return async (request: NextRequest, event: NextFetchEvent) => {
        const pathname = request.nextUrl.pathname;
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

        // 1. Rate Limiting
        if (pathname.startsWith('/api') || request.method === 'POST') {
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

        // 2. IP Blocking
        if (ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
            const now = Date.now();
            const cached = blockedIpCache.get(ip);
            let isBlocked = false;

            if (cached && (now - cached.timestamp < CACHE_TTL)) {
                isBlocked = cached.blocked;
            } else {
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
                    blockedIpCache.set(ip, { blocked: isBlocked, timestamp: now });
                } catch (err) {
                    console.error('Error checking blocked IP:', err);
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

        return next(request, event);
    };
};
