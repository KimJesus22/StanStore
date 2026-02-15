
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3';

console.log('Embed Product Function Initialized');

serve(async (req) => {
    try {
        // 1. Validar Webhook Secret (si es necesario) o Payload
        const { record } = await req.json();

        if (!record || !record.id || !record.name) {
            return new Response('Invalid Payload', { status: 400 });
        }

        // Si ya tiene embedding y no ha cambiado el contenido relevante (demo simplificada), podríamos saltar.
        // Pero asumiremos que el trigger solo nos llama si es necesario.

        // 2. Generar Embedding
        const configuration = new Configuration({ apiKey: Deno.env.get('OPENAI_API_KEY') });
        const openai = new OpenAIApi(configuration);

        const content = `${record.name} ${record.description || ''}`;
        const embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-3-small',
            input: content.replaceAll('\n', ' '),
        });

        const embedding = embeddingResponse.data.data[0].embedding;

        // 3. Guardar en Supabase
        // Usamos Service Role Key para tener permiso de escribir en products sin RLS (o bypass).
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error } = await supabaseClient
            .from('products')
            .update({ embedding })
            .eq('id', record.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, id: record.id }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error generating embedding:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
