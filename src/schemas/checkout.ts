import { z } from 'zod';

type Translator = (key: string, values?: Record<string, string | number>) => string;

export const createCheckoutSchema = (t: Translator) => z.object({
    firstName: z.string().min(1, t('required')),
    lastName: z.string().min(1, t('required')),
    address: z.string().min(5, t('required')),
    apartment: z.string().optional(),
    postalCode: z.string().min(5, t('required')),
    city: z.string().min(1, t('required')),
    state: z.string().min(1, t('required')),
    country: z.string().default('México'),
    phone: z.string().min(10, t('phoneMin')),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: t('acceptTerms')
    }),
});

export type CheckoutSchema = z.infer<ReturnType<typeof createCheckoutSchema>>;
