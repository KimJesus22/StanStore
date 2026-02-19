import { z } from 'zod';

// Helper type for the translation function
type Translator = (key: string, values?: Record<string, string | number>) => string;

// Static schema for server-side product validation (no i18n needed in Server Actions)
export const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255),
    price: z.number().positive('El precio debe ser mayor a 0'),
    category: z.string().min(1, 'La categoría es obligatoria'),
    artist: z.string().min(1, 'El artista es obligatorio'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    image_url: z.string().url('La URL de imagen no es válida'),
    spotify_album_id: z.string().optional(),
    is_new: z.boolean().optional(),
});

export const createLoginSchema = (t: Translator) => z.object({
    email: z.string().email(t('email')),
    password: z.string().min(6, t('passwordMin', { min: 6 })),
});

export const createRegisterSchema = (t: Translator) => z.object({
    email: z.string().email(t('email')),
    password: z.string()
        .min(8, t('passwordMin', { min: 8 }))
        .regex(/[A-Z]/, t('passwordUppercase'))
        .regex(/[0-9]/, t('passwordNumber')),
});

export const createSearchSchema = (t: Translator) => z.object({
    query: z.string().trim().max(100, t('searchMax')).optional(),
});

// Mantener versiones estáticas por compatibilidad si es necesario,
// o forzar la actualización en los componentes consumidores.
// Por ahora, eliminamos las estáticas para forzar el uso de i18n.

