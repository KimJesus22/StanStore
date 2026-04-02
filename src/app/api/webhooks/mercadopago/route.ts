import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/app/actions/audit';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verifies the HMAC-SHA256 signature that MercadoPago sends in the
 * `x-signature` header. Format: ts=<timestamp>,v1=<hash>
 *
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifySignature(req: NextRequest): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;
    // Fail-closed: reject all requests if secret is not configured
    if (!secret) return false;

    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const dataId = new URL(req.url).searchParams.get('data.id');

    if (!xSignature) return false;

    // Parse ts and v1 from the header
    const parts = Object.fromEntries(
        xSignature.split(',').map(part => part.split('=') as [string, string])
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) return false;

    // Build the signed template
    const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(template)
        .digest('hex');

    // Guard: timingSafeEqual throws RangeError if buffers differ in length;
    // v1 must be a valid 64-char hex string (32 bytes = SHA-256 output)
    if (v1.length !== expectedHash.length) return false;

    try {
        return crypto.timingSafeEqual(
            Buffer.from(v1, 'hex'),
            Buffer.from(expectedHash, 'hex')
        );
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();

    // 1. Verify signature — fail-closed (rejects if MP_WEBHOOK_SECRET is unset)
    if (!verifySignature(req)) {
        console.warn('MP Webhook: Invalid signature');
        return new NextResponse('Unauthorized', { status: 401 });
    }

    let body: { type: string; data: { id: string } };
    try {
        body = JSON.parse(rawBody);
    } catch {
        return new NextResponse('Invalid JSON', { status: 400 });
    }

    // MercadoPago sends different notification types. We only care about payments.
    if (body.type !== 'payment') {
        return new NextResponse('Ignored', { status: 200 });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
        return new NextResponse('Missing payment ID', { status: 400 });
    }

    try {
        // 2. Fetch the payment from MP API to confirm status (never trust the notification body alone)
        const paymentClient = new Payment(mpClient);
        const payment = await paymentClient.get({ id: paymentId });

        const status = payment.status; // 'approved' | 'pending' | 'rejected' | etc.
        const externalReference = payment.external_reference;
        const metadata = payment.metadata as { items?: string } | undefined;

        await logAuditAction('MP_WEBHOOK_RECEIVED', {
            paymentId,
            status,
            externalReference,
        });

        if (status !== 'approved') {
            // Non-approved payments (pending OXXO tickets, failed cards, etc.)
            // are handled passively — we log them but do NOT update the order to paid.
            console.log(`MP payment ${paymentId} status: ${status} — no action taken`);
            return new NextResponse('Received', { status: 200 });
        }

        // 3. Idempotency: if this payment was already processed, skip all writes
        const supabase = await createClient();
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('status')
            .eq('mp_payment_id', String(paymentId))
            .maybeSingle();

        if (existingOrder?.status === 'PAID') {
            console.log(`MP Webhook: payment ${paymentId} already processed — skipping`);
            return new NextResponse('Already processed', { status: 200 });
        }

        // 4. Validate items from payment metadata (data originally set by us in create-preference,
        //    but arrives via external MP API so must be re-validated)
        const rawItems = metadata?.items;
        let items: { id: string; quantity: number }[] = [];
        try {
            items = rawItems ? JSON.parse(rawItems) : [];
        } catch {
            console.warn(`MP Webhook: invalid items JSON for payment ${paymentId}`);
            return new NextResponse('Invalid items metadata', { status: 400 });
        }

        const validItems = items.filter(
            item =>
                item &&
                typeof item.id === 'string' &&
                UUID_REGEX.test(item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0 &&
                item.quantity <= 99
        );

        if (validItems.length === 0) {
            console.warn(`MP Webhook: approved payment ${paymentId} has no valid item metadata`);
            return new NextResponse('No valid items metadata', { status: 200 });
        }

        // 5. Upsert the order as PAID (idempotent: if already paid, this is a no-op)
        const { error: orderError } = await supabase
            .from('orders')
            .upsert(
                {
                    mp_payment_id: String(paymentId),
                    status: 'PAID',
                    payment_method: 'MERCADOPAGO',
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'mp_payment_id', ignoreDuplicates: false }
            );

        if (orderError) {
            // Return 500 so MercadoPago retries; do NOT proceed to stock decrement
            // with an unsaved order (would leave DB inconsistent)
            console.error('Error upserting order:', orderError);
            return new NextResponse('Internal Server Error', { status: 500 });
        }

        // 6. Decrement stock for each validated item
        for (const item of validItems) {
            const { error: stockError } = await supabase.rpc('decrement_stock', {
                product_id: item.id,
                quantity_to_decrement: item.quantity,
            });

            if (stockError) {
                console.error(`Failed to decrement stock for ${item.id}:`, stockError);
                await logAuditAction('INVENTORY_SYNC_FAILED', {
                    paymentId,
                    productId: item.id,
                    error: stockError.message,
                });
            }
        }

        await logAuditAction('MP_ORDER_PROCESSED', {
            paymentId,
            itemCount: validItems.length,
        });

        return new NextResponse('Received', { status: 200 });
    } catch (error) {
        console.error('MP Webhook error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
