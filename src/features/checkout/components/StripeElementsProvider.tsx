'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCartStore, calculateCartTotals } from '@/features/cart';

// Inicializar fuera del ciclo de vida — se crea una sola vez
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Contexto para exponer clientSecret y amount a componentes hijos
interface StripePaymentContextValue {
    clientSecret: string | null;
    amountInCents: number;
}

export const StripePaymentContext = createContext<StripePaymentContextValue>({
    clientSecret: null,
    amountInCents: 0,
});

export const useStripePayment = () => useContext(StripePaymentContext);

interface StripeElementsProviderProps {
    children: React.ReactNode;
}

export default function StripeElementsProvider({ children }: StripeElementsProviderProps) {
    const items = useCartStore((s) => s.items);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [amountInCents, setAmountInCents] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;

        const { total } = calculateCartTotals(items, true); // incluir envío estimado
        const cents = Math.round(total * 100);
        setAmountInCents(cents);

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: cents, currency: 'mxn' }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.client_secret) setClientSecret(data.client_secret);
            })
            .catch((err) => console.error('[StripeElementsProvider] Error creando PaymentIntent:', err));
    }, [items]);

    const contextValue: StripePaymentContextValue = { clientSecret, amountInCents };

    if (!clientSecret) {
        // Antes de tener clientSecret, los hijos funcionan normalmente
        // (CheckoutForm clásico sigue operativo; botones express aparecerán al cargar)
        return (
            <StripePaymentContext.Provider value={contextValue}>
                {children}
            </StripePaymentContext.Provider>
        );
    }

    return (
        <StripePaymentContext.Provider value={contextValue}>
            <Elements
                stripe={stripePromise}
                options={{
                    clientSecret,
                    appearance: { theme: 'stripe' },
                }}
            >
                {children}
            </Elements>
        </StripePaymentContext.Provider>
    );
}
