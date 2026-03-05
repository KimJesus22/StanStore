'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ExternalLink } from 'lucide-react';

const PlayerContainer = styled.div`
  margin-top: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #000;
  aspect-ratio: 16 / 9;
`;

const FallbackContainer = styled.div`
  margin-top: 2rem;
  border-radius: 12px;
  background: #111;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const FallbackText = styled.p`
  color: #aaa;
  font-size: 0.9rem;
  text-align: center;
  padding: 0 2rem;
`;

const YoutubeLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ff0000;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

interface YouTubePlayerProps {
    videoId: string;
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.youtube.com') return;
            try {
                const data = JSON.parse(event.data as string);
                // 100 = video not found / private, 101 / 150 = embedding not allowed
                if (data.event === 'onError' && [100, 101, 150].includes(data.info as number)) {
                    setHasError(true);
                }
            } catch {
                // not a JSON message — ignore
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!videoId) return null;

    if (hasError) {
        return (
            <FallbackContainer>
                <FallbackText>
                    Este video no está disponible para reproducción integrada.
                </FallbackText>
                <YoutubeLink
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLink size={18} />
                    Ver en YouTube
                </YoutubeLink>
            </FallbackContainer>
        );
    }

    return (
        <PlayerContainer>
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </PlayerContainer>
    );
}
