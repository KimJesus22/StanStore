# StanStore 🎵 | E-commerce Seguro, Moderno y Potenciado con IA

![Estado del Despliegue](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)
![Licencia](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Vitest](https://img.shields.io/badge/Coverage-86%25-brightgreen?style=for-the-badge&logo=vitest)

**StanStore** es una plataforma de comercio electrónico de vanguardia para mercancía exclusiva. Diseñada con un enfoque de **defensa en profundidad**, combina una arquitectura de micro-interacciones fluida con rigurosos estándares de ciberseguridad y capacidades modernas de Inteligencia Artificial.

## 🚀 Tecnologías (Tech Stack)

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) - Rendimiento extremo con Server Actions, SSR e **ISR**.
-   **Internacionalización**: [next-intl](https://next-intl-docs.vercel.app/) - Soporte nativo para ES, EN, KO con rutas localizadas y formateo dinámico.
-   **IA & Búsqueda**: [@xenova/transformers](https://huggingface.co/docs/transformers.js) - Generación de embeddings locales (384D) con **pgvector** e índices HNSW.
-   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL) - Gestión de datos con RLS y búsqueda vectorial.
-   **Pagos**: [Stripe](https://stripe.com/) - Procesamiento con validación estricta de versiones de API en webhooks.
-   **Estilos & UI**: Styled Components + [Framer Motion](https://www.framer.com/motion/).
-   **Calidad & A11y**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) y [Axe Core](https://www.deque.com/axe/) para auditorías de accesibilidad.

## 🧠 Inteligencia Artificial (Búsqueda Semántica)

A diferencia de las búsquedas tradicionales por texto exacto, StanStore utiliza **Embeddings**:
- **Tecnología**: Módulos locales `transformers.js` (Xenova/all-MiniLM-L6-v2) - **Costo $0**.
- **Infraestructura**: Almacenamiento en columnas `vector(384)` con índices **HNSW** para búsquedas de alta velocidad.
- **Mantenimiento**: Scripts incrementales en `scripts/generate-embeddings.ts` que procesan únicamente productos nuevos o editados mediante batch upserts.

## ⚡ Performance & UX (Optimización LCP/CLS)

- **ISR (Incremental Static Regeneration)**: Las páginas de catálogo y productos populares se pre-renderizan cada hora (`revalidate = 3600`), asegurando carga instantánea y SEO óptimo.
- **Priorización de Carga**: Uso de `priority={true}` en imágenes LCP y `sizes` dinámicos.
- **Componentes Diferidos**: Carga bajo demanda de reproductores externos (Spotify, YouTube).

## 🌍 Internacionalización (i18n)

Implementada con un enfoque "Type-Safe" y optimizada para SEO:
- **Idiomas Soportados**: 🇪🇸 Español, 🇺🇸 Inglés, 🇰🇷 Coreano.
- **Rutas Localizadas**: Estructura `/[locale]/ruta` con detección automática de preferencia de idioma.
- **Formateo Dinámico**: Uso de `useFormatter` para mostrar monedas (`PriceTag`), fechas y listas gramaticalmente correctas según el locale.
- **Validaciones i18n**: Esquemas de **Zod** dinámicos que inyectan mensajes de error traducidos en tiempo real.
- **Contenido Dinámico (JSONB)**: El servicio `getArtists` localiza campos JSONB (`bio`) con fallback automático a español.
- **Páginas Estáticas en Markdown**: Páginas legales (`/terms`) renderizadas desde archivos `.md` por locale (`terms.es.md`, `terms.en.md`) con `gray-matter` + `remark`. Si el idioma no existe, se carga el español con un aviso visual.
- **Cookie `NEXT_LOCALE`**: Gestionada automáticamente por el middleware `next-intl` para persistir la preferencia de idioma.

## ♿ Accesibilidad (A11y - WCAG 2.1 AA)

Diseñada para ser inclusiva y navegable por todos:
- **Navegación por Teclado**: Componente **Skip Link** para saltar al contenido y anillos de foco de alto contraste (`:focus-visible`) globales.
- **Lectores de Pantalla**: **Route Announcer** para anunciar cambios de página en navegación SPA y etiquetas ARIA optimizadas.
- **Contraste de Color**: Auditoría de paleta (Ratio 4.5:1) con variables `textMuted` ajustadas para modo claro y oscuro.
- **Imágenes**: Componente `ProductImage` inteligente que exige `alt` o genera fallbacks automáticos basados en metadatos del producto.
- **QA Automatizado**: Integración de `eslint-plugin-jsx-a11y` y diagnósticos en consola con **Axe Core** en entorno de desarrollo.

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
- **Husky**: Pre-commit hooks con `lint-staged` para linting (`eslint --fix`) y tests locales.
- **Generación de Tipos**: Script `npm run update-types` para sincronizar tipos TypeScript desde el esquema de Supabase (`supabase gen types`).

## 🏗️ Arquitectura Feature-Based

El proyecto ha sido migrado a una arquitectura modular basada en **features**, donde cada dominio de negocio es un módulo autocontenido:

```text
src/features/
├── auth/         # Autenticación (login, registro, sesión)
├── product/      # Catálogo, servicios de artistas, búsqueda
├── cart/         # Carrito de compras (store Zustand)
└── checkout/     # Flujo de pago y órdenes
```

- **Public API (`index.ts`)**: Cada feature exporta únicamente lo necesario a través de su `index.ts`, ocultando la implementación interna.
- **Boundary Enforcement**: Regla ESLint `no-restricted-imports` con patrón `@/features/*/*` que prohíbe importaciones profundas entre features.
- **Alias de Ruta**: `@/features/*`, `@/ui/*`, `@/lib/*` configurados en `tsconfig.json` para imports limpios.

## 🔗 Middleware Pipeline (Chain Pattern)

El middleware de Next.js ha sido refactorizado en una **cadena composable** de responsabilidades:

```text
Request → withSecurityHeaders → withRateLimit → withAuth → withI18n → Response
```

| Middleware | Responsabilidad |
|---|---|
| `withSecurityHeaders` | CSP, HSTS, X-Frame-Options |
| `withRateLimit` | Límite de peticiones por IP |
| `withAuth` | Validación de sesión Supabase y protección de rutas |
| `withI18n` | Detección de locale, cookie `NEXT_LOCALE`, reescritura de rutas |

- **Matcher**: `/((?!api|_next|_vercel|.*\\..*).*)` — Excluye API, assets estáticos y archivos internos de Next.js.
- **Utilidad `chain.ts`**: Implementa el patrón Stack Handler con tipo `CustomMiddleware` para encadenar middlewares de forma declarativa.

## 🔒 Sistema de Tipos Estricto

Tipado end-to-end desde la base de datos hasta la UI:

- **Tipos de Dominio** (`src/types/domain.ts`): `Product`, `OrderItem`, `User`, `Order` con status y métodos de pago tipados.
- **Enums con `as const`** (`src/types/enums.ts`): `OrderStatus` y `PaymentMethod` para tree-shaking óptimo.
- **`ActionResponse<T>`** (`src/types/api.ts`): Tipo discriminado (union) para respuestas consistentes de Server Actions.
- **Tipos de UI** (`src/types/ui.ts`): `ProductListProps`, `ClassNameProps`, `ChildrenProps` centralizados.
- **Validación Isomórfica**: Esquemas Zod (`src/schemas/auth.ts`) compartidos entre cliente (`react-hook-form` + `zodResolver`) y servidor (Server Actions con `safeParse`).
- **Error Map Global**: `src/lib/zod-error-map.ts` con traducción automática de errores de validación.

## 🤖 DevOps & Automatización GitHub

- **Dependabot** (`.github/dependabot.yml`): Actualización semanal de `npm` (lunes 09:00) y mensual de `github-actions`. Límite de 10 PRs abiertos.
- **Auto-Merge** (`.github/workflows/dependabot-automerge.yml`): Merge automático de PRs de Dependabot para actualizaciones patch/minor que pasen CI.
- **CodeQL** (`.github/workflows/codeql.yml`): Análisis estático de seguridad en push, PR y cron semanal.
- **Secret Scanning & Push Protection**: Activado en el repositorio para bloquear pushes con secretos expuestos.


## 📂 Estructura del Proyecto

```text
src/
├── app/              # Rutas, Layouts e Internacionalización (next-intl)
├── components/       # UI Atómica y Organismos complejos
├── content/          # Contenido estático en Markdown (terms, privacy)
├── context/          # Estado global (Zustand) y Lógica de Negocio
├── features/         # Módulos de dominio (auth, product, cart, checkout)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.ts  # Public API
├── lib/              # Supabase clients, utilidades y helpers
├── middlewares/      # Middleware chain (Security, Auth, i18n, RateLimit)
├── schemas/          # Esquemas Zod (validación isomórfica)
├── types/            # Tipos de dominio, API, UI y enums
├── middleware.ts     # Punto de entrada del middleware pipeline
└── scripts/          # Herramientas de IA y mantenimiento
```

## 🛠️ Instalación y Desarrollo

1. **Dependencias**: `npm install`
2. **Entorno**: Configurar `.env.local` con claves de Supabase y Stripe.
3. **Desarrollo**: `npm run dev`
4. **Pruebas**: `npm test` o `npm run test:coverage` para ver el reporte detallado.

---
## 📄 Licencia
Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE).
