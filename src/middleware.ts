import { chain } from './middlewares/chain';
import { withAuth } from './middlewares/withAuth';
import { withI18n } from './middlewares/withI18n';
import { withRateLimit } from './middlewares/withRateLimit';
import { withSecurityHeaders } from './middlewares/withSecurityHeaders';

// El orden de ejecución es de "afuera" hacia "adentro":
// 1. withSecurityHeaders (envuelve respuesta final)
// 2. withRateLimit (puede abortar temprano)
// 3. withAuth (valida usuario y sesión)
// 4. withI18n (router final, genera respuesta base)
export default chain([
    withSecurityHeaders,
    withRateLimit,
    withAuth,
    withI18n
]);

export const config = {
    // Matcher unificado para todos los middlewares
    // Excluye: api, _next, _vercel, archivos estáticos, y /monitoring (Sentry tunnel)
    matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)']
};
