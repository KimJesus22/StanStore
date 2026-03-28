import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

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
 *       500:
 *         description: Error de Stripe
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency, orderId } = body as {
            amount: unknown;
            currency: unknown;
            orderId?: string; // ID de la orden pendiente en Supabase (opcional)
        };

        // Validación básica
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'El campo "amount" debe ser un número entero positivo (en centavos).' },
                { status: 400 }
            );
        }

        if (!currency || typeof currency !== 'string') {
            return NextResponse.json(
                { error: 'El campo "currency" es requerido (ej. "mxn" o "usd").' },
                { status: 400 }
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // asegura entero, por si llega con decimales
            currency: currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            // El webhook usa este metadata para identificar qué orden marcar como pagada
            metadata: orderId ? { order_id: orderId } : {},
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
