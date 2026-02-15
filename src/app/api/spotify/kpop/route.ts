import { NextResponse } from 'next/server';
import { getSpotifyToken, SpotifyArtist } from '@/lib/spotify';

const KPOP_ARTIST_IDS = [
    '3Nrfpe0tUJi4K4DXYWgMUX', // BTS
    '41MozSzQ6Uiny4H7GZR5Mf', // BLACKPINK
    '6HvZYsbFfjnjFrWF950C9d', // NewJeans
    '2dIgFjalVxs4ThymZ67YCE', // Stray Kids
    '7n2Ycct7Beij7Dj7meI4X0', // TWICE
    '6hhqsQsSOlJounrFjnqONz', // SEVENTEEN
    '6YVMFz59CuY7ngCxTxjpxE', // aespa
    '4SpbR6yFEvexJuaBpgAU5p', // LE SSERAFIM
    '2hcsKca6hCfFMwwdbFvenJ', // IVE
    '0SdiiPkr02EUoRnMoyPGgL', // (G)I-DLE
    '3ZZzT0MKrok0BVL2lhMclS', // Red Velvet
    '1z4g3DjTBBZKhvAroFlhOM', // Red Velvet (alt)
    '6RHTUrRF63xao58xh9FXYJ', // IU
    '52zMTJCKluDlFwMQWmccY7', // ITZY
    '0ghlgldX5Dd6720Q3qFyQB', // ENHYPEN
    '7kQSJynm3r7OUD4FdfGlc7', // TXT (TOMORROW X TOGETHER)
    '4gOc8TsLed5YxZn1mTbSLz', // NMIXX
    '5V1qsQHdXNm4ZEZHWvFnqQ', // ATEEZ
    '6UbmqUEgjLA6jAcXwbM1Z9', // TREASURE
    '0bdaKMgMn7K2Mjo149BnyF', // EXO
    '5gCRApTajqwbnHHPbr2Fpi', // GOT7
    '6nB0iY1cjSY1KyhYyuIIKH', // NCT 127
    '6SpLc7EXZIPpy0sVko0aoU', // NCT DREAM
    '1VwDG9aBflQupaFNjUru9A', // MAMAMOO
    '01XYiBYaoMJcNhPokrg0l0', // MONSTA X
];

export async function GET() {
    try {
        const { getMultipleArtists } = await import('@/lib/spotify');
        const artistsData = await getMultipleArtists(KPOP_ARTIST_IDS);

        const artists = artistsData
            .filter((a: SpotifyArtist | null) => a !== null)
            .map((a: SpotifyArtist) => ({
                id: a.id,
                name: a.name,
                image: a.images?.[0]?.url || null,
                imageSmall: a.images?.[1]?.url || a.images?.[0]?.url || null,
                genres: a.genres?.slice(0, 4) || [],
                popularity: a.popularity,
                followers: a.followers?.total || 0,
                externalUrl: a.external_urls?.spotify || null,
            }))
            .sort((a: { popularity: number }, b: { popularity: number }) => b.popularity - a.popularity);

        return NextResponse.json({ artists });
    } catch (error) {
        console.error('Error fetching K-Pop artists:', error);
        return NextResponse.json({ error: 'Error fetching artists' }, { status: 500 });
    }
}
