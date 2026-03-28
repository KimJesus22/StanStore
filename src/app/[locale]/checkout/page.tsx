import { Suspense } from 'react';
import { CheckoutForm, StripeElementsProvider } from '@/features/checkout';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<p>Cargando checkout...</p>}>
            <StripeElementsProvider>
                <CheckoutForm />
            </StripeElementsProvider>
        </Suspense>
    );
}
