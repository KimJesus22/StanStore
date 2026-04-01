import { NextRequest, NextResponse } from 'next/server';
import { getArtists } from '@/features/product';

type OrderByField = 'name' | 'popularity_score' | 'debut_date';

const VALID_LOCALES = new Set(['es', 'en', 'ko', 'pt-BR', 'fr-CA']);
const VALID_SORT: Set<OrderByField> = new Set(['name', 'popularity_score', 'debut_date']);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') ?? 'es';
    const genre = searchParams.get('genre') ?? undefined;
    const sort = searchParams.get('sort') ?? 'name';

    if (!VALID_LOCALES.has(locale)) {
        return NextResponse.json({ error: 'Locale no válido' }, { status: 400 });
    }
    if (!VALID_SORT.has(sort as OrderByField)) {
        return NextResponse.json({ error: 'Campo de ordenación no válido' }, { status: 400 });
    }
    if (genre !== undefined && (genre.length > 50 || !/^[\w\s-]+$/.test(genre))) {
        return NextResponse.json({ error: 'Género no válido' }, { status: 400 });
    }

    try {
        const artists = await getArtists(locale, { genre, orderBy: sort as OrderByField });
        return NextResponse.json(artists, {
            headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
        });
    } catch {
        return NextResponse.json({ error: 'Error al obtener artistas' }, { status: 500 });
    }
}
