import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');

        if (contentType === 'application/csp-report' || contentType === 'application/json') {
            const body = await request.json();
            const report = body['csp-report'] || body;

            // Log to console (in production this would go to Sentry or a logging service)
            console.warn('⚠️ CSP Violation:', JSON.stringify(report, null, 2));

            // Optional: Send to Sentry if available
            // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            //     Sentry.captureMessage('CSP Violation', {
            //         level: 'warning',
            //         extra: report
            //     });
            // }

            return NextResponse.json({ status: 'ok' });
        }

        return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
    } catch (error) {
        console.error('Error processing CSP report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
