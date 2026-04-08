'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/requireAdmin';

interface BlockedIp {
    id: string;
    ip_address: string;
    reason: string;
    created_at: string;
}

interface ActionResult {
    data?: BlockedIp[];
    error?: string;
}

/**
 * Fetch all blocked IPs. Admin only.
 */
export async function getBlockedIps(): Promise<ActionResult> {
    const denial = await requireAdmin();
    if (denial === 'unauthenticated') return { error: 'No autorizado.' };
    if (denial === 'forbidden') return { error: 'Se requiere rol de administrador.' };

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: 'Error al cargar IPs bloqueadas.' };
    return { data: data as BlockedIp[] };
}

/**
 * Block a new IP. Admin only.
 */
export async function addBlockedIp(ipAddress: string, reason?: string): Promise<ActionResult> {
    const denial = await requireAdmin();
    if (denial === 'unauthenticated') return { error: 'No autorizado.' };
    if (denial === 'forbidden') return { error: 'Se requiere rol de administrador.' };

    // Validación básica IPv4/IPv6
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4.test(ipAddress) && !ipv6.test(ipAddress)) {
        return { error: 'Dirección IP inválida.' };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('blocked_ips')
        .insert([{ ip_address: ipAddress, reason: reason || 'Bloqueo Manual' }]);

    if (error) {
        if (error.code === '23505') return { error: 'Esta IP ya está bloqueada.' };
        return { error: 'Error al bloquear IP.' };
    }

    return {};
}

/**
 * Unblock an IP by ID. Admin only.
 */
export async function removeBlockedIp(id: string): Promise<ActionResult> {
    const denial = await requireAdmin();
    if (denial === 'unauthenticated') return { error: 'No autorizado.' };
    if (denial === 'forbidden') return { error: 'Se requiere rol de administrador.' };

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);

    if (error) return { error: 'Error al desbloquear IP.' };
    return {};
}
