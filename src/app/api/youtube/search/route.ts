import { NextRequest, NextResponse } from 'next/server';
import { searchVideos, searchMusicVideo } from '@/lib/youtube';

const MAX_QUERY_LENGTH = 100;

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

    if (!query) {
        return NextResponse.json(
            { error: 'Falta el parámetro de búsqueda "q"' },
            { status: 400 }
        );
    }

    if (query.length > MAX_QUERY_LENGTH) {
        return NextResponse.json(
            { error: 'El parámetro "q" supera la longitud máxima permitida.' },
            { status: 400 }
        );
    }

    if (artist && artist.length > MAX_QUERY_LENGTH) {
        return NextResponse.json(
            { error: 'El parámetro "artist" supera la longitud máxima permitida.' },
            { status: 400 }
        );
    }

    // Fix: parseInt('abc') returns NaN; Math.min/max(NaN, n) === NaN — use Number.isInteger
    const rawMax = parseInt(searchParams.get('maxResults') ?? '5', 10);
    const maxResults = Number.isInteger(rawMax) && rawMax >= 1 ? Math.min(rawMax, 10) : 5;

    try {
        const results = artist
            ? await searchMusicVideo(artist, query)
            : await searchVideos(query, maxResults);

        return NextResponse.json({ results }, {
            headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=3600' },
        });
    } catch (error) {
        console.error('YouTube search error:', error);
        return NextResponse.json(
            { error: 'Error al buscar en YouTube' },
            { status: 500 }
        );
    }
}
