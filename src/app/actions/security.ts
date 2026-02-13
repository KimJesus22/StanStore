'use server';

import { createClient } from '@supabase/supabase-js';

// We need SERVICE_ROLE key to select/admin, but ANON key is enough to INSERT with our RLS policy.
// However, creating a client inside action is standard.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SecurityReport {
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    reproduction_steps?: string;
    submitter_email?: string;
}

export async function submitSecurityReport(report: SecurityReport) {
    try {
        const { error } = await supabase
            .from('security_reports')
            .insert([report]);

        if (error) {
            console.error('Security Report Error:', error);
            throw new Error('Failed to submit report');
        }

        return { success: true, message: 'Reporte enviado segura y confidencialmente.' };
    } catch (error) {
        console.error('Submission Error:', error);
        return { success: false, message: 'Error al enviar el reporte. Inténtalo de nuevo.' };
    }
}
