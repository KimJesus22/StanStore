'use server';

import { createClient } from '@/lib/supabase/server';
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
        return {
            success: false,
            message: 'Validación fallida en el servidor',
            errors: result.error.flatten().fieldErrors,
        };
    }

    // confirmPassword solo se usa para validación en cliente/servidor — no se envía a Supabase
    const { email, password } = result.data;

    // 2. Crear usuario en Supabase Auth
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error('Error registering user:', error);
        // Mensaje genérico para evitar enumeración de usuarios
        return {
            success: false,
            message: 'No fue posible completar el registro. Verifica tus datos e intenta de nuevo.',
        };
    }

    return {
        success: true,
        message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
    };
}
