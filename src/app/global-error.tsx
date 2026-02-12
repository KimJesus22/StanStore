'use client';

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #ff4081; /* K-Pop vibrant pink */
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  max-width: 600px;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #10CFBD 0%, #0ebac5 100%);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(16, 207, 189, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 207, 189, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Illustration = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <Container>
                    <Illustration>💔</Illustration>
                    <Title>¡Oops! Algo salió mal</Title>
                    <Message>
                        Lo sentimos, ha ocurrido un error inesperado al cargar la página.
                        Nuestro equipo de fans ya está investigando.
                    </Message>
                    <RetryButton onClick={() => reset()}>
                        Intentar de nuevo
                    </RetryButton>
                </Container>
            </body>
        </html>
    );
}
