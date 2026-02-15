import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from "@sentry/nextjs";
import { Product } from '@/types';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '4', 10), 10);

    if (!productId) {
        return NextResponse.json(
            { error: 'Falta el parámetro "productId"' },
            { status: 400 }
        );
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

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

        return NextResponse.json({ similar });
        return NextResponse.json({ similar });
    } catch (error) {
        console.error('Error en /api/products/similar:', error);

        Sentry.captureException(error);

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
