# StanStore 🎵 | E-commerce Seguro, Moderno y Potenciado con IA

![Estado del Despliegue](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)
![Licencia](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Vitest](https://img.shields.io/badge/Coverage-86%25-brightgreen?style=for-the-badge&logo=vitest)

**StanStore** es una plataforma de comercio electrónico de vanguardia para mercancía exclusiva. Diseñada con un enfoque de **defensa en profundidad**, combina una arquitectura de micro-interacciones fluida con rigurosos estándares de ciberseguridad y capacidades modernas de Inteligencia Artificial.

## 🚀 Tecnologías (Tech Stack)

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) - Rendimiento extremo con Server Actions y SSR.
-   **IA & Búsqueda**: [@xenova/transformers](https://huggingface.co/docs/transformers.js) - Generación de embeddings locales para búsqueda semántica avanzada.
-   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL) - Gestión de datos con Row Level Security (RLS).
-   **Pagos**: [Stripe](https://stripe.com/) - Procesamiento seguro y cumplimiento PCI.
-   **Estilos & UI**: Styled Components + [Framer Motion](https://www.framer.com/motion/) para una experiencia de usuario "premium".
-   **Calidad**: [Vitest](https://vitest.dev/) para unit testing y [Playwright](https://playwright.dev/) para flujos de integración E2E.

## 🧠 Inteligencia Artificial (Búsqueda Semántica)

A diferencia de las búsquedas tradicionales por texto exacto, StanStore utiliza **Embeddings**:
- **Tecnología**: Implementado con modelos de HuggingFace ejecutándose vía `transformers.js`.
- **Funcionamiento**: Los productos se vectorizan para permitir búsquedas por "intención" o "concepto".
- **Mantenimiento**: Scripts automatizados en `scripts/generate-embeddings.ts` para mantener el índice actualizado.

## ⚡ Performance & UX (Optimización LCP/CLS)

Hemos optimizado cada milisegundo para mejorar la conversión:
- **Priorización de Carga**: Uso de `priority={true}` en imágenes LCP y `sizes` dinámicos para reducir el consumo de datos en móviles.
- **Componentes Diferidos**: Reproductores pesados (Spotify, YouTube) y secciones secundarias se cargan bajo demanda (Next Dynamic) para no bloquear el hilo principal.
- **Web Vitals**: Monitorización en tiempo real mediante `WebVitals.tsx` con alertas visuales en consola para métricas críticas (LCP, CLS, INP).

## 🛡️ Ingeniería de Seguridad (Security Hardening)

Siguiendo el top 10 de OWASP, el sistema implementa:
1. **Audit Logs Inmutables**: Registro detallado de acciones críticas (IP, User-Agent, Acción) para análisis forense.
2. **CSP Estricta**: Content Security Policy configurada en el middleware para mitigar ataques XSS y Clickjacking.
3. **Rate Limiting**: Protección anti-fuerza bruta en el middleware para endpoints de API y Server Actions.
4. **Validación Zod**: Sanitización y validación estricta de esquemas en todos los puntos de entrada de datos.

## 🧪 Estrategia de Calidad & Automatización

- **Unit Testing**: Suite de Vitest con una cobertura de ramas del **~86%** (mínimo requerido 70%).
- **Integración**: Pruebas de flujo completo con Playwright que simulan desde la búsqueda hasta el checkout.
- **Husky & Lint-staged**: Validación automática de linting y tests en el `pre-commit` para evitar código roto en el repositorio.
- **CI/CD**: Pipeline de GitHub Actions que incluye auditoría de seguridad y escaneo de secretos antes de cada deployment.

## 📂 Estructura del Proyecto

```text
src/
├── app/            # Rutas, Layouts e Internacionalización (next-intl)
├── components/     # UI Atómica y Organismos complejos
├── context/        # Estado global (Zustand) y Lógica de Negocio
├── lib/            # Validaciones (Zod), Supabase y Utilidades
├── middleware.ts   # Seguridad, Rate Limit y Localización
└── scripts/        # Herramientas de IA y mantenimiento
```

## 🛠️ Instalación y Desarrollo

1. **Dependencias**: `npm install`
2. **Entorno**: Configurar `.env.local` con claves de Supabase y Stripe.
3. **Desarrollo**: `npm run dev`
4. **Pruebas**: `npm test` o `npm run test:coverage` para ver el reporte detallado.

---
## 📄 Licencia
Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE).
