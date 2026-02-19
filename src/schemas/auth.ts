import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string()
        .min(1, { message: 'validation.required' })
        .email({ message: 'validation.email' }),
    password: z.string()
        .min(8, { message: 'validation.passwordMin:8' })
        .regex(/[A-Z]/, { message: 'validation.passwordUppercase' })
        .regex(/[0-9]/, { message: 'validation.passwordNumber' }),
    confirmPassword: z.string()
        .min(1, { message: 'validation.required' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsMatch',
    path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
