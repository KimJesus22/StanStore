'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import styled, { createGlobalStyle } from 'styled-components';

const FanModeGlobalStyle = createGlobalStyle<{ $cursorUrl: string }>`
  body {
    cursor: url(${props => props.$cursorUrl}), auto !important;
  }
  
  a, button {
    cursor: url(${props => props.$cursorUrl}), pointer !important;
  }
`;

interface FanModeEffectsProps {
    isActive: boolean;
    artist: string;
    themeColor?: string;
}

// Map artists to custom cursors (simulated for now)
const ARTIST_CURSORS: Record<string, string> = {
    'Twenty One Pilots': 'https://cdn.custom-cursor.com/db/cursor/32/twenty_one_pilots_cursor.png', // Placeholder
    'BTS': 'https://cdn.custom-cursor.com/db/cursor/32/bts_cursor.png',
    'default': 'https://cdn.custom-cursor.com/db/cursor/32/music_note_cursor.png'
};

export default function FanModeEffects({ isActive, artist, themeColor = '#10CFBD' }: FanModeEffectsProps) {

    useEffect(() => {
        if (isActive) {
            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: [themeColor, '#ffffff']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: [themeColor, '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isActive, themeColor]);

    if (!isActive) return null;

    const cursorUrl = ARTIST_CURSORS[artist] || ARTIST_CURSORS['default'];

    return <FanModeGlobalStyle $cursorUrl={cursorUrl} />;
}
