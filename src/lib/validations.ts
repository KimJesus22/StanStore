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

export const ProductSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
    category: z.string().min(2, 'La categoría es requerida'),
    artist: z.string().min(1, 'El artista es requerido'),
    description: z.string().min(10, 'La descripción debe ser más detallada'),
    image_url: z.string().min(1, 'La imagen es requerida'),
    spotify_album_id: z.string().optional(),
});
