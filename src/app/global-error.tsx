'use client';

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          color: '#333',
          fontFamily: "'Inter', sans-serif",
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💔</div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#ff4081',
          }}>
            ¡Oops! Algo salió mal
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            color: '#666',
            maxWidth: '600px',
          }}>
            Lo sentimos, ha ocurrido un error inesperado al cargar la página.
            Nuestro equipo de desarrolladores ya está investigando.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(135deg, #10CFBD 0%, #0ebac5 100%)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 207, 189, 0.4)',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
