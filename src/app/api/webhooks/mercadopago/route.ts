import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/app/actions/audit';

/**
 * Verifies the HMAC-SHA256 signature that MercadoPago sends in the
 * `x-signature` header. Format: ts=<timestamp>,v1=<hash>
 *
 * Docs: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifySignature(req: NextRequest, rawBody: string): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return true; // Skip verification in dev if secret is not set

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

    return crypto.timingSafeEqual(
        Buffer.from(v1, 'hex'),
        Buffer.from(expectedHash, 'hex')
    );
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();

    // 1. Verify signature
    if (!verifySignature(req, rawBody)) {
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

        // 3. Approved: parse items from metadata and update order + stock
        const supabaseAdmin = await createClient();

        const rawItems = metadata?.items;
        const items: { id: string; quantity: number }[] = rawItems
            ? JSON.parse(rawItems)
            : [];

        if (items.length === 0) {
            console.warn(`MP Webhook: approved payment ${paymentId} has no item metadata`);
            return new NextResponse('No items metadata', { status: 200 });
        }

        // 4. Upsert the order as PAID (idempotent: if already paid, this is a no-op)
        const { error: orderError } = await supabaseAdmin
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
            console.error('Error upserting order:', orderError);
        }

        // 5. Decrement stock for each item (same RPC as Stripe webhook)
        for (const item of items) {
            const { error: stockError } = await supabaseAdmin.rpc('decrement_stock', {
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
            itemCount: items.length,
        });

        return new NextResponse('Received', { status: 200 });
    } catch (error) {
        console.error('MP Webhook error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
