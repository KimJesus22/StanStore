import { NextRequest, NextResponse } from 'next/server';
import { searchVideos, searchMusicVideo } from '@/lib/youtube';

/**
 * @swagger
 * /api/youtube/search:
 *   get:
 *     description: Buscar videos o MVs oficiales en YouTube.
 *     tags:
 *       - YouTube
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Término de búsqueda.
 *         schema:
 *           type: string
 *       - name: artist
 *         in: query
 *         required: false
 *         description: Nombre del artista (activa búsqueda de MV oficial).
 *         schema:
 *           type: string
 *       - name: maxResults
 *         in: query
 *         required: false
 *         description: Número máximo de resultados (1-10, default 5).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda.
 *       400:
 *         description: Parámetros inválidos.
 *       500:
 *         description: Error interno al conectar con YouTube.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const artist = searchParams.get('artist');
    const maxResults = Math.min(
        Math.max(parseInt(searchParams.get('maxResults') || '5', 10), 1),
        10
    );

    if (!query) {
        return NextResponse.json(
            { error: 'Falta el parámetro de búsqueda "q"' },
            { status: 400 }
        );
    }

    try {
        let results;

        if (artist) {
            // Buscar MV oficial del artista
            results = await searchMusicVideo(artist, query);
        } else {
            // Búsqueda general de videos
            results = await searchVideos(query, maxResults);
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error('YouTube search error:', error);
        return NextResponse.json(
            { error: 'Error al buscar en YouTube' },
            { status: 500 }
        );
    }
}
