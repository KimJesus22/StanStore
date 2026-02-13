import { NextRequest, NextResponse } from 'next/server';
import { getAlbumTracks } from '@/lib/spotify';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });
    }

    try {
        const data = await getAlbumTracks(id);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Spotify album error:', error);
        return NextResponse.json({ error: 'Error fetching album tracks' }, { status: 500 });
    }
}
