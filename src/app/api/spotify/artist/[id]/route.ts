import { NextRequest, NextResponse } from 'next/server';
import { getArtist } from '@/lib/spotify';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });
    }

    try {
        const artist = await getArtist(id);
        return NextResponse.json(artist);
    } catch (error) {
        console.error('Spotify artist error:', error);
        return NextResponse.json({ error: 'Error fetching artist' }, { status: 500 });
    }
}
