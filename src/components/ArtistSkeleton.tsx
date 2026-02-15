'use client';

import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const SkeletonWrapper = styled.div`
  background: ${({ theme }) => theme.colors.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  overflow: hidden;
  height: 400px; /* Proximate height of artist card */
  display: flex;
  flex-direction: column;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const ImageSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.colors.border};
`;

const BodySkeleton = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextSkeleton = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height || '1rem'};
  width: ${({ $width }) => $width || '100%'};
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const RowSkeleton = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export default function ArtistSkeleton() {
    return (
        <SkeletonWrapper>
            <ImageSkeleton />
            <BodySkeleton>
                <RowSkeleton>
                    <TextSkeleton $width="20%" $height="1.2rem" />
                    <TextSkeleton $width="25%" $height="1.2rem" />
                </RowSkeleton>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <TextSkeleton $width="30%" />
                    <TextSkeleton $width="20%" />
                    <TextSkeleton $width="20%" />
                </div>
                <TextSkeleton $width="100%" $height="4px" style={{ marginTop: '1rem' }} />
            </BodySkeleton>
        </SkeletonWrapper>
    );
}
