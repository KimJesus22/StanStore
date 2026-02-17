import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion = process.env.STRIPE_API_VERSION;

if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
}

if (!stripeApiVersion) {
    throw new Error('Missing STRIPE_API_VERSION in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: stripeApiVersion as Stripe.LatestApiVersion,
    appInfo: {
        name: 'StanStore',
        version: '0.1.0',
    },
});
