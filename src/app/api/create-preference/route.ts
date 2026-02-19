import { NextRequest, NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabaseClient';

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
 *     responses:
 *       200:
 *         description: preferenceId generado por MercadoPago.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, locale = 'es' } = body as {
            items: { id: string; quantity: number }[];
            locale?: string;
        };

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // Fetch real prices from DB to prevent price tampering
        const preferenceItems = [];
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

            preferenceItems.push({
                id: item.id,
                title: product.name,
                // MercadoPago requires unit_price as a float (MXN)
                unit_price: Math.round(product.price * 100) / 100,
                quantity: item.quantity,
                currency_id: 'MXN',
                ...(product.description && { description: product.description }),
            });
        }

        if (preferenceItems.length === 0) {
            return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const preference = new Preference(mpClient);
        const result = await preference.create({
            body: {
                items: preferenceItems,
                back_urls: {
                    success: `${baseUrl}/${locale}/success`,
                    failure: `${baseUrl}/${locale}/checkout`,
                    pending: `${baseUrl}/${locale}/checkout`,
                },
                auto_return: 'approved',
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                // Store item metadata to reconcile in the webhook
                metadata: {
                    items: JSON.stringify(
                        items.map(i => ({ id: i.id, quantity: i.quantity }))
                    ),
                },
            },
        });

        return NextResponse.json({ preferenceId: result.id });
    } catch (error) {
        console.error('MercadoPago preference error:', error);
        return NextResponse.json(
            { error: 'Error creating payment preference' },
            { status: 500 }
        );
    }
}
