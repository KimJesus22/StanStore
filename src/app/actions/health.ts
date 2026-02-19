'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Initialize Supabase Client moved inside function
// const supabase = createClient(...)

export interface HealthMetrics {
    latency: number; // ms
    memory: number; // MB
    uptime: number; // seconds
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    timestamp: string;
}

export async function checkSystemHealth(): Promise<HealthMetrics> {
    const start = performance.now();
    let error = null;

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
        );
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
