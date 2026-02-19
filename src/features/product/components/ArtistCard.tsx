'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { Link } from '@/navigation';
import type { Artist } from '../services/artistService';

const CardWrapper = styled.div`
    border-radius: 16px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.secondaryBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        border-color: ${({ theme }) => theme.colors.primary}60;
    }

    &:hover img {
        transform: scale(1.05);
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.border};
`;

const StyledImage = styled(Image)`
    object-fit: cover;
    transition: transform 0.35s ease;
`;

const Placeholder = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
`;

const CardBody = styled.div`
    padding: 1rem 1.25rem 1.25rem;
`;

const ArtistName = styled.h3`
    font-size: 1.125rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: ${({ theme }) => theme.colors.primary}18;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
`;

const GenreTag = styled.span`
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

interface ArtistCardProps {
    artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    const href = { pathname: '/' as const, query: { artist: artist.name } };
    const productLabel = artist.products_count === 1 ? 'producto' : 'productos';

    return (
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <CardWrapper>
                <ImageWrapper>
                    {artist.image_url ? (
                        <StyledImage
                            src={artist.image_url}
                            alt={artist.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <Placeholder>🎵</Placeholder>
                    )}
                </ImageWrapper>
                <CardBody>
                    <ArtistName>{artist.name}</ArtistName>
                    <Footer>
                        <Badge>{artist.products_count} {productLabel}</Badge>
                        {artist.genre && <GenreTag>{artist.genre}</GenreTag>}
                    </Footer>
                </CardBody>
            </CardWrapper>
        </Link>
    );
}
