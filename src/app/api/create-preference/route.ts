import { NextRequest, NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { POINTS_DISCOUNT_MXN, POINTS_REQUIRED } from '@/features/cart';

/**
 * @swagger
 * /api/create-preference:
 *   post:
 *     description: Crea una preferencia de MercadoPago y devuelve el preferenceId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     quantity: { type: number }
 *               locale:
 *                 type: string
 *               promoCodeId:
 *                 type: string
 *               usePoints:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: preferenceId generado por MercadoPago.
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_LOCALES = new Set(['es', 'en', 'ko', 'pt-BR', 'fr-CA']);
const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { items, locale = 'es', promoCodeId, usePoints = false } = body as {
            items: { id: string; quantity: number }[];
            locale?: string;
            promoCodeId?: string;
            usePoints?: boolean;
        };

        if (!VALID_LOCALES.has(locale)) {
            return NextResponse.json({ error: 'Locale no válido' }, { status: 400 });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        if (items.length > MAX_ITEMS) {
            return NextResponse.json({ error: `Máximo ${MAX_ITEMS} productos por pedido` }, { status: 400 });
        }

        for (const item of items) {
            if (!item.id || !UUID_REGEX.test(String(item.id))) {
                return NextResponse.json({ error: 'ID de producto no válido' }, { status: 400 });
            }
            const qty = Number(item.quantity);
            if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
                return NextResponse.json({ error: 'Cantidad no válida' }, { status: 400 });
            }
        }

        // Fetch real prices from DB to prevent price tampering
        const preferenceItems = [];
        let subtotal = 0;

        for (const item of items) {
            const { data: product, error } = await supabase
                .from('products')
                .select('name, price, image_url, description')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product not found: ${item.id}`);
                continue;
            }

            subtotal += product.price * item.quantity;
            preferenceItems.push({
                id: item.id,
                title: product.name,
                unit_price: Math.round(product.price * 100) / 100,
                quantity: item.quantity,
                currency_id: 'MXN',
                ...(product.description && { description: product.description }),
            });
        }

        if (preferenceItems.length === 0) {
            return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
        }

        // Calculate discount server-side — never trust client-supplied amounts
        let discountAmount = 0;

        if (usePoints === true) {
            const { data: userData } = await supabase
                .from('users')
                .select('loyalty_points')
                .eq('id', user.id)
                .single();
            if (userData && userData.loyalty_points >= POINTS_REQUIRED) {
                discountAmount += POINTS_DISCOUNT_MXN;
            }
        }

        if (promoCodeId && typeof promoCodeId === 'string') {
            try {
                const promo = await stripe.promotionCodes.retrieve(promoCodeId);
                const coupon = promo.active ? promo.promotion?.coupon : null;
                if (coupon && typeof coupon !== 'string') {
                    if (coupon.percent_off) {
                        discountAmount += Math.round(subtotal * (coupon.percent_off / 100) * 100) / 100;
                    } else if (coupon.amount_off) {
                        discountAmount += coupon.amount_off / 100; // centavos → MXN
                    }
                }
            } catch {
                // promoCodeId inválido — sin descuento
            }
        }

        if (discountAmount > 0 && subtotal > 0) {
            const discountFactor = Math.max(0, 1 - discountAmount / subtotal);
            for (const item of preferenceItems) {
                item.unit_price = Math.round(item.unit_price * discountFactor * 100) / 100;
            }
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const preference = new Preference(mpClient);
        const result = await preference.create({
            body: {
                items: preferenceItems,
                back_urls: {
                    success: `${baseUrl}/${locale}/success`,
                    failure: `${baseUrl}/${locale}/cancel?reason=failed`,
                    pending: `${baseUrl}/${locale}/success`,
                },
                auto_return: 'approved',
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                metadata: {
                    user_id: user.id,
                    items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))),
                    discountAmount: String(discountAmount),
                },
            },
        });

        return NextResponse.json({
            preferenceId: result.id,
            initPoint: result.init_point,
        });
    } catch (error) {
        console.error('MercadoPago preference error:', error);
        return NextResponse.json(
            { error: 'Error creating payment preference' },
            { status: 500 }
        );
    }
}
