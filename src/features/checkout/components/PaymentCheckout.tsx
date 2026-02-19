'use client';

import { useEffect, useState, useCallback } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import styled from 'styled-components';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/features/cart';
import { useLocale } from 'next-intl';

// Initialize once at module level (idempotent)
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-MX' });

/* ─── Styled Components ─── */

const Wrapper = styled.div`
    width: 100%;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.95rem;
`;

const ErrorState = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: #fff3f3;
    border: 1px solid #fca5a5;
    border-radius: 10px;
    color: #dc2626;
    font-size: 0.9rem;
`;

const BrickContainer = styled.div`
    /* MercadoPago injects styles via its own iframe — ensure container is visible */
    min-height: 400px;
    border-radius: 12px;
    overflow: hidden;
`;

/* ─── Types ─── */

interface MPFormData {
    selectedPaymentMethod: string;
    formData: Record<string, unknown>;
}

interface PaymentCheckoutProps {
    /** Called with the MP form data when the user submits the brick */
    onPaymentSuccess?: (preferenceId: string) => void;
}

/* ─── Component ─── */

export default function PaymentCheckout({ onPaymentSuccess }: PaymentCheckoutProps) {
    const { items } = useCartStore();
    const locale = useLocale();

    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate total amount for the Payment Brick initialization
    const amount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Fetch a fresh preference from the backend
    useEffect(() => {
        if (items.length === 0) return;

        let cancelled = false;

        async function fetchPreference() {
            try {
                const res = await fetch('/api/create-preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                        locale,
                    }),
                });

                const data = await res.json();

                if (!res.ok || data.error) {
                    throw new Error(data.error || 'Error creating preference');
                }

                if (!cancelled) {
                    setPreferenceId(data.preferenceId);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Error desconocido');
                }
            }
        }

        fetchPreference();
        return () => { cancelled = true; };
    }, [items, locale]);

    const onReady = useCallback(() => {
        setIsReady(true);
    }, []);

    const onError = useCallback((err: unknown) => {
        console.error('MP Payment Brick error:', err);
        setError('Error al cargar el formulario de pago. Por favor recarga la página.');
    }, []);

    const onSubmit = useCallback(
        async ({ selectedPaymentMethod, formData }: MPFormData) => {
            setIsSubmitting(true);
            try {
                console.log('Payment method selected:', selectedPaymentMethod);
                console.log('Form data:', formData);

                // For async methods (OXXO, SPEI, etc.) the preference redirect handles it.
                // For cards, MP Bricks can process the payment directly.
                // Redirect is handled by back_urls configured in the preference.
                if (preferenceId) {
                    onPaymentSuccess?.(preferenceId);
                }
            } catch (err) {
                setError('Error al procesar el pago. Intenta de nuevo.');
                console.error(err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [preferenceId, onPaymentSuccess]
    );

    if (items.length === 0) return null;

    if (error) {
        return (
            <ErrorState>
                <AlertCircle size={20} />
                <span>{error}</span>
            </ErrorState>
        );
    }

    // Show spinner until the preferenceId is ready
    if (!preferenceId) {
        return (
            <LoadingState>
                <Loader2 size={32} className="animate-spin" />
                <span>Preparando formulario de pago...</span>
            </LoadingState>
        );
    }

    return (
        <Wrapper>
            {/* MP Brick renders inside this container */}
            {!isReady && (
                <LoadingState>
                    <Loader2 size={32} className="animate-spin" />
                    <span>Cargando métodos de pago...</span>
                </LoadingState>
            )}

            <BrickContainer style={{ display: isReady ? 'block' : 'none' }}>
                <Payment
                    initialization={{
                        amount,
                        preferenceId,
                    }}
                    customization={{
                        paymentMethods: {
                            // Credit & debit cards
                            creditCard: 'all',
                            debitCard: 'all',
                            // Offline methods: OXXO, SPEI, etc.
                            ticket: 'all',
                            bankTransfer: 'all',
                            // Disable wallets to keep the flow simple
                            mercadoPago: 'wallet_purchase',
                        },
                        visual: {
                            style: {
                                customVariables: {
                                    // Match the store's primary color
                                    baseColor: '#111111',
                                },
                            },
                        },
                    }}
                    onSubmit={onSubmit}
                    onReady={onReady}
                    onError={onError}
                />
            </BrickContainer>

            {isSubmitting && (
                <LoadingState style={{ paddingTop: '1rem' }}>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Procesando pago...</span>
                </LoadingState>
            )}
        </Wrapper>
    );
}
