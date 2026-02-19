import { Database } from './database.types';
import { OrderStatus, PaymentMethod } from './enums';

// Helpers para extracción de tipos
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos de Dominio
// Extendemos el tipo base de la DB con propiedades calculadas en frontend
export interface Product extends Tables<'products'> {
    formattedPrice?: string;
    artist?: {
        name: string;
        // otros campos del artista si es necesario
    };
}

// OrderItem con relación (Join)
export interface OrderItem {
    id: string; // Puede venir de order_items.id o ser un ID temporal en el carrito
    quantity: number;
    product: Product; // Relación anidada (JOIN)
    // Campos opcionales si vienen de la DB
    order_id?: string;
    price_at_purchase?: number;
}


// Otros tipos útiles
export type User = Tables<'users'>;
export interface Order extends Omit<Tables<'orders'>, 'status'> {
    status: OrderStatus;
    payment_method?: PaymentMethod; // Agregamos payment_method si no estaba en DB o es virtual
}
