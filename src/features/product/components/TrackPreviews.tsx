'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Play, Pause, Clock } from 'lucide-react';

const Container = styled.div`
  margin-top: 2rem;
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const TrackList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const TrackItem = styled.div<{ $isPlaying: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  gap: 0.75rem;
  transition: background 0.15s;
  background: ${({ $isPlaying, theme }) => $isPlaying ? `${theme.colors.primary}15` : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const TrackNumber = styled.span`
  width: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text}60;
  font-variant-numeric: tabular-nums;
`;

const PlayButton = styled.button<{ $isPlaying: boolean }>`
  background: ${({ $isPlaying, theme }) => $isPlaying ? theme.colors.primary : 'transparent'};
  color: ${({ $isPlaying, theme }) => $isPlaying ? '#fff' : theme.colors.text};
  border: 1px solid ${({ $isPlaying, theme }) => $isPlaying ? theme.colors.primary : theme.colors.border};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  }
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackName = styled.div<{ $isPlaying: boolean }>`
  font-size: 0.9rem;
  font-weight: ${({ $isPlaying }) => $isPlaying ? 600 : 400};
  color: ${({ $isPlaying, theme }) => $isPlaying ? theme.colors.primary : theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtists = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text}80;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Duration = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text}60;
  font-variant-numeric: tabular-nums;
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 3px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-left: auto;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px;
  transition: width 0.3s linear;
`;

const NoPreview = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text}40;
  font-style: italic;
`;

interface Track {
    id: string;
    name: string;
    trackNumber: number;
    durationMs: number;
    previewUrl: string | null;
    artists: string[];
}

interface TrackPreviewsProps {
    albumId: string;
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TrackPreviews({ albumId }: TrackPreviewsProps) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [albumName, setAlbumName] = useState('');
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!albumId) return;

        const fetchTracks = async () => {
            try {
                const res = await fetch(`/api/spotify/album/${albumId}`);
                const data = await res.json();
                if (data.tracks) {
                    setTracks(data.tracks);
                    setAlbumName(data.album?.name || '');
                }
            } catch (error) {
                console.error('Error fetching tracks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [albumId]);

    const handlePlay = useCallback((track: Track) => {
        if (!track.previewUrl) return;

        // If same track, toggle
        if (playingId === track.id) {
            audioRef.current?.pause();
            setPlayingId(null);
            setProgress(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        // Stop previous
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (intervalRef.current) clearInterval(intervalRef.current);

        const audio = new Audio(track.previewUrl);
        audioRef.current = audio;
        setPlayingId(track.id);
        setProgress(0);

        audio.play();

        intervalRef.current = setInterval(() => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        }, 200);

        audio.onended = () => {
            setPlayingId(null);
            setProgress(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playingId]);

    if (loading || tracks.length === 0) return null;

    return (
        <Container>
            <Header>
                <Clock size={16} />
                <HeaderTitle>{albumName || 'Tracklist'}</HeaderTitle>
            </Header>
            <TrackList>
                {tracks.map(track => (
                    <TrackItem key={track.id} $isPlaying={playingId === track.id}>
                        <TrackNumber>{track.trackNumber}</TrackNumber>
                        <PlayButton
                            $isPlaying={playingId === track.id}
                            onClick={() => handlePlay(track)}
                            disabled={!track.previewUrl}
                            title={track.previewUrl ? 'Preview 30s' : 'Preview no disponible'}
                        >
                            {playingId === track.id ? <Pause size={14} /> : <Play size={14} />}
                        </PlayButton>
                        <TrackInfo>
                            <TrackName $isPlaying={playingId === track.id}>{track.name}</TrackName>
                            <TrackArtists>{track.artists.join(', ')}</TrackArtists>
                        </TrackInfo>
                        {playingId === track.id ? (
                            <ProgressBar>
                                <ProgressFill $progress={progress} />
                            </ProgressBar>
                        ) : track.previewUrl ? (
                            <Duration>{formatDuration(track.durationMs)}</Duration>
                        ) : (
                            <NoPreview>sin preview</NoPreview>
                        )}
                    </TrackItem>
                ))}
            </TrackList>
        </Container>
    );
}
