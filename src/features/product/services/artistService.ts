import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';

export interface Artist {
    id: string;
    name: string;
    bio: string;
    image_url: string | null;
    products_count: number;
    genre: string | null;
    popularity_score: number | null;
    debut_date: string | null;
}

type OrderByField = 'name' | 'popularity_score' | 'debut_date';

interface GetArtistsOptions {
    genre?: string;
    orderBy?: OrderByField;
}

async function fetchArtists(
    locale: string,
    options: GetArtistsOptions
): Promise<Artist[]> {
    const { genre, orderBy = 'name' } = options;

    try {
        let query = supabase
            .from('artists')
            .select(`
                id,
                name,
                bio,
                image_url,
                genre,
                popularity_score,
                debut_date,
                products(count)
            `)
            .order(orderBy, { ascending: orderBy === 'name' });

        if (genre) {
            query = query.eq('genre', genre);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching artists:', error);
            return [];
        }

        return (data ?? []).map((artist) => ({
            id: artist.id,
            name: artist.name,
            image_url: artist.image_url,
            bio: getLocalizedBio(artist.bio as Record<string, string> | null, locale),
            products_count: (artist.products as Array<{ count: number }>)?.[0]?.count ?? 0,
            genre: artist.genre ?? null,
            popularity_score: artist.popularity_score ?? null,
            debut_date: artist.debut_date ?? null,
        }));

    } catch (err) {
        console.error('Unexpected error fetching artists:', err);
        return [];
    }
}

function getLocalizedBio(content: Record<string, string> | null, locale: string): string {
    if (!content || typeof content !== 'object') return '';
    return content[locale] || content['es'] || '';
}

const getCachedArtists = unstable_cache(
    fetchArtists,
    ['getArtists'],
    {
        revalidate: 3600,
        tags: ['artists'],
    }
);

export async function getArtists(
    locale: string = 'es',
    options: GetArtistsOptions = {}
): Promise<Artist[]> {
    return getCachedArtists(locale, options);
}
