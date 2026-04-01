import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_CURRENCIES = new Set(['mxn', 'usd']);
const MIN_AMOUNT = 100;       // $1.00 mínimo en centavos
const MAX_AMOUNT = 1_000_000; // $10,000.00 máximo en centavos

/**
 * @swagger
 * /api/create-payment-intent:
 *   post:
 *     description: Crea un PaymentIntent de Stripe para Google Pay / Apple Pay.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency]
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Monto en centavos (ej. $150.00 MXN = 15000)
 *               currency:
 *                 type: string
 *                 description: Código ISO de la moneda (mxn, usd)
 *     responses:
 *       200:
 *         description: client_secret del PaymentIntent
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de Stripe
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, currency, orderId } = body as {
            amount: unknown;
            currency: unknown;
            orderId?: unknown;
        };

        if (!Number.isInteger(amount) || (amount as number) < MIN_AMOUNT || (amount as number) > MAX_AMOUNT) {
            return NextResponse.json(
                { error: `El campo "amount" debe ser un entero entre ${MIN_AMOUNT} y ${MAX_AMOUNT} centavos.` },
                { status: 400 }
            );
        }

        if (typeof currency !== 'string' || !VALID_CURRENCIES.has(currency.toLowerCase())) {
            return NextResponse.json(
                { error: 'El campo "currency" debe ser "mxn" o "usd".' },
                { status: 400 }
            );
        }

        if (orderId !== undefined && (typeof orderId !== 'string' || !UUID_REGEX.test(orderId))) {
            return NextResponse.json(
                { error: 'El campo "orderId" debe ser un UUID válido.' },
                { status: 400 }
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount as number,
            currency: (currency as string).toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata: {
                user_id: user.id,
                ...(typeof orderId === 'string' ? { order_id: orderId } : {}),
            },
        });

        return NextResponse.json({ client_secret: paymentIntent.client_secret });
    } catch (err) {
        console.error('[create-payment-intent] Stripe error:', err);
        return NextResponse.json(
            { error: 'No se pudo crear el PaymentIntent. Intenta de nuevo.' },
            { status: 500 }
        );
    }
}
