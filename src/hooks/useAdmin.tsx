'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export function useAdmin() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAdmin() {
            if (isAuthLoading) return;

            if (!user) {
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            // Security: Only allow specific domain emails to be admins
            // This prevents external users from accessing admin features even if DB flag is set
            const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;
            if (adminDomain && !user.email?.endsWith(adminDomain)) {
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error || !data?.is_admin) {
                    setIsAdmin(false);
                } else {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error checking admin:', error);
                setIsAdmin(false);
            } finally {
                setChecking(false);
            }
        }

        checkAdmin();
    }, [user, isAuthLoading]);

    return { isAdmin, loading: checking || isAuthLoading };
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [loading, isAdmin, router]);

    if (loading) {
        return (
            <div style={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
            }}>
                Verificando permisos...
            </div>
        );
    }

    if (!isAdmin) return null;

    return <>{children}</>;
}
