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

    // 3. Obtener productos para verificar estado
    // Seleccionamos timestamps para filtrar incrementalmente
    const { data: allProducts, error } = await supabase
        .from('products')
        .select('id, name, description, artist, category, updated_at, last_embedding_at');

    if (error) {
        console.error('❌ Error al obtener productos:', error.message);
        process.exit(1);
    }

    if (!allProducts || allProducts.length === 0) {
        console.log('⚠️ No hay productos en la base de datos');
        process.exit(0);
    }

    // Filtrar productos que necesitan actualización:
    // 1. last_embedding_at es NULL (nunca procesado)
    // 2. updated_at > last_embedding_at (modificado después del último embedding)
    const productsToProcess = allProducts.filter(p => {
        if (!p.last_embedding_at) return true; // Nuevo o nunca procesado
        if (!p.updated_at) return false; // Si no tiene updated_at, asumimos que no ha cambiado (o falló algo)
        return new Date(p.updated_at) > new Date(p.last_embedding_at); // Modificado recientemente
    });

    if (productsToProcess.length === 0) {
        console.log('✨ Todo está actualizado. No se requieren nuevos embeddings.');
        process.exit(0);
    }

    console.log(`\n📦 Encontrados ${allProducts.length} productos total.`);
    console.log(`🚀 ${productsToProcess.length} requieren actualización de embeddings.\n`);

    const BATCH_SIZE = 50;
    let updatesBatch: { id: string; embedding: number[]; last_embedding_at: string }[] = [];
    let successCount = 0;
    let errorCount = 0;

    // 4. Generar y guardar embeddings solo para los pendientes
    for (const product of productsToProcess) {
        // Crear texto enriquecido para el embedding
        const textForEmbedding = [
            product.name,
            product.artist,
            product.category,
            product.description || '',
        ].join(' | ');

        console.log(`🔄 Generando vector: ${product.name} (${product.artist})`);

        try {
            // Generar embedding
            const output = await extractor(textForEmbedding, {
                pooling: 'mean',
                normalize: true,
            });
            const embedding = Array.from(output.data as Float32Array);

            // Agregar al lote
            updatesBatch.push({
                id: product.id,
                embedding: embedding,
                last_embedding_at: new Date().toISOString(),
            });

            // Si el lote está lleno, procesar
            if (updatesBatch.length >= BATCH_SIZE) {
                await processBatch(supabase, updatesBatch);
                successCount += updatesBatch.length;
                updatesBatch = []; // Limpiar lote
            }
        } catch (e) {
            console.error(`Error generando vector para ID ${product.id}:`, e);
            errorCount++;
        }
    }

    // Procesar remanentes
    if (updatesBatch.length > 0) {
        await processBatch(supabase, updatesBatch);
        successCount += updatesBatch.length;
    }

    console.log(`\n🎉 Proceso finalizado. Exito: ${successCount}, Errores: ${errorCount}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBatch(supabase: any, batch: any[]) {
    console.log(`💾 Guardando lote de ${batch.length} productos...`);

    // Upsert masivo (requiere que 'id' sea Primary Key)
    const { error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' }); // Solo actualiza embeddings y timestamp

    if (error) {
        console.error('❌ Error guardando lote:', error.message);
        // Opcional: Podríamos intentar guardar uno a uno si falla el lote, 
        // pero para scripts de mantenimiento es aceptable loguear el fallo.
    } else {
        console.log('✅ Lote guardado.');
    }
}

main().catch(console.error);
