'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Music, Users, TrendingUp, ExternalLink } from 'lucide-react';
import ArtistSkeleton from '@/components/ui/ArtistSkeleton';

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
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1.1rem;
  margin-bottom: 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.a`
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    border-color: ${({ theme }) => theme.colors.primary}60;
  }
`;

const ArtistImage = styled.div<{ $src: string }>`
  width: 100%;
  aspect-ratio: 1;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
  }
`;

const ArtistName = styled.h2`
  position: absolute;
  bottom: 1rem;
  left: 1.25rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const GenresRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
`;

const Genre = styled.span`
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text}80;
`;

const StatValue = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const SpotifyBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #1DB954;
  font-size: 0.75rem;
  font-weight: 600;
`;

const PopularityBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
`;

const PopularityFill = styled.div<{ $value: number }>`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, #1DB954);
  border-radius: 2px;
  transition: width 1s ease;
`;



interface Artist {
  id: string;
  name: string;
  image: string | null;
  imageSmall: string | null;
  genres: string[];
  popularity: number;
  followers: number;
  externalUrl: string | null;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spotify/kpop')
      .then(r => r.json())
      .then((data: { artists?: Artist[] }) => {
        console.log('Artists Data:', data);
        if (data && Array.isArray(data.artists)) {
          setArtists(data.artists);
        } else {
          console.warn('Invalid artists data structure:', data);
          setArtists([]);
        }
      })
      .catch(err => {
        console.error('Error loading artists:', err);
        setArtists([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <PageTitle>
        <Music size={32} />
        Artistas K-Pop
      </PageTitle>
      <PageSubtitle>
        Descubre los grupos y solistas más populares del K-Pop
      </PageSubtitle>

      {loading ? (
        <Grid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ArtistSkeleton key={i} />
          ))}
        </Grid>
      ) : artists.length > 0 ? (
        <Grid>
          {artists.map(artist => (
            <Card
              key={artist.id}
              href={artist.externalUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArtistImage $src={artist.image || ''}>
                <ArtistName>{artist.name}</ArtistName>
              </ArtistImage>
              <CardBody>
                {artist.genres.length > 0 && (
                  <GenresRow>
                    {artist.genres.map(g => (
                      <Genre key={g}>{g}</Genre>
                    ))}
                  </GenresRow>
                )}
                <Stats>
                  <Stat>
                    <Users size={14} />
                    <StatValue>{formatFollowers(artist.followers)}</StatValue>
                  </Stat>
                  <Stat>
                    <TrendingUp size={14} />
                    <StatValue>{artist.popularity}</StatValue>/100
                  </Stat>
                  <SpotifyBadge>
                    <ExternalLink size={12} />
                    Spotify
                  </SpotifyBadge>
                </Stats>
                <PopularityBar>
                  <PopularityFill $value={artist.popularity} />
                </PopularityBar>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <h2>No artists found</h2>
          <p>Try refreshing the page or checking your connection.</p>
        </div>
      )}
    </PageContainer>
  );
}
