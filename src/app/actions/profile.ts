'use server';

import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createAuthenticatedClient(token: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
}

export async function updateProfile(token: string, formData: FormData) {
    if (!token) return { error: 'No autorizado' };

    const supabase = createAuthenticatedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'No autorizado' };
    }

    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const updates: any = {
        updated_at: new Date().toISOString(),
    };

    if (phone !== undefined) {
        updates.encrypted_phone = phone ? encrypt(phone) : null;
    }

    if (address !== undefined) {
        updates.encrypted_address = address ? encrypt(address) : null;
    }

    // Upsert allows creating profile if it doesn't exist
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });

    if (error) {
        console.error('Error updating profile:', error);
        return { error: 'Error al actualizar perfil' };
    }

    revalidatePath('/[locale]/profile', 'page');
    return { success: true };
}

export async function getProfile(token: string) {
    if (!token) return null;

    const supabase = createAuthenticatedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('encrypted_phone, encrypted_address')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        return { phone: '', address: '' };
    }

    return {
        phone: profile.encrypted_phone ? decrypt(profile.encrypted_phone) : '',
        address: profile.encrypted_address ? decrypt(profile.encrypted_address) : '',
    };
}
