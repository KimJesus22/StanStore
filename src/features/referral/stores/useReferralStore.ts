import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReferralState {
    /** UUID of the user who shared the referral link */
    referrerId: string | null;
    /** Timestamp when the referral was captured */
    capturedAt: number | null;
    /** Set the referrer from a ?ref= URL param */
    setReferrer: (id: string) => void;
    /** Clear after a successful purchase */
    clearReferrer: () => void;
}

const REFERRAL_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useReferralStore = create<ReferralState>()(
    persist(
        (set, get) => ({
            referrerId: null,
            capturedAt: null,

            setReferrer: (id: string) => {
                // Don't overwrite an existing referral (first-touch wins)
                const current = get();
                if (current.referrerId && current.capturedAt) {
                    const elapsed = Date.now() - current.capturedAt;
                    if (elapsed < REFERRAL_EXPIRY_MS) return;
                }
                set({ referrerId: id, capturedAt: Date.now() });
            },

            clearReferrer: () => set({ referrerId: null, capturedAt: null }),
        }),
        {
            name: 'stanstore-referral',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
