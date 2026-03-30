import { z } from 'zod';

// Helper type for the translation function
type Translator = (key: string, values?: Record<string, string | number>) => string;

// Allowed product categories — must match the admin form options and the DB values
export const ALLOWED_PRODUCT_CATEGORIES = ['albums', 'merch', 'photocards', 'clothing'] as const;
export type ProductCategory = typeof ALLOWED_PRODUCT_CATEGORIES[number];

// Static schema for server-side product validation (no i18n needed in Server Actions)
export const ProductSchema = z.object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
    price: z
        .number()
        .finite('El precio debe ser un número válido')
        .positive('El precio debe ser mayor a 0')
        .max(999999.99, 'El precio no puede exceder 999,999.99'),
    category: z.enum(ALLOWED_PRODUCT_CATEGORIES, {
        error: `Categoría no válida. Opciones permitidas: ${ALLOWED_PRODUCT_CATEGORIES.join(', ')}`,
    }),
    artist: z.string().trim().min(1, 'El artista es obligatorio').max(255),
    description: z.string().trim().min(1, 'La descripción es obligatoria').max(5000, 'La descripción no puede exceder 5000 caracteres'),
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

