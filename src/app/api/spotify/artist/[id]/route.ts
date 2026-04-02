import { NextRequest, NextResponse } from 'next/server';
import { getArtist } from '@/lib/spotify';

const SPOTIFY_ID_REGEX = /^[a-zA-Z0-9]{22}$/;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id || !SPOTIFY_ID_REGEX.test(id)) {
        return NextResponse.json({ error: 'ID de artista inválido o ausente.' }, { status: 400 });
    }

    try {
        const artist = await getArtist(id);
        return NextResponse.json(artist, {
            headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
        });
    } catch (error) {
        console.error('Spotify artist error:', error);
        return NextResponse.json({ error: 'Error fetching artist' }, { status: 500 });
    }
}
