// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Security Check: Validate Service Token or Secret Header
        // We expect a custom header 'x-log-secret' to match an environment variable
        // This prevents unauthorized users from spamming the log endpoint
        const secret = req.headers.get('x-log-secret')
        const expectedSecret = Deno.env.get('LOG_EVENT_SECRET')

        if (!expectedSecret || secret !== expectedSecret) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const { action, user_id, ip, user_agent, status, duration, details } = await req.json()

        // 2. Initialize Supabase Client with Service Role Key
        // Edge Functions have access to SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY by default
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Async Insert (Fire and forget from the client perspective, but awaited here)
        const { error } = await supabaseClient.from('audit_logs').insert({
            action,
            user_id: user_id || null, // Handle optional user_id
            ip_address: ip,
            user_agent,
            status: status || 'SUCCESS',
            duration_ms: duration,
            metadata: details || {},
        })

        if (error) throw error

        return new Response(JSON.stringify({ message: 'Log ingested successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
