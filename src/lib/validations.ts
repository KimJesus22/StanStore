import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('El correo electrónico no es válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const RegisterSchema = z.object({
    email: z.string().email('El correo electrónico no es válido'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
});

export const SearchSchema = z.object({
    query: z.string().trim().max(100, 'La búsqueda es demasiado larga').optional(),
});
