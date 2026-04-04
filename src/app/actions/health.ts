'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/requireAdmin';

export interface HealthMetrics {
    latency: number; // ms
    memory: number; // MB
    uptime: number; // seconds
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    timestamp: string;
}

export async function checkSystemHealth(): Promise<HealthMetrics> {
    const denial = await requireAdmin();
    if (denial === 'unauthenticated') throw new Error('No autorizado.');
    if (denial === 'forbidden') throw new Error('Se requiere rol de administrador.');

    const start = performance.now();
    let error = null;

    try {
        const supabase = createAdminClient();
        // Measure Supabase Latency: Simple lightweight query
        await supabase.from('products').select('count', { count: 'exact', head: true }).single();
    } catch (e) {
        error = e;
        console.error("Health Check Error:", e);
    }

    const end = performance.now();
    const latency = Math.round(end - start);

    // Memory Usage (Serverless envs might show varying results, but useful for basic stats)
    const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    // Uptime
    const uptime = Math.round(process.uptime());

    // Determine Status based on Latency
    let status: HealthMetrics['status'] = 'OPTIMAL';
    if (latency > 200 && latency <= 500) status = 'WARNING';
    if (latency > 500 || error) status = 'CRITICAL';

    return {
        latency,
        memory,
        uptime,
        status,
        timestamp: new Date().toISOString()
    };
}
