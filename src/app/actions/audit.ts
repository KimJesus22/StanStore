'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Important: Use Service Role Key for writing audit logs to ensure
// we can write regardless of RLS (e.g., logging failed attempts or anonymous actions).
// NEVER expose this key to the client.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function logAuditAction(
    action: string,
    details: Record<string, unknown> = {},
    userId?: string
) {
    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        // If userId not provided, try to get it from current session (if any)
        // Note: Since we use supabaseAdmin, we don't have auth context automatically.
        // We rely on the caller passing userId if known, or we leave it null.

        // Insert log
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
