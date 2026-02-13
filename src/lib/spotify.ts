/**
 * Spotify API Helper — Client Credentials Flow (server-side only)
 */

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getSpotifyToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing Spotify credentials in environment variables');
    }

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        throw new Error(`Spotify auth failed: ${res.status}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 1 min early
    return cachedToken!;
}

async function spotifyFetch(endpoint: string) {
    const token = await getSpotifyToken();
    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
        throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export async function searchArtists(query: string, limit = 5) {
    const data = await spotifyFetch(
        `/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`
    );
    return data.artists.items.map((a: any) => ({
        id: a.id,
        name: a.name,
        image: a.images?.[1]?.url || a.images?.[0]?.url || null,
        genres: a.genres?.slice(0, 3) || [],
        popularity: a.popularity,
        followers: a.followers?.total || 0,
    }));
}

export async function searchAlbums(query: string, artistName?: string, limit = 10) {
    const q = artistName ? `${query} artist:${artistName}` : query;
    const data = await spotifyFetch(
        `/search?q=${encodeURIComponent(q)}&type=album&limit=${limit}`
    );
    return data.albums.items.map((a: any) => ({
        id: a.id,
        name: a.name,
        image: a.images?.[1]?.url || a.images?.[0]?.url || null,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
        artists: a.artists?.map((ar: any) => ar.name) || [],
    }));
}

export async function getArtist(artistId: string) {
    const a = await spotifyFetch(`/artists/${artistId}`);
    return {
        id: a.id,
        name: a.name,
        image: a.images?.[0]?.url || null,
        imageSmall: a.images?.[1]?.url || a.images?.[0]?.url || null,
        genres: a.genres || [],
        popularity: a.popularity,
        followers: a.followers?.total || 0,
        externalUrl: a.external_urls?.spotify || null,
    };
}

export async function getArtistAlbums(artistId: string, limit = 10) {
    const data = await spotifyFetch(
        `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&market=MX`
    );
    return data.items.map((a: any) => ({
        id: a.id,
        name: a.name,
        image: a.images?.[1]?.url || a.images?.[0]?.url || null,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
    }));
}

export async function getAlbumTracks(albumId: string) {
    const [album, tracksData] = await Promise.all([
        spotifyFetch(`/albums/${albumId}`),
        spotifyFetch(`/albums/${albumId}/tracks?limit=50`),
    ]);

    return {
        album: {
            id: album.id,
            name: album.name,
            image: album.images?.[0]?.url || null,
            releaseDate: album.release_date,
            artists: album.artists?.map((a: any) => a.name) || [],
        },
        tracks: tracksData.items.map((t: any, i: number) => ({
            id: t.id,
            name: t.name,
            trackNumber: t.track_number || i + 1,
            durationMs: t.duration_ms,
            previewUrl: t.preview_url,
            artists: t.artists?.map((a: any) => a.name) || [],
        })),
    };
}
