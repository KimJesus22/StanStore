import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_BYTES = 8_192; // 8 KB is more than enough for a CSP report

// Allowlist of standard CSP report fields — prevents arbitrary key/value log injection
const CSP_FIELDS = [
    'document-uri',
    'referrer',
    'blocked-uri',
    'violated-directive',
    'effective-directive',
    'original-policy',
    'disposition',
    'status-code',
    'source-file',
    'line-number',
    'column-number',
] as const;

/** Strip control characters and newlines to prevent log injection */
function sanitize(value: unknown): string {
    if (typeof value !== 'string' && typeof value !== 'number') return '';
    return String(value)
        .replace(/[\x00-\x1f\x7f]/g, '') // control chars (incl. \n, \r, \t)
        .slice(0, 500);                   // cap field length
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') ?? '';
        if (!contentType.includes('application/csp-report') && !contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
        }

        const contentLength = Number(request.headers.get('content-length') ?? 0);
        if (contentLength > MAX_BODY_BYTES) {
            return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
        }

        const body = await request.json();
        const raw = (body && typeof body['csp-report'] === 'object' ? body['csp-report'] : body) as Record<string, unknown>;

        // Extract and sanitize only known CSP fields
        const report: Record<string, string> = {};
        for (const field of CSP_FIELDS) {
            const val = sanitize(raw[field]);
            if (val) report[field] = val;
        }

        console.warn('CSP Violation:', JSON.stringify(report));

        return NextResponse.json({ status: 'ok' });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
