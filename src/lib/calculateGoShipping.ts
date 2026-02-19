/**
 * Group Order (GO) Shipping Cost Calculator
 *
 * Splits the total international shipping cost among participants
 * using one of two proration strategies.
 *
 * All arithmetic is done in integer centavos to avoid IEEE-754 drift.
 */

export interface GoParticipant {
    userId: string;
    /** Number of items (e.g. albums, photocards) the participant ordered */
    itemsCount: number;
    /** Total weight of the participant's items in grams */
    totalWeight: number;
}

export interface GoShippingShare {
    userId: string;
    /** Participant's proportional shipping cost in MXN (2 decimal places) */
    shippingCost: number;
    /** Proportion used for the split (0–1), rounded to 4 decimal places */
    proportion: number;
}

export type GoSplitStrategy = 'per-item' | 'volumetric';

/**
 * Calculates how much each participant owes for international shipping.
 *
 * @param totalShippingCost  Total shipping cost in MXN charged by the overseas store
 * @param participants       Array of participants with their item count and weight
 * @param strategy           'per-item' (equal per article) | 'volumetric' (by weight)
 * @returns                  Array of per-user shipping breakdowns, sorted by userId
 *
 * @throws {Error} If `totalShippingCost` is negative
 * @throws {Error} If the total divisor (items or weight) is zero
 *
 * @example
 * // Three fans splitting $1,200 MXN by item count
 * calculateGoShipping(1200, [
 *   { userId: 'ana',  itemsCount: 2, totalWeight: 300 },
 *   { userId: 'bea',  itemsCount: 1, totalWeight: 150 },
 *   { userId: 'carl', itemsCount: 3, totalWeight: 800 },
 * ], 'per-item');
 * // → ana: $400, bea: $200, carl: $600
 */
export function calculateGoShipping(
    totalShippingCost: number,
    participants: GoParticipant[],
    strategy: GoSplitStrategy
): GoShippingShare[] {
    if (totalShippingCost < 0) {
        throw new Error('totalShippingCost must be a non-negative number.');
    }

    if (participants.length === 0) {
        return [];
    }

    // Work in integer centavos to prevent floating-point drift
    const totalCents = Math.round(totalShippingCost * 100);

    // Compute each participant's "weight" in the chosen strategy
    const getDivisorValue = (p: GoParticipant): number =>
        strategy === 'per-item' ? p.itemsCount : p.totalWeight;

    const totalDivisor = participants.reduce(
        (sum, p) => sum + getDivisorValue(p),
        0
    );

    if (totalDivisor === 0) {
        const field = strategy === 'per-item' ? 'itemsCount' : 'totalWeight';
        throw new Error(
            `The sum of all participants' "${field}" is zero — cannot divide shipping cost.`
        );
    }

    // Distribute costs proportionally, centavo by centavo
    // Use the "largest remainder" method to make sure rounding never loses/gains a centavo.
    const rawShares = participants.map(p => {
        const divisorValue = getDivisorValue(p);
        const exactCents = (divisorValue / totalDivisor) * totalCents;
        return {
            userId: p.userId,
            floorCents: Math.floor(exactCents),
            remainder: exactCents - Math.floor(exactCents),
            proportion: divisorValue / totalDivisor,
        };
    });

    // Sum of floor values; the difference to totalCents = centavos to distribute
    const distributedFloor = rawShares.reduce((sum, s) => sum + s.floorCents, 0);
    let leftover = totalCents - distributedFloor; // always 0 ≤ leftover < participants.length

    // Sort by largest remainder descending, assign the leftover centavos
    const sorted = [...rawShares].sort((a, b) => b.remainder - a.remainder);
    for (const share of sorted) {
        if (leftover <= 0) break;
        share.floorCents += 1;
        leftover -= 1;
    }

    // Map back to original order and convert to MXN
    return rawShares.map(share => ({
        userId: share.userId,
        shippingCost: share.floorCents / 100,
        proportion: Math.round(share.proportion * 10000) / 10000,
    }));
}
