import { createClient } from '@supabase/supabase-js';

// Ensure this file is never bundled in client-side code
if (typeof window !== 'undefined') {
    throw new Error('FATAL: admin.ts imported on client-side. This is a security violation.');
}

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Strict validation
    if (!supabaseUrl) {
        throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_URL missing in environment variables.');
    }

    if (!serviceRoleKey) {
        // Critical: Never fall back to Anon Key for admin operations
        throw new Error('FATAL: SUPABASE_SERVICE_ROLE_KEY missing. Cannot create Admin Client.');
    }

    // Create client with specific options for server-side usage
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false, // No need for refresh tokens on server
            persistSession: false    // Do not persist session to storage/cookies
        },
        // Optional: Add global headers if needed
        // global: { headers: { 'x-my-custom-header': 'my-app-name' } },
    });
}
