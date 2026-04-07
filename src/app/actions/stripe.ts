'use server';

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditAction } from '@/app/actions/audit';
import { ShippingInfo } from '@/types';
import { POINTS_DISCOUNT_MXN } from '@/features/cart';

// ── Constantes ────────────────────────────────────────────────────────────────

const UUID_REGEX  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS   = 50;
const MAX_QTY     = 99;

// ── validatePromoCode ─────────────────────────────────────────────────────────

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

// ── createCheckoutSession ─────────────────────────────────────────────────────

export async function createCheckoutSession(
    cartItems: { id: string; quantity: number }[],
    legalMetadata?: { agreedAt: string; userAgent: string },
    locale: string = 'es',
    shippingInfo?: ShippingInfo,
    referrerId?: string,
    usePoints?: boolean,
    promoCodeId?: string
    // userId eliminado — se deriva de la sesión del servidor
) {
    try {
        // 1. Autenticación — userId siempre del servidor
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'No autorizado.' };
        const userId = user.id;

        // 2. Validar cartItems
        if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > MAX_ITEMS) {
            return { error: 'Carrito inválido.' };
        }
        for (const item of cartItems) {
            if (!UUID_REGEX.test(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QTY) {
                return { error: 'Producto inválido en el carrito.' };
            }
        }
        if (referrerId && !UUID_REGEX.test(referrerId)) {
            return { error: 'Referido inválido.' };
        }

        // 3. Validar productos contra DB y construir lineItems
        const admin = createAdminClient();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const lineItems = [];

        for (const item of cartItems) {
            const { data: product, error } = await admin
                .from('products')
                .select('name, price, image_url')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                return { error: 'Uno o más productos no están disponibles.' };
            }

            let imageUrl = product.image_url;
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }
            const validImages: string[] = [];
            if (imageUrl && !imageUrl.includes('localhost') && !imageUrl.includes('127.0.0.1')) {
                validImages.push(imageUrl);
            }

            lineItems.push({
                price_data: {
                    currency: 'mxn',
                    product_data: { name: product.name, images: validImages },
                    unit_amount: Math.round(product.price * 100), // MXN → centavos
                },
                quantity: item.quantity,
            });
        }

        if (lineItems.length === 0) {
            return { error: 'No hay productos válidos en el carrito.' };
        }

        // 4. Construir descuentos — cupón de puntos creado en Stripe ANTES de descontar en DB
        const discounts: { coupon?: string; promotion_code?: string }[] = [];

        if (usePoints) {
            const coupon = await stripe.coupons.create({
                amount_off: POINTS_DISCOUNT_MXN * 100,
                currency: 'mxn',
                duration: 'once',
                name: 'Descuento Lealtad (500 pts)',
                max_redemptions: 1,
            });
            discounts.push({ coupon: coupon.id });
        }

        if (promoCodeId) {
            discounts.push({ promotion_code: promoCodeId });
        }

        // 5. Crear sesión de Stripe ANTES de descontar puntos
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/${locale}/cancel`,
            metadata: {
                items: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity }))),
                agreedAt: legalMetadata?.agreedAt || '',
                userAgent: legalMetadata?.userAgent || '',
                shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : '',
                referrerId: referrerId || '',
                pointsRedeemed: usePoints ? 'true' : '',
                redeemerUserId: userId,
            },
        };

        if (discounts.length > 0) {
            sessionParams.discounts = discounts;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        // 6. Descontar puntos DESPUÉS de confirmar la sesión
        //    Si falla, expiramos la sesión para evitar descuento gratis
        if (usePoints) {
            const { redeemLoyaltyPoints } = await import('@/app/actions/loyalty');
            const redemption = await redeemLoyaltyPoints(userId);
            if (!redemption.success) {
                try {
                    await stripe.checkout.sessions.expire(session.id);
                } catch (expireErr) {
                    console.error('Error expirando sesión de Stripe tras fallo de puntos:', expireErr);
                }
                return { error: redemption.error || 'Error al canjear puntos. El proceso fue cancelado.' };
            }
        }

        // 7. Audit log
        await logAuditAction('CHECKOUT_SESSION_CREATED', {
            amountTotal: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0) / 100,
            itemCount: cartItems.length,
            legalAgreement: !!legalMetadata,
            pointsRedeemed: !!usePoints,
            promoCode: !!promoCodeId,
        });

        return { url: session.url };
    } catch (error: unknown) {
        console.error('Stripe Error:', error);
        await logAuditAction('CHECKOUT_SESSION_FAILED', { error: error instanceof Error ? error.message : String(error) });
        return { error: 'Error al crear la sesión de pago.' };
    }
}
