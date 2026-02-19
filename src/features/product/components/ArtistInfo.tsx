'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Music, Users, TrendingUp, ExternalLink } from 'lucide-react';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ArtistImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const ArtistName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const SpotifyLink = styled.a`
  color: #1DB954;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  margin-top: 0.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text}99;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const GenresRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Genre = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
`;

interface ArtistData {
    id: string;
    name: string;
    image: string | null;
    genres: string[];
    popularity: number;
    followers: number;
    externalUrl: string | null;
}

interface ArtistInfoProps {
    artistName: string;
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

export default function ArtistInfo({ artistName }: ArtistInfoProps) {
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!artistName) return;

        const fetchArtist = async () => {
            try {
                const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistName)}&type=artist`);
                const data = await res.json();

                if (data.results && data.results.length > 0) {
                    // Get full artist info
                    const topResult = data.results[0];
                    const detailRes = await fetch(`/api/spotify/artist/${topResult.id}`);
                    const detail = await detailRes.json();
                    setArtist(detail);
                }
            } catch (error) {
                console.error('Error fetching artist info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [artistName]);

    if (loading || !artist) return null;

    return (
        <Card>
            <Header>
                {artist.image && <ArtistImage src={artist.image} alt={artist.name} />}
                <div>
                    <ArtistName>{artist.name}</ArtistName>
                    {artist.externalUrl && (
                        <SpotifyLink href={artist.externalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={12} /> Ver en Spotify
                        </SpotifyLink>
                    )}
                </div>
            </Header>

            {artist.genres.length > 0 && (
                <GenresRow>
                    {artist.genres.map(genre => (
                        <Genre key={genre}><Music size={10} /> {genre}</Genre>
                    ))}
                </GenresRow>
            )}

            <StatsRow>
                <Stat>
                    <Users size={14} />
                    <StatValue>{formatNumber(artist.followers)}</StatValue> seguidores
                </Stat>
                <Stat>
                    <TrendingUp size={14} />
                    Popularidad: <StatValue>{artist.popularity}/100</StatValue>
                </Stat>
            </StatsRow>
        </Card>
    );
}
