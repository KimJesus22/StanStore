'use client';

import { Loader2 } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerWrapper = styled.div<{ $size?: number; $color?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $color }) => $color || theme.colors.primary};
  
  svg {
    animation: ${spin} 1s linear infinite;
    width: ${({ $size }) => $size || 24}px;
    height: ${({ $size }) => $size || 24}px;
  }
`;

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function Spinner({ size = 24, color, className }: SpinnerProps) {
  return (
    <SpinnerWrapper $size={size} $color={color} className={className}>
      <Loader2 />
    </SpinnerWrapper>
  );
}
