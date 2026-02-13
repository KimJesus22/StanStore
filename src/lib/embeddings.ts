/**
 * Generación de embeddings con Transformers.js (local, gratis)
 * Modelo: Xenova/all-MiniLM-L6-v2 (384 dimensiones)
 */

// @ts-expect-error — dynamic import for pipeline
let pipelineInstance: ReturnType<typeof import('@xenova/transformers').then> | null = null;

async function getEmbeddingPipeline() {
    if (!pipelineInstance) {
        const { pipeline } = await import('@xenova/transformers');
        pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return pipelineInstance;
}

/**
 * Genera un embedding (vector 384D) para un texto dado.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/**
 * Genera embeddings para múltiples textos en batch.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
        const embedding = await generateEmbedding(text);
        results.push(embedding);
    }
    return results;
}
