'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// ── Constantes ────────────────────────────────────────────────────────────────

const SEVERITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
const MAX_TITLE        = 200;
const MAX_DESCRIPTION  = 5_000;
const MAX_STEPS        = 5_000;
const MAX_EMAIL        = 254;
const MAX_REPORTS_PER_HOUR = 3;

// ── Tipos de retorno ──────────────────────────────────────────────────────────

export interface SecurityReport {
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    reproduction_steps?: string;
    submitter_email?: string;
}

// ── Server Action ─────────────────────────────────────────────────────────────

export async function submitSecurityReport(report: SecurityReport) {
    // 1. Autenticación obligatoria — previene spam anónimo
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Debes iniciar sesión para enviar un reporte.' };
    }

    // 2. Validación de campos
    if (!SEVERITY_VALUES.includes(report.severity)) {
        return { success: false, message: 'Severidad no válida.' };
    }

    const title               = report.title?.trim().slice(0, MAX_TITLE) ?? '';
    const description         = report.description?.trim().slice(0, MAX_DESCRIPTION) ?? '';
    const reproduction_steps  = report.reproduction_steps?.trim().slice(0, MAX_STEPS) ?? null;
    const submitter_email     = report.submitter_email?.trim().slice(0, MAX_EMAIL) ?? null;

    if (!title || !description) {
        return { success: false, message: 'Título y descripción son requeridos.' };
    }

    const admin = createAdminClient();

    // 3. Rate limit: máx 3 reportes por usuario por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
        .from('security_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= MAX_REPORTS_PER_HOUR) {
        return { success: false, message: 'Has alcanzado el límite de reportes por hora. Intenta más tarde.' };
    }

    // 4. Inserción con service role (sin depender de RLS de la clave anónima)
    const { error } = await admin
        .from('security_reports')
        .insert([{
            user_id: user.id,
            title,
            severity: report.severity,
            description,
            reproduction_steps,
            submitter_email,
        }]);

    if (error) {
        console.error('Security Report Error:', error);
        return { success: false, message: 'Error al enviar el reporte. Inténtalo de nuevo.' };
    }

    return { success: true, message: 'Reporte enviado segura y confidencialmente.' };
}
