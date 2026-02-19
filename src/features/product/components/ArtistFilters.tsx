'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from '@/navigation';
import styled from 'styled-components';

const FiltersBar = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
`;

const Select = styled.select`
    padding: 0.5rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.secondaryBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.875rem;
    cursor: pointer;
    min-width: 160px;

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`;

const GENRES = ['K-Pop', 'K-Hip-Hop', 'K-R&B', 'K-Indie', 'K-Rock'];

const SORT_OPTIONS = [
    { label: 'Alfabético', value: 'name' },
    { label: 'Más Populares', value: 'popularity_score' },
    { label: 'Debut (Más recientes)', value: 'debut_date' },
];

export default function ArtistFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentGenre = searchParams.get('genre') ?? '';
    const currentSort = searchParams.get('sort') ?? 'name';

    function update(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}` as never);
    }

    return (
        <FiltersBar>
            <Select
                value={currentGenre}
                onChange={e => update('genre', e.target.value)}
                aria-label="Filtrar por género"
            >
                <option value="">Todos los géneros</option>
                {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </Select>

            <Select
                value={currentSort}
                onChange={e => update('sort', e.target.value)}
                aria-label="Ordenar por"
            >
                {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </Select>
        </FiltersBar>
    );
}
