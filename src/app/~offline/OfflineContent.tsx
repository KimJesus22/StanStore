'use client';

export default function OfflineContent() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#111',
            color: '#fff',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#10CFBD' }}>Estás desconectado</h1>
            <p style={{ marginBottom: '2rem', maxWidth: '400px', lineHeight: '1.6', color: '#ccc' }}>
                Parece que perdiste la conexión a internet. Revisa tu señal para seguir explorando el mejor merch de tus idols.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#10CFBD',
                    color: '#111',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}
            >
                Reintentar conexión
            </button>
        </div>
    );
}
