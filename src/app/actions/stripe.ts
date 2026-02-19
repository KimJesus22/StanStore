'use server';

import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { logAuditAction } from '@/app/actions/audit';
import { ShippingInfo } from '@/types';
import { POINTS_DISCOUNT_MXN } from '@/features/cart';

export async function createCheckoutSession(
    cartItems: { id: string; quantity: number }[],
    legalMetadata?: { agreedAt: string; userAgent: string },
    locale: string = 'es',
    shippingInfo?: ShippingInfo,
    referrerId?: string,
    usePoints?: boolean,
    userId?: string
) {
    try {
        // Stripe instance comes from lib/stripe with version checks

        // 1. Validate items and fetch real prices from DB
        const lineItems = [];

        for (const item of cartItems) {
            const { data: product, error } = await supabase
                .from('products')
                .select('name, price, image_url')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product not found: ${item.id}`);
                continue; // Skip invalid items
            }

            // Stripe requires absolute URLs. 
            // Also, Stripe cannot access localhost images, so we only send images if they are from a public URL.
            // For now, we'll try to constructs a valid URL, but if it's localhost, Stripe might warn or fail to display it.
            // To be safe, let's only send images if they start with http/https and NOT localhost, 
            // OR if we are in production.

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            let imageUrl = product.image_url;

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }

            // Filter out localhost images to prevent Stripe errors if it tries to validate reachability
            // (Stripe sometimes errors on unreachable URLs)
            const validImages = [];
            if (imageUrl && !imageUrl.includes('localhost') && !imageUrl.includes('127.0.0.1')) {
                validImages.push(imageUrl);
            }

            // Base price is already in MXN, no exchange needed.

            lineItems.push({
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: product.name,
                        images: validImages,
                    },
                    unit_amount: Math.round(product.price * 100), // MXN → centavos
                },
                quantity: item.quantity,
            });
        }

        if (lineItems.length === 0) {
            throw new Error('No valid items in cart');
        }

        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/`,
            metadata: {
                // We serialize the items to retrieve them in the webhook
                items: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity }))),
                // Legal Metadata
                agreedAt: legalMetadata?.agreedAt || '',
                userAgent: legalMetadata?.userAgent || '',
                // Shipping Info
                shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : '',
                // Referral tracking
                referrerId: referrerId || '',
                // Points redemption
                pointsRedeemed: usePoints ? 'true' : '',
                redeemerUserId: userId || '',
            },
        });

        // If user is redeeming points, apply discount via Stripe coupon
        if (usePoints && userId) {
            // Deduct points atomically BEFORE redirecting to Stripe
            const { redeemLoyaltyPoints } = await import('@/app/actions/loyalty');
            const redemption = await redeemLoyaltyPoints(userId);

            if (!redemption.success) {
                return { error: redemption.error || 'Error al canjear puntos' };
            }

            // Create a one-time Stripe coupon and apply it
            const coupon = await stripe.coupons.create({
                amount_off: POINTS_DISCOUNT_MXN * 100, // centavos
                currency: 'mxn',
                duration: 'once',
                name: 'Descuento Lealtad (500 pts)',
                max_redemptions: 1,
            });

            // Update session with the discount
            // Since we can't modify a session, we need to create a new one with the discount
            // Let's recreate the session with the discount applied
            const discountSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                discounts: [{ coupon: coupon.id }],
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/`,
                metadata: {
                    items: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity }))),
                    agreedAt: legalMetadata?.agreedAt || '',
                    userAgent: legalMetadata?.userAgent || '',
                    shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : '',
                    referrerId: referrerId || '',
                    pointsRedeemed: 'true',
                    redeemerUserId: userId,
                },
            });

            await logAuditAction('CHECKOUT_SESSION_CREATED', {
                amountTotal: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0) / 100,
                itemCount: cartItems.length,
                legalAgreement: !!legalMetadata,
                pointsRedeemed: true,
                discount: POINTS_DISCOUNT_MXN,
            });

            return { url: discountSession.url };
        }

        // Audit Log
        await logAuditAction('CHECKOUT_SESSION_CREATED', {
            amountTotal: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0) / 100,
            itemCount: cartItems.length,
            legalAgreement: !!legalMetadata
        });

        return { url: session.url };
    } catch (error: unknown) {
        console.error('Stripe Error:', error);
        await logAuditAction('CHECKOUT_SESSION_FAILED', { error: error instanceof Error ? error.message : String(error) });
        return { error: 'Error creating checkout session' };
    }
}
