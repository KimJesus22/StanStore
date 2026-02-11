'use server';

import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';
import { logAuditAction } from '@/app/actions/audit';

export async function createCheckoutSession(cartItems: { id: string; quantity: number }[]) {
    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            console.error('Stripe Secret Key missing');
            return { error: 'Configuration Error: Stripe key missing' };
        }

        const stripe = new Stripe(stripeKey, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiVersion: '2025-01-27.acacia' as any, // Bypass TS check for latest version
        });

        // 1. Validate items and fetch real prices from DB
        const lineItems = [];

        for (const item of cartItems) {
            const { data: product, error } = await supabase
                .from('products')
                .select('name, price, image_url')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                console.error(`Product not found: ${item.id}`);
                continue; // Skip invalid items
            }

            // Stripe requires absolute URLs. 
            // Also, Stripe cannot access localhost images, so we only send images if they are from a public URL.
            // For now, we'll try to constructs a valid URL, but if it's localhost, Stripe might warn or fail to display it.
            // To be safe, let's only send images if they start with http/https and NOT localhost, 
            // OR if we are in production.

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            let imageUrl = product.image_url;

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }

            // Filter out localhost images to prevent Stripe errors if it tries to validate reachability
            // (Stripe sometimes errors on unreachable URLs)
            const validImages = [];
            if (imageUrl && !imageUrl.includes('localhost') && !imageUrl.includes('127.0.0.1')) {
                validImages.push(imageUrl);
            }

            lineItems.push({
                price_data: {
                    currency: 'mxn', // Changed to MXN as per user's card limitation error
                    product_data: {
                        name: product.name,
                        images: validImages,
                    },
                    unit_amount: Math.round(product.price * 100), // Stripe expects cents, so 29.99 becomes $29.99 MXN
                },
                quantity: item.quantity,
            });
        }

        if (lineItems.length === 0) {
            throw new Error('No valid items in cart');
        }

        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`,
        });

        // Audit Log
        await logAuditAction('CHECKOUT_SESSION_CREATED', {
            amountTotal: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0) / 100,
            itemCount: cartItems.length
        });

        return { url: session.url };
    } catch (error: unknown) {
        console.error('Stripe Error:', error);
        await logAuditAction('CHECKOUT_SESSION_FAILED', { error: error instanceof Error ? error.message : String(error) });
        return { error: 'Error creating checkout session' };
    }
}
