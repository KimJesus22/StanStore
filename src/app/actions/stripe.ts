'use server';

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { logAuditAction } from '@/app/actions/audit';
import { ShippingInfo } from '@/types';
import { POINTS_DISCOUNT_MXN } from '@/features/cart';

export async function validatePromoCode(code: string) {
    try {
        const promoCodes = await stripe.promotionCodes.list({
            code: code.trim().toUpperCase(),
            active: true,
            limit: 1,
        });

        if (promoCodes.data.length === 0) {
            return { error: 'Código de descuento inválido o expirado' };
        }

        const promoCode = promoCodes.data[0];
        const coupon = promoCode.promotion.coupon;

        if (!coupon || typeof coupon === 'string') {
            return { error: 'Error al obtener datos del cupón' };
        }

        return {
            id: promoCode.id,
            percentOff: coupon.percent_off ?? null,
            amountOff: coupon.amount_off ? coupon.amount_off / 100 : null, // centavos → MXN
        };
    } catch (error) {
        console.error('Error validating promo code:', error);
        return { error: 'Error al validar el código' };
    }
}

export async function createCheckoutSession(
    cartItems: { id: string; quantity: number }[],
    legalMetadata?: { agreedAt: string; userAgent: string },
    locale: string = 'es',
    shippingInfo?: ShippingInfo,
    referrerId?: string,
    usePoints?: boolean,
    userId?: string,
    promoCodeId?: string
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

        // 2. Build discounts array
        const discounts: { coupon?: string; promotion_code?: string }[] = [];

        // Points discount: deduct atomically before creating session
        if (usePoints && userId) {
            const { redeemLoyaltyPoints } = await import('@/app/actions/loyalty');
            const redemption = await redeemLoyaltyPoints(userId);
            if (!redemption.success) {
                return { error: redemption.error || 'Error al canjear puntos' };
            }
            const coupon = await stripe.coupons.create({
                amount_off: POINTS_DISCOUNT_MXN * 100,
                currency: 'mxn',
                duration: 'once',
                name: 'Descuento Lealtad (500 pts)',
                max_redemptions: 1,
            });
            discounts.push({ coupon: coupon.id });
        }

        // Promo code discount
        if (promoCodeId) {
            discounts.push({ promotion_code: promoCodeId });
        }

        // 3. Create Stripe Session (single session with all discounts)
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/`,
            metadata: {
                items: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity }))),
                agreedAt: legalMetadata?.agreedAt || '',
                userAgent: legalMetadata?.userAgent || '',
                shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : '',
                referrerId: referrerId || '',
                pointsRedeemed: usePoints ? 'true' : '',
                redeemerUserId: userId || '',
            },
        };

        if (discounts.length > 0) {
            sessionParams.discounts = discounts;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        // Audit Log
        await logAuditAction('CHECKOUT_SESSION_CREATED', {
            amountTotal: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0) / 100,
            itemCount: cartItems.length,
            legalAgreement: !!legalMetadata,
            pointsRedeemed: !!usePoints,
            promoCode: promoCodeId ? true : false,
        });

        return { url: session.url };
    } catch (error: unknown) {
        console.error('Stripe Error:', error);
        await logAuditAction('CHECKOUT_SESSION_FAILED', { error: error instanceof Error ? error.message : String(error) });
        return { error: 'Error creating checkout session' };
    }
}
