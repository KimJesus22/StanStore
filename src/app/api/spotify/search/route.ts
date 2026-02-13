import { NextRequest, NextResponse } from 'next/server';
import { searchArtists, searchAlbums, getArtistAlbums } from '@/lib/spotify';

/**
 * @swagger
 * /api/spotify/search:
 *   get:
 *     description: Buscar artistas o álbumes en Spotify.
 *     tags:
 *       - Spotify
 *     parameters:
 *       - name: q
 *         in: query
 *         required: false
 *         description: Término de búsqueda (nombre de artista o álbum).
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         required: false
 *         description: Tipo de búsqueda ('artist' o 'album'). Por defecto 'artist'.
 *         schema:
 *           type: string
 *           enum: [artist, album]
 *       - name: artistId
 *         in: query
 *         required: false
 *         description: ID de Spotify del artista para obtener sus álbumes.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *       400:
 *         description: Parámetros inválidos.
 *       500:
 *         description: Error interno al conectar con Spotify.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'artist';
    const artistId = searchParams.get('artistId');

    if (!query && !artistId) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    try {
        if (artistId) {
            // Get albums by artist ID
            const albums = await getArtistAlbums(artistId);
            return NextResponse.json({ results: albums });
        }

        if (type === 'artist') {
            const artists = await searchArtists(query!);
            return NextResponse.json({ results: artists });
        }

        if (type === 'album') {
            const artistName = searchParams.get('artist') || undefined;
            const albums = await searchAlbums(query!, artistName);
            return NextResponse.json({ results: albums });
        }

        return NextResponse.json({ error: 'Invalid type. Use "artist" or "album"' }, { status: 400 });
    } catch (error) {
        console.error('Spotify search error:', error);
        return NextResponse.json({ error: 'Error searching Spotify' }, { status: 500 });
    }
}
