'use client';

import { useEffect, Suspense } from 'react';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
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
  color: #111;
  margin: 1.5rem 0 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const Button = styled(Link)`
  background: #111;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: #000;
  }
`;

function SuccessContent() {
    const clearCart = useCartStore((state) => state.clearCart);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    return (
        <>
            <CheckCircle size={64} color="#10CFBD" />
            <Title>¡Gracias por tu compra!</Title>
            <Subtitle>
                Tu pedido ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de confirmación.
            </Subtitle>
            <Button href="/">Volver a la tienda</Button>
        </>
    );
}

export default function SuccessPage() {
    return (
        <Container>
            <Suspense fallback={<p>Cargando...</p>}>
                <SuccessContent />
            </Suspense>
        </Container>
    );
}
