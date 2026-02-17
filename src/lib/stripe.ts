import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion = process.env.STRIPE_API_VERSION;

if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing. Using a placeholder for build purposes.');
}

if (!stripeApiVersion) {
    console.warn('⚠️ STRIPE_API_VERSION is missing. Using latest version for build purposes.');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
    apiVersion: (stripeApiVersion as Stripe.LatestApiVersion) || '2025-01-27.acacia',
    appInfo: {
        name: 'StanStore',
        version: '0.1.0',
    },
    typescript: true,
});
