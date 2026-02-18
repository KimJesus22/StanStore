import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "Por favor, introduce un correo válido, lo necesitamos para tu pedido." }),
    password: z.string().min(8, { message: "Tu contraseña debe ser segura, al menos 8 caracteres." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Ups, las contraseñas no coinciden. Inténtalo de nuevo.",
    path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
