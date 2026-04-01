import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { Product } from '@/types';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @swagger
 * /api/products/similar:
 *   get:
 *     description: Obtener productos similares. Utiliza búsqueda vectorial si es posible; de lo contrario, devuelve productos recientes (fallback).
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: query
 *         required: true
 *         description: UUID del producto referencia.
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Número máximo de resultados (default 4).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos exitosa (ya sea por similitud o fallback).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 similar:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Falta el parámetro productId.
 *       404:
 *         description: El producto especificado no existe en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId || !UUID_REGEX.test(productId)) {
        return NextResponse.json(
            { error: 'Falta el parámetro "productId" o no es un UUID válido' },
            { status: 400 }
        );
    }

    const rawLimit = parseInt(searchParams.get('limit') ?? '4', 10);
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 10) : 4;

    try {
        const supabase = await createClient();

        // 1. Obtener el embedding del producto actual
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('embedding')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        let similar: Product[] = [];

        // 2. Intentar búsqueda vectorial si hay embedding
        if (product.embedding && product.embedding.length > 0) {
            const { data: vectorData, error: matchError } = await supabase
                .rpc('match_products', {
                    query_embedding: product.embedding,
                    match_threshold: 0.3,
                    match_count: limit,
                    exclude_id: productId,
                });

            if (!matchError) {
                similar = vectorData || [];
            } else {
                console.warn('Error en match_products (usando fallback):', matchError);
            }
        }

        // 3. Estrategia Fallback: Si no hay similitudes (o no hay embedding), devolver productos recientes
        if (!similar || similar.length === 0) {
            const isMissingEmbedding = !product.embedding || product.embedding.length === 0;

            // Reportar a Sentry si falta el embedding para visibilidad (nivel warning)
            if (isMissingEmbedding) {
                Sentry.withScope((scope) => {
                    scope.setTag("error_type", "missing_embedding");
                    scope.setExtra("product_id", productId);
                    Sentry.captureMessage(`Product ${productId} missing embedding`, "warning");
                });
            }

            console.log(`Usando fallback para producto ${productId} (Sin embedding o sin coincidencias)`);
            const { data: fallbackData } = await supabase
                .from('products')
                .select('*')
                .neq('id', productId)
                .order('created_at', { ascending: false })
                .limit(limit);

            similar = fallbackData || [];
        }

        return NextResponse.json({ similar }, {
            headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
        });
    } catch (error) {
        console.error('Error en /api/products/similar:', error);

        Sentry.captureException(error);

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
