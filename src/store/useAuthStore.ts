import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthModalOpen: false,

    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),

    initialize: async () => {
        try {
            set({ isLoading: true });

            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user || null });

            // Listen for changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ session, user: session?.user || null, isLoading: false });
            });

        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));
