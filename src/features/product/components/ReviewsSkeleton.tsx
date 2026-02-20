'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SkeletonReview = styled.div`
  border-bottom: 1px solid #f9f9f9;
  padding-bottom: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export default function ReviewsSkeleton() {
    return (
        <Container>
            <Skeleton $height="2rem" $width="200px" style={{ marginBottom: '1rem' }} />
            {[1, 2, 3].map((i) => (
                <SkeletonReview key={i}>
                    <Header>
                        <Skeleton $height="1rem" $width="100px" />
                        <Skeleton $height="0.8rem" $width="60px" />
                    </Header>
                    <Skeleton $height="1rem" $width="100%" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton $height="1rem" $width="80%" />
                </SkeletonReview>
            ))}
        </Container>
    );
}
