import { createClient } from './server';

/**
 * Verifies the current request belongs to an authenticated admin user.
 *
 * Checks (in order):
 * 1. Valid Supabase session
 * 2. Email domain allowlist (NEXT_PUBLIC_ADMIN_DOMAIN, optional)
 * 3. profiles.is_admin === true
 *
 * Returns `null` when the caller is an admin.
 * Returns an error string describing the denial reason otherwise.
 *
 * Fail-closed: any DB error, missing profile, or unset flag denies access.
 */
export async function requireAdmin(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return 'unauthenticated';

    const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;
    if (adminDomain && !user.email?.endsWith(adminDomain)) return 'forbidden';

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) return 'forbidden';

    return null;
}
