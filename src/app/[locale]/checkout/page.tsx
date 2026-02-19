import { Suspense } from 'react';
import { CheckoutForm } from '@/features/checkout';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<p>Cargando checkout...</p>}>
            <CheckoutForm />
        </Suspense>
    );
}
