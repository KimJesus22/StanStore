// Usamos 'as const' para que TypeScript infiera los valores literales exactos
// en lugar de string genérico. Esto permite un mejor tree-shaking y es más seguro
// que los enums numéricos o string enums clásicos de TS que generan código extra en runtime.

export const OrderStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
} as const;

// Tipo derivado automáticamente de los valores del objeto
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];


export const PaymentMethod = {
    STRIPE: 'STRIPE',
    PAYPAL: 'PAYPAL',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const LoyaltyTier = {
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD',
} as const;

export type LoyaltyTier = typeof LoyaltyTier[keyof typeof LoyaltyTier];
