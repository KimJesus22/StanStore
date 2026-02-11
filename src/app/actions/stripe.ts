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

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: product.image_url ? [product.image_url] : [],
                    },
                    unit_amount: Math.round(product.price * 100), // Stripe expects cents
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
    } catch (error: any) {
        console.error('Stripe Error:', error);
        await logAuditAction('CHECKOUT_SESSION_FAILED', { error: error.message });
        return { error: 'Error creating checkout session' };
    }
}
