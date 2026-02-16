
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';


// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed to bypass RLS/write to embeddings
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
    console.error('Missing environment variables. verify .env.local has NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replaceAll('\n', ' '),
    });
    return response.data[0].embedding;
}

async function backfillEmbeddings() {
    console.log('Starting backfill...');

    // 1. Get products without embeddings
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, description')
        .is('embedding', null);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products without embeddings.`);

    for (const product of products) {
        console.log(`Processing product: ${product.name} (${product.id})`);

        try {
            const content = `${product.name} ${product.description || ''}`;
            const embedding = await generateEmbedding(content);

            const { error: updateError } = await supabase
                .from('products')
                .update({ embedding })
                .eq('id', product.id);

            if (updateError) {
                console.error(`Failed to update product ${product.id}:`, updateError);
            } else {
                console.log(`Successfully updated embedding for ${product.id}`);
            }
        } catch (e) {
            console.error(`Error processing ${product.id}:`, e);
        }

        // Simple rate limit helper
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Backfill complete.');
}

backfillEmbeddings();
