'use server';

import { registerSchema, RegisterInput } from '@/schemas/auth';

type ActionResponse = {
    success: boolean;
    message?: string;
    errors?: {
        [K in keyof RegisterInput]?: string[];
    };
};

export async function registerUser(data: RegisterInput): Promise<ActionResponse> {
    // 1. Validación isomórfica con Zod
    const result = registerSchema.safeParse(data);

    if (!result.success) {
        // Si la validación falla, devolvemos los errores formateados
        return {
            success: false,
            message: 'Validación fallida en el servidor',
            errors: result.error.flatten().fieldErrors,
        };
    }

    // 2. Simulación de registro (o llamada real a Supabase Admin si fuera necesario)
    // Aquí podríamos usar supabaseAdmin para crear el usuario sin exponer la key pública si quisiéramos
    // Por ahora, simulamos un éxito o un error de duplicado (ejemplo)

    const { email } = result.data;

    // Simulación: si el email es "error@test.com", fallamos
    if (email === 'error@test.com') {
        return {
            success: false,
            message: 'El usuario ya existe (simulado)',
        };
    }

    // Éxito
    return {
        success: true,
        message: 'Usuario registrado correctamente',
    };
}
