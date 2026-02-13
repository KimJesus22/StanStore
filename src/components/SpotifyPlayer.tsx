import React from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  margin-top: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #000;
`;

interface SpotifyPlayerProps {
    albumId: string;
}

export default function SpotifyPlayer({ albumId }: SpotifyPlayerProps) {
    if (!albumId) return null;

    return (
        <PlayerContainer>
            <iframe
                style={{ borderRadius: '12px' }}
                src={`https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            />
        </PlayerContainer>
    );
}
