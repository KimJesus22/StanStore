// import * as Sentry from '@sentry/nextjs';


export async function register() {
    // Registramos el mapa de errores de Zod para el entorno servidor (Node/Edge)
    const { registerZodErrorMap } = await import('./lib/zod-error-map');
    registerZodErrorMap();

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}
