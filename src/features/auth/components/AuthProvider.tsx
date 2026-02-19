'use client';

import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import AuthModal from './AuthModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuth((state) => state.initialize);

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
