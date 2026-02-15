'use client';

import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const ImageSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  margin-bottom: 0.75rem;
`;

const TextSkeleton = styled.div<{ $width?: string; $height?: string; $marginBottom?: string }>`
  height: ${({ $height }) => $height || '1rem'};
  width: ${({ $width }) => $width || '100%'};
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0.5rem'};
`;

const FooterSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
`;

const CircleSkeleton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.border};
`;

export default function ProductSkeleton() {
    return (
        <SkeletonWrapper>
            <ImageSkeleton />
            <TextSkeleton $width="40%" $height="0.8rem" $marginBottom="0.25rem" /> {/* Artist */}
            <TextSkeleton $width="80%" $height="1rem" $marginBottom="0.5rem" />    {/* Name */}
            <FooterSkeleton>
                <TextSkeleton $width="30%" $height="1rem" $marginBottom="0" />       {/* Price */}
                <CircleSkeleton />                                                   {/* Add Button */}
            </FooterSkeleton>
        </SkeletonWrapper>
    );
}
