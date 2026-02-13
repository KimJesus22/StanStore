import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * @swagger
 * /api/products/similar:
 *   get:
 *     description: Obtener productos conceptualmente similares usando búsqueda vectorial.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: query
 *         required: true
 *         description: UUID del producto para buscar similares.
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
 *         description: Lista de productos similares con puntuación de similitud.
 *       400:
 *         description: Falta el parámetro productId.
 *       500:
 *         description: Error interno.
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

        if (!product.embedding) {
            return NextResponse.json(
                { error: 'El producto no tiene embedding generado', similar: [] },
                { status: 200 }
            );
        }

        // 2. Buscar productos similares usando la función SQL
        const { data: similar, error: matchError } = await supabase
            .rpc('match_products', {
                query_embedding: product.embedding,
                match_threshold: 0.3,
                match_count: limit,
                exclude_id: productId,
            });

        if (matchError) {
            console.error('Error en match_products:', matchError);
            return NextResponse.json(
                { error: 'Error al buscar productos similares' },
                { status: 500 }
            );
        }

        return NextResponse.json({ similar: similar || [] });
    } catch (error) {
        console.error('Error en /api/products/similar:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
