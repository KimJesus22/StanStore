'use client';

import { Suspense } from 'react';
import styled from 'styled-components';
import { XCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 1.5rem 0 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text}80;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 520px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryButton = styled(Link)`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text};
  }
`;

function CancelContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const isFailed = reason === 'failed';

  return (
    <>
      <XCircle size={64} color="#EF5350" />
      <Title>{isFailed ? 'Pago no procesado' : 'Pago cancelado'}</Title>
      <Subtitle>
        {isFailed
          ? 'Hubo un problema al procesar tu pago. Tu carrito sigue guardado — puedes intentarlo de nuevo.'
          : 'No se completó el pago. No se realizó ningún cargo. Tu carrito sigue disponible.'}
      </Subtitle>
      <ButtonRow>
        <PrimaryButton href="/checkout">Intentar de nuevo</PrimaryButton>
        <SecondaryButton href="/">Volver a la tienda</SecondaryButton>
      </ButtonRow>
    </>
  );
}

export default function CancelPage() {
  return (
    <Container>
      <Suspense fallback={null}>
        <CancelContent />
      </Suspense>
    </Container>
  );
}
