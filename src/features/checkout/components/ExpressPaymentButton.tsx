'use client';

import { useEffect, useState } from 'react';
import { useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import type { PaymentRequest } from '@stripe/stripe-js';
import { useStripePayment } from './StripeElementsProvider';

interface ExpressPaymentButtonProps {
    /** Llamado cuando el pago se completa con éxito */
    onSuccess?: () => void;
    /** Llamado cuando el pago falla; recibe el mensaje de error */
    onError?: (message: string) => void;
}

/**
 * Renderiza el botón de Google Pay / Apple Pay si el dispositivo lo soporta.
 * Devuelve null si canMakePayment() retorna falso (PC sin wallet configurada, etc.).
 *
 * Debe estar dentro de <Elements> (montado por StripeElementsProvider).
 */
export default function ExpressPaymentButton({ onSuccess, onError }: ExpressPaymentButtonProps) {
    const stripe = useStripe();
    const { clientSecret, amountInCents } = useStripePayment();
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

    useEffect(() => {
        if (!stripe || !clientSecret || amountInCents <= 0) return;

        const pr = stripe.paymentRequest({
            country: 'MX',
            currency: 'mxn',
            total: {
                label: 'Total StanStore',
                amount: amountInCents, // centavos
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });

        // Solo mostrar el botón si el dispositivo tiene un wallet configurado
        pr.canMakePayment().then((result) => {
            if (result) setPaymentRequest(pr);
        });

        pr.on('paymentmethod', async (ev) => {
            // Primer intento: confirmar sin redireccionamiento (handleActions: false)
            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: ev.paymentMethod.id },
                { handleActions: false }
            );

            if (confirmError) {
                ev.complete('fail');
                onError?.(confirmError.message ?? 'Error al procesar el pago.');
                return;
            }

            // Indicar éxito al sheet de Google/Apple Pay
            ev.complete('success');

            // Si el banco requiere autenticación adicional (3D Secure, etc.)
            if (paymentIntent?.status === 'requires_action') {
                const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
                if (actionError) {
                    onError?.(actionError.message ?? 'Se requiere verificación adicional.');
                } else {
                    onSuccess?.();
                }
            } else {
                onSuccess?.();
            }
        });

        // Cleanup: evitar listeners duplicados si el efecto se vuelve a ejecutar
        return () => {
            pr.off('paymentmethod');
        };
    }, [stripe, clientSecret, amountInCents, onSuccess, onError]);

    if (!paymentRequest) return null;

    return (
        <PaymentRequestButtonElement
            options={{
                paymentRequest,
                style: {
                    paymentRequestButton: {
                        type: 'buy',    // muestra "Comprar con Google Pay"
                        theme: 'dark',  // botón oscuro (encaja con el tema del sitio)
                        height: '48px',
                    },
                },
            }}
        />
    );
}
