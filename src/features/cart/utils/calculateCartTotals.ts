export interface CartTotals {
    /** Sum of (price × quantity) for all items, before tax */
    subtotal: number;
    /** IVA at 16% applied on the subtotal */
    taxTotal: number;
    /** Shipping cost in MXN (0 = free) */
    shippingCost: number;
    /** Discount from redeemed loyalty points */
    pointsDiscount: number;
    /** subtotal + taxTotal + shippingCost - pointsDiscount */
    total: number;
}

/** Free shipping threshold in MXN */
export const FREE_SHIPPING_THRESHOLD = 1500;
/** Fixed shipping cost in MXN when below the threshold */
export const FLAT_SHIPPING_RATE = 150;
/** Mexican IVA rate */
export const TAX_RATE = 0.16;

/** Points required for redemption */
export const POINTS_REQUIRED = 500;
/** Discount in MXN when points are redeemed */
export const POINTS_DISCOUNT_MXN = 50;

/**
 * Calculates subtotal, IVA (16%) and total for a cart.
 *
 * All arithmetic is done in **integer centavos** to avoid IEEE-754
 * floating-point rounding errors (e.g. 19.99 × 0.16 → 3.1984000000000004).
 *
 * @param items  Array of cart items with `price` (MXN float) and `quantity`
 * @param includeShipping  Whether to factor in the estimated shipping cost
 * @param usePoints  Whether to apply a loyalty points discount
 */
export function calculateCartTotals(
    items: { price: number; quantity: number }[],
    includeShipping = false,
    usePoints = false
): CartTotals {
    // Work in integer centavos (× 100) to avoid floating-point drift
    const subtotalCents = items.reduce(
        (acc, item) => acc + Math.round(item.price * 100) * item.quantity,
        0
    );

    const taxCents = Math.round(subtotalCents * TAX_RATE);

    const shippingCents = includeShipping
        ? subtotalCents / 100 >= FREE_SHIPPING_THRESHOLD
            ? 0
            : FLAT_SHIPPING_RATE * 100
        : 0;

    const discountCents = usePoints ? POINTS_DISCOUNT_MXN * 100 : 0;

    // Ensure total never goes negative
    const totalCents = Math.max(0, subtotalCents + taxCents + shippingCents - discountCents);

    // Convert back to MXN with exactly 2 decimal places
    return {
        subtotal: subtotalCents / 100,
        taxTotal: taxCents / 100,
        shippingCost: shippingCents / 100,
        pointsDiscount: discountCents / 100,
        total: totalCents / 100,
    };
}

