/**
 * YouTube Data API v3 Helper — Server-side only
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
}

function getApiKey(): string {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
        throw new Error('Missing YOUTUBE_API_KEY in environment variables');
    }
    return key;
}

/**
 * Busca videos en YouTube por query.
 */
export async function searchVideos(query: string, maxResults = 5): Promise<YouTubeVideo[]> {
    const apiKey = getApiKey();
    const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: String(maxResults),
        key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`, {
        next: { revalidate: 3600 }, // cache 1 hora
    });

    if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return data.items.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high: { url: string } }; channelTitle: string; publishedAt: string } }) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
    }));
}

/**
 * Busca el MV oficial de un artista y canción.
 * Prioriza resultados de canales oficiales con "Official MV" en el título.
 */
export async function searchMusicVideo(artistName: string, songName?: string): Promise<YouTubeVideo[]> {
    const query = songName
        ? `${artistName} ${songName} Official MV`
        : `${artistName} Official MV`;

    return searchVideos(query, 5);
}
