'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export const Skeleton = styled.div<{ $width?: string; $height?: string; $borderRadius?: string }>`
  background: ${({ theme }) => theme.colors.secondaryBackground};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.secondaryBackground} 0px,
    ${({ theme }) => theme.colors.border} 40px,
    ${({ theme }) => theme.colors.secondaryBackground} 80px
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  margin-bottom: 0.5rem;
`;

export default Skeleton;
