import { NextRequest, NextResponse } from 'next/server';
import { searchArtists, searchAlbums, getArtistAlbums } from '@/lib/spotify';

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
