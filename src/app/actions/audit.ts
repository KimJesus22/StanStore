'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

export async function logAuditAction(
    action: string,
    details: Record<string, unknown> = {},
    userId?: string
) {
    try {
        const supabaseAdmin = createAdminClient();
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        const { error } = await supabaseAdmin.from('audit_logs').insert({
            user_id: userId || null,
            action,
            details,
            ip_address: ip,
            user_agent: userAgent,
        });

        if (error) {
            console.error('Failed to write audit log:', error);
        }
    } catch (error) {
        console.error('Unexpected error in audit logging:', error);
    }
}
