import { NextRequest, NextResponse } from 'next/server';
import { getArtists } from '@/features/product';

type OrderByField = 'name' | 'popularity_score' | 'debut_date';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') ?? 'es';
    const genre = searchParams.get('genre') ?? undefined;
    const sort = (searchParams.get('sort') ?? 'name') as OrderByField;

    const artists = await getArtists(locale, { genre, orderBy: sort });
    return NextResponse.json(artists);
}
