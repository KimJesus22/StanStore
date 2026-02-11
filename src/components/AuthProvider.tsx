'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import AuthModal from './AuthModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <>
            <AuthModal />
            {children}
        </>
    );
}
