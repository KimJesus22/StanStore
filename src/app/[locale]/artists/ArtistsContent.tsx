'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { Music } from 'lucide-react';
import { useLocale } from 'next-intl';
import ArtistSkeleton from '@/components/ui/ArtistSkeleton';
import { ArtistCard, ArtistFilters, getArtists, type Artist } from '@/features/product';

const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem;
    min-height: 80vh;
`;

const PageTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PageSubtitle = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 1.1rem;
    margin-bottom: 2rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
`;

const Empty = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
    text-align: center;
    padding: 4rem 0;
    font-size: 1rem;
`;

type OrderByField = 'name' | 'popularity_score' | 'debut_date';

export default function ArtistsContent() {
    const locale = useLocale();
    const searchParams = useSearchParams();

    const genre = searchParams.get('genre') ?? undefined;
    const sort = (searchParams.get('sort') ?? 'name') as OrderByField;

    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getArtists(locale, { genre, orderBy: sort })
            .then(setArtists)
            .finally(() => setLoading(false));
    }, [locale, genre, sort]);

    return (
        <PageContainer>
            <PageTitle>
                <Music size={32} />
                Artistas K-Pop
            </PageTitle>
            <PageSubtitle>
                Descubre los grupos y solistas de tu tienda favorita
            </PageSubtitle>

            <ArtistFilters />

            {loading ? (
                <Grid>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ArtistSkeleton key={i} />
                    ))}
                </Grid>
            ) : artists.length === 0 ? (
                <Empty>No se encontraron artistas.</Empty>
            ) : (
                <Grid>
                    {artists.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                </Grid>
            )}
        </PageContainer>
    );
}
