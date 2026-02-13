/**
 * Script para generar embeddings de las descripciones de productos
 * y guardarlos en Supabase.
 * 
 * Ejecutar con: npx tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';

async function main() {
    // 1. Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Faltan variables de entorno:');
        console.error('   NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
        console.error('   Asegúrate de tener un archivo .env.local');
        process.exit(1);
    }

    // Usar service role key para bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Importar Transformers.js dinámicamente
    console.log('🔄 Cargando modelo de embeddings (primera vez descarga ~80MB)...');
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Modelo cargado exitosamente');

    // 3. Obtener todos los productos
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, description, artist, category');

    if (error) {
        console.error('❌ Error al obtener productos:', error.message);
        process.exit(1);
    }

    if (!products || products.length === 0) {
        console.log('⚠️ No hay productos en la base de datos');
        process.exit(0);
    }

    console.log(`\n📦 Encontrados ${products.length} productos\n`);

    // 4. Generar y guardar embeddings
    for (const product of products) {
        // Crear texto enriquecido para el embedding
        const textForEmbedding = [
            product.name,
            product.artist,
            product.category,
            product.description || '',
        ].join(' | ');

        console.log(`🔄 Procesando: ${product.name} (${product.artist})`);

        // Generar embedding
        const output = await extractor(textForEmbedding, {
            pooling: 'mean',
            normalize: true,
        });
        const embedding = Array.from(output.data as Float32Array);

        // Guardar en Supabase
        const { error: updateError } = await supabase
            .from('products')
            .update({ embedding: embedding })
            .eq('id', product.id);

        if (updateError) {
            console.error(`   ❌ Error: ${updateError.message}`);
        } else {
            console.log(`   ✅ Embedding guardado (${embedding.length} dimensiones)`);
        }
    }

    console.log('\n🎉 ¡Todos los embeddings generados y guardados!');
}

main().catch(console.error);
