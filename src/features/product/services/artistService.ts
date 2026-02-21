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

// COALESCE-style fallback chain for artist bios stored in JSONB.
// Try the requested locale first, then walk the chain until a non-empty value is found.
const BIO_FALLBACK_CHAIN: Record<string, string[]> = {
    'es':    ['es'],
    'en':    ['en', 'es'],
    'ko':    ['ko', 'en', 'es'],
    'pt-BR': ['pt-BR', 'en', 'es'],
    'fr-CA': ['fr-CA', 'en', 'es'],
};

function getLocalizedBio(content: Record<string, string> | null, locale: string): string {
    if (!content || typeof content !== 'object') return '';
    const chain = BIO_FALLBACK_CHAIN[locale] ?? BIO_FALLBACK_CHAIN['en'];
    for (const lang of chain) {
        const val = content[lang];
        if (typeof val === 'string' && val.trim() !== '') return val;
    }
    return '';
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
