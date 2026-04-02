import { NextRequest, NextResponse } from 'next/server';
import { searchArtists, searchAlbums, getArtistAlbums } from '@/lib/spotify';

// Spotify IDs are exactly 22 alphanumeric characters (base62)
const SPOTIFY_ID_REGEX = /^[a-zA-Z0-9]{22}$/;
const VALID_TYPES = new Set(['artist', 'album']);
const MAX_QUERY_LENGTH = 100;

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

    if (query && query.length > MAX_QUERY_LENGTH) {
        return NextResponse.json({ error: 'El parámetro "q" supera la longitud máxima permitida.' }, { status: 400 });
    }

    if (artistId && !SPOTIFY_ID_REGEX.test(artistId)) {
        return NextResponse.json({ error: 'El parámetro "artistId" no es un ID de Spotify válido.' }, { status: 400 });
    }

    if (query && !VALID_TYPES.has(type)) {
        return NextResponse.json({ error: 'El parámetro "type" debe ser "artist" o "album".' }, { status: 400 });
    }

    try {
        const headers = { 'Cache-Control': 's-maxage=300, stale-while-revalidate=3600' };

        if (artistId) {
            const albums = await getArtistAlbums(artistId);
            return NextResponse.json({ results: albums }, { headers });
        }

        if (type === 'artist') {
            const artists = await searchArtists(query!);
            return NextResponse.json({ results: artists }, { headers });
        }

        // type === 'album'
        const artistName = searchParams.get('artist') || undefined;
        if (artistName && artistName.length > MAX_QUERY_LENGTH) {
            return NextResponse.json({ error: 'El parámetro "artist" supera la longitud máxima permitida.' }, { status: 400 });
        }
        const albums = await searchAlbums(query!, artistName);
        return NextResponse.json({ results: albums }, { headers });
    } catch (error) {
        console.error('Spotify search error:', error);
        return NextResponse.json({ error: 'Error searching Spotify' }, { status: 500 });
    }
}
