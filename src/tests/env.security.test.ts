import { describe, it, expect, beforeAll } from 'vitest';
import { loadEnvConfig } from '@next/env';

describe('Environment Security Audit', () => {
    beforeAll(() => {
        // Load environment variables from .env files
        const projectDir = process.cwd();
        loadEnvConfig(projectDir);
    });

    it('should not expose SUPABASE_SERVICE_ROLE_KEY to the client', () => {
        // CRITICAL: Check if the variable exists with the NEXT_PUBLIC_ prefix
        const publicServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (publicServiceKey) {
            throw new Error(
                '🚨 SECURITY ALERT: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is defined! \n' +
                'This exposes your Admin Service Role Key to the client-side browser. \n' +
                'IMMEDIATELY rename it to SUPABASE_SERVICE_ROLE_KEY in your .env files.'
            );
        }

        expect(publicServiceKey).toBeUndefined();
    });

    it('should ideally have SUPABASE_SERVICE_ROLE_KEY defined for server-side usage', () => {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceKey) {
            console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing in test environment. Ideally it should be set.');
            // We won't fail the build here because CI might inject secrets differently
            // or this test might be running where .env.local isn't picked up correctly by Vitest alone.
            // The critical test is the one above.
        } else {
            expect(serviceKey).toBeDefined();
            expect(serviceKey.length).toBeGreaterThan(10);
        }
    });
});
