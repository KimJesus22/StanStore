# StanStore 🎵 | E-commerce Seguro, Moderno y Potenciado con IA

![Estado del Despliegue](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)
![Licencia](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Vitest](https://img.shields.io/badge/Coverage-86%25-brightgreen?style=for-the-badge&logo=vitest)

**StanStore** es una plataforma de comercio electrónico de vanguardia para mercancía exclusiva. Diseñada con un enfoque de **defensa en profundidad**, combina una arquitectura de micro-interacciones fluida con rigurosos estándares de ciberseguridad y capacidades modernas de Inteligencia Artificial.

## 🚀 Tecnologías (Tech Stack)

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) - Rendimiento extremo con Server Actions, SSR e **ISR**.
-   **IA & Búsqueda**: [@xenova/transformers](https://huggingface.co/docs/transformers.js) - Generación de embeddings locales (384D) con **pgvector** e índices HNSW.
-   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL) - Gestión de datos con RLS y búsqueda vectorial.
-   **Pagos**: [Stripe](https://stripe.com/) - Procesamiento con validación estricta de versiones de API en webhooks.
-   **Estilos & UI**: Styled Components + [Framer Motion](https://www.framer.com/motion/).
-   **Calidad**: [Vitest](https://vitest.dev/) con entorno **Happy-DOM** y [Playwright](https://playwright.dev/).

## 🧠 Inteligencia Artificial (Búsqueda Semántica)

A diferencia de las búsquedas tradicionales por texto exacto, StanStore utiliza **Embeddings**:
- **Tecnología**: Módulos locales `transformers.js` (Xenova/all-MiniLM-L6-v2) - **Costo $0**.
- **Infraestructura**: Almacenamiento en columnas `vector(384)` con índices **HNSW** para búsquedas de alta velocidad.
- **Mantenimiento**: Scripts incrementales en `scripts/generate-embeddings.ts` que procesan únicamente productos nuevos o editados mediante batch upserts.

## ⚡ Performance & UX (Optimización LCP/CLS)

- **ISR (Incremental Static Regeneration)**: Las páginas de catálogo y productos populares se pre-renderizan cada hora (`revalidate = 3600`), asegurando carga instantánea y SEO óptimo.
- **Priorización de Carga**: Uso de `priority={true}` en imágenes LCP y `sizes` dinámicos.
- **Componentes Diferidos**: Carga bajo demanda de reproductores externos (Spotify, YouTube).

## 🛡️ Ingeniería de Seguridad (Security Hardening)

1. **Audit Logs Inmutables**: Registro detallado de acciones críticas incluyendo latencia y metadatos.
2. **Cifrado de Alta Seguridad**: Implementación de AES-256-CBC con **rotación de claves** y versionado de secretos.
3. **Validación de Integraciones**: El endpoint de Stripe valida que la versión del evento coincida con la configuración de la app (`STRIPE_API_VERSION`), alertando sobre discrepancias.
4. **Protección de Secretos**: Tests automatizados (`env.security.test.ts`) que bloquean el build si se detectan fugas de claves administrativas (`SERVICE_ROLE_KEY`) hacia el cliente.

### Modelo de Seguridad Supabase (RLS vs Bypass)

*   **Cliente/Servidor (`lib/supabase/{client,server}.ts`)**: Respetan RLS.
*   **Admin (`lib/supabase/admin.ts`)**: Usa `SERVICE_ROLE_KEY`. Bypass RLS.

## 🧪 Estrategia de Calidad & Automatización

- **Unit Testing**: Suite de Vitest optimizada con **Happy-DOM** para mayor compatibilidad de módulos ESM.
- **Integración**: Pruebas de flujo completo con Playwright.
- **Seguridad**: Escaneo de variables de entorno en tiempo de build (`npm run build`).
- **Husky**: Pre-commit hooks para linting y tests locales.


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
