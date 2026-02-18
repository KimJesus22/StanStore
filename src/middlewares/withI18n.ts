import createMiddleware from 'next-intl/middleware';
import { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { localePrefix, locales, pathnames } from '../navigation';
import { MiddlewareFactory } from './chain';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'es',
    localePrefix,
    pathnames
});

export const withI18n: MiddlewareFactory = (next: NextMiddleware) => {
    return async (request: NextRequest, event: NextFetchEvent) => {
        // Ejecutamos next-intl para obtener la respuesta base (redirect/rewrite)
        const response = intlMiddleware(request);

        // Si next-intl devuelve una respuesta (siempre lo hace), la usamos.
        // Nota: En este patrón, withI18n suele ser el último middleware "generador"
        // de la cadena, o actúa como base para que otros (como Security) decoren su respuesta.

        // No llamamos a 'next(request, event)' aquí porque 'next-intl' ya ha determinado
        // el destino de la ruta y generado una respuesta (NextResponse).
        // Si tuviéramos middlewares POSTERIORES que necesitan ejecutarse SI O SI, 
        // tendríamos que estructurar diferente, pero generalmente i18n es la base.

        return response;
    };
};
