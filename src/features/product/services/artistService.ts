import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';

type ArtistRow = Database['public']['Tables']['artists']['Row'];

export interface Artist {
    id: string;
    name: string;
    bio: string; // Localized bio
    image_url: string | null;
}

export async function getArtists(locale: string = 'es'): Promise<Artist[]> {
    try {
        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching artists:', error);
            return [];
        }

        return data.map((artist: ArtistRow) => ({
            id: artist.id,
            name: artist.name,
            image_url: artist.image_url,
            bio: getLocalizedContent(artist.bio as Record<string, string> | null, locale),
        }));

    } catch (err) {
        console.error('Unexpected error fetching artists:', err);
        return [];
    }
}

function getLocalizedContent(content: Record<string, string> | null, locale: string): string {
    if (!content || typeof content !== 'object') return '';
    // Opción A: JSONB mapping en frontend
    // Intenta obtener el idioma solicitado, si no, fallback a 'es'
    return content[locale] || content['es'] || '';
}
