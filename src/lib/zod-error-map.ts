import { z } from 'zod';

const customErrorMap: z.ZodErrorMap = (issue) => {
    // Zod v4: códigos como string literals
    if (issue.code === 'invalid_type') {
        if (issue.received === 'undefined' || issue.received === 'null') {
            return { message: 'Este campo es obligatorio.' };
        }
    }

    if (issue.code === 'too_small') {
        if (issue.type === 'string') {
            return { message: `Debe tener al menos ${issue.minimum} caracteres.` };
        }
        if (issue.type === 'number') {
            return { message: `Debe ser mayor o igual a ${issue.minimum}.` };
        }
    }

    if (issue.code === 'too_big') {
        if (issue.type === 'string') {
            return { message: `No puede tener más de ${issue.maximum} caracteres.` };
        }
        if (issue.type === 'number') {
            return { message: `Debe ser menor o igual a ${issue.maximum}.` };
        }
    }

    // Zod v4: 'invalid_string' ahora es 'invalid_format'
    if (issue.code === 'invalid_format') {
        if (issue.format === 'email') {
            return { message: 'Formato de correo electrónico inválido.' };
        }
        if (issue.format === 'url') {
            return { message: 'URL inválida.' };
        }
    }

    // Si retornamos null o undefined, Zod usa el mensaje por defecto.
    return undefined;
};

export const registerZodErrorMap = () => {
    z.setErrorMap(customErrorMap);
    console.log('✅ Zod Error Map (Español) registrado.');
};
