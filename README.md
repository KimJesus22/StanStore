# StanStore 🎵 | E-commerce Seguro, Moderno y Potenciado con IA

![Estado del Despliegue](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)
![Licencia](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Vitest](https://img.shields.io/badge/Coverage-86%25-brightgreen?style=for-the-badge&logo=vitest)

**StanStore** es una plataforma de comercio electrónico de vanguardia para mercancía exclusiva. Diseñada con un enfoque de **defensa en profundidad**, combina una arquitectura de micro-interacciones fluida con rigurosos estándares de ciberseguridad y capacidades modernas de Inteligencia Artificial.

## 🚀 Tecnologías

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) - Rendimiento extremo con Server Actions, SSR e **ISR**.
-   **Internacionalización**: [next-intl](https://next-intl-docs.vercel.app/) - Soporte nativo para ES, EN, KO con rutas localizadas y formateo dinámico.
-   **IA & Búsqueda**: [@xenova/transformers](https://huggingface.co/docs/transformers.js) - Generación de embeddings locales (384D) con **pgvector** e índices HNSW.
-   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL) - Gestión de datos con RLS y búsqueda vectorial.
-   **Pagos**: [Stripe](https://stripe.com/) - Procesamiento con validación estricta de versiones de API en webhooks. Soporta **Google Pay**, **Apple Pay** y tarjetas mediante Payment Intents + `@stripe/react-stripe-js`.
-   **Estilos & UI**: Styled Components + [Framer Motion](https://www.framer.com/motion/).
-   **Calidad & A11y**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) y [Axe Core](https://www.deque.com/axe/) para auditorías de accesibilidad.

## 🧠 Inteligencia Artificial (Búsqueda Semántica)

A diferencia de las búsquedas tradicionales por texto exacto, StanStore utiliza **Embeddings**:
- **Tecnología**: Módulos locales `transformers.js` (Xenova/all-MiniLM-L6-v2) - **Costo $0**.
- **Infraestructura**: Almacenamiento en columnas `vector(384)` con índices **HNSW** para búsquedas de alta velocidad.
- **Mantenimiento**: Scripts incrementales en `scripts/generate-embeddings.ts` que procesan únicamente productos nuevos o editados mediante batch upserts.

## 🛒 Checkout & Gamificación (Nuevas Características)

### Pagos Express (Google Pay / Apple Pay)
Integración nativa de wallets digitales sin redireccionamiento:
- **`StripeElementsProvider`**: Crea un `PaymentIntent` al cargar el checkout y provee el `clientSecret` a hijos vía React Context, envolviendo con `<Elements>` de Stripe.
- **`ExpressPaymentButton`**: Usa `stripe.paymentRequest()` + `canMakePayment()` para mostrar el botón solo si el dispositivo tiene un wallet configurado (Google Pay en Android/Chrome, Apple Pay en Safari/iOS). Invisible en PC sin wallets registradas.
- **Confirmación segura**: Maneja 3D Secure con doble llamada a `confirmCardPayment()` (`handleActions: false` → acción adicional si `requires_action`).
- **Webhook `payment_intent.succeeded`**: Actualiza `orders.status = 'paid'` en Supabase usando el `order_id` almacenado en los `metadata` del PaymentIntent. Devuelve 500 si falla para activar el reintento automático de Stripe.

### Refactorización del Checkout
- **Validación Robusta**: Implementación de `react-hook-form` con esquemas **Zod** para validación en tiempo real y feedback inmediato.
- **Cumplimiento Legal**: Checkbox obligatorio para aceptación de Términos y Política de Reembolso, con alerta visual de puntos clave (`TermsSummaryAlert`) sobre envíos internacionales.
- **Optimización de Renderizado**: Carga dinámica (`lazy loading`) del formulario de checkout para reducir el Time-to-Interactive (TTI).

### Gamificación y Social Sharing
Potenciando la retención y el alcance orgánico en la página de éxito (`/success`):
1. **Cupón de Recompensa**: Componente `NextPurchaseCoupon` que incentiva la recompra inmediata con un código de descuento (`STANFAN5`).
2. **Difusión Social**: Componente `ShareToUnlock` con integración nativa para:
    - **X (Twitter)**: Intentos de tweet precargados.
    - **WhatsApp**: Mensajes directos pre-rellenados.
    - **Clipboard**: Copiado rápido del enlace de la tienda.

## ⚡ Rendimiento y Experiencia de Usuario (Optimización LCP/CLS)

- **ISR (Incremental Static Regeneration)**: Las páginas de catálogo y productos populares se pre-renderizan cada hora (`revalidate = 3600`), asegurando carga instantánea y SEO óptimo.
- **Priorización de Carga**: Uso de `priority={true}` en imágenes LCP y `sizes` dinámicos.
- **Componentes Diferidos**: Carga bajo demanda de reproductores externos (Spotify, YouTube).

## 🌍 Internacionalización (i18n)

Implementada con un enfoque de tipado seguro y optimizada para SEO:
- **Idiomas Soportados**: 🇪🇸 Español, 🇺🇸 Inglés, 🇰🇷 Coreano.
- **Rutas Localizadas**: Estructura `/[locale]/ruta` con detección automática de preferencia de idioma.
- **Formateo Dinámico**: Uso de `useFormatter` para mostrar monedas (`PriceTag`), fechas y listas gramaticalmente correctas según el locale.
- **Validaciones i18n**: Esquemas de **Zod** dinámicos que inyectan mensajes de error traducidos en tiempo real.
- **Contenido Dinámico (JSONB)**: El servicio `getArtists` localiza campos JSONB (`bio`) con fallback automático a español.
- **Páginas Estáticas en Markdown**: Páginas legales (`/terms`) renderizadas desde archivos `.md` por locale (`terms.es.md`, `terms.en.md`) con `gray-matter` + `remark`. Si el idioma no existe, se carga el español con un aviso visual.
- **Cookie `NEXT_LOCALE`**: Gestionada automáticamente por el middleware `next-intl` para persistir la preferencia de idioma.

## ♿ Accesibilidad (A11y - WCAG 2.1 AA)

Diseñada para ser inclusiva y navegable por todos:
- **Navegación por Teclado**: Componente **Enlace de Salto** para saltar al contenido y anillos de foco de alto contraste (`:focus-visible`) globales.
- **Lectores de Pantalla**: **Anunciador de Rutas** para anunciar cambios de página en navegación SPA y etiquetas ARIA optimizadas.
- **Contraste de Color**: Auditoría de paleta (Ratio 4.5:1) con variables `textMuted` ajustadas para modo claro y oscuro.
- **Imágenes**: Componente `ProductImage` inteligente que exige `alt` o genera fallbacks automáticos basados en metadatos del producto.
- **QA Automatizado**: Integración de `eslint-plugin-jsx-a11y` y diagnósticos en consola con **Axe Core** en entorno de desarrollo.

## 🛡️ Ingeniería de Seguridad (Fortalecimiento del Sistema)

1. **Audit Logs Inmutables**: Registro detallado de acciones críticas incluyendo latencia y metadatos.
2. **Cifrado de Alta Seguridad**: Implementación de AES-256-CBC con **rotación de claves** y versionado de secretos.
3. **Validación de Integraciones**: El endpoint de Stripe valida que la versión del evento coincida con la configuración de la app (`STRIPE_API_VERSION`), alertando sobre discrepancias.
4. **Protección de Secretos**: Tests automatizados (`env.security.test.ts`) que bloquean el build si se detectan fugas de claves administrativas (`SERVICE_ROLE_KEY`) hacia el cliente.

### Modelo de Seguridad Supabase (RLS vs Bypass)

*   **Cliente/Servidor (`lib/supabase/{client,server}.ts`)**: Respetan RLS.
*   **Admin (`lib/supabase/admin.ts`)**: Usa `SERVICE_ROLE_KEY`. Omite RLS.

## 🧪 Estrategia de Calidad & Automatización

- **Unit Testing**: Suite de Vitest optimizada con **Happy-DOM** para mayor compatibilidad de módulos ESM.
- **Integración**: Pruebas de flujo completo con Playwright.
- **Seguridad**: Escaneo de variables de entorno en tiempo de build (`npm run build`).
- **Husky**: Pre-commit hooks con `lint-staged` para linting (`eslint --fix`) y tests locales.
- **Generación de Tipos**: Script `npm run update-types` para sincronizar tipos TypeScript desde el esquema de Supabase (`supabase gen types`).

## 🏗️ Arquitectura Basada en Módulos

El proyecto ha sido migrado a una arquitectura modular basada en **módulos de dominio**, donde cada dominio de negocio es un módulo autocontenido:

```text
src/features/
├── auth/         # Autenticación (login, registro, sesión)
├── product/      # Catálogo, servicios de artistas, búsqueda
├── cart/         # Carrito de compras (store Zustand)
├── checkout/     # Flujo de pago y órdenes (Zod schemas, validations)
└── components/
    └── gamification/ # ShareToUnlock, NextPurchaseCoupon
```

- **API Pública (`index.ts`)**: Cada módulo exporta únicamente lo necesario a través de su `index.ts`, ocultando la implementación interna.
- **Aplicación de Límites**: Regla ESLint `no-restricted-imports` con patrón `@/features/*/*` que prohíbe importaciones profundas entre módulos.
- **Alias de Ruta**: `@/features/*`, `@/ui/*`, `@/lib/*` configurados en `tsconfig.json` para imports limpios.

## 🔗 Cadena de Middlewares (Patrón Cadena)

El middleware de Next.js ha sido refactorizado en una **cadena componible** de responsabilidades:

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
- **Utilidad `chain.ts`**: Implementa el patrón de manejador en pila con tipo `CustomMiddleware` para encadenar middlewares de forma declarativa.

## 🔒 Sistema de Tipos Estricto

Tipado extremo a extremo desde la base de datos hasta la interfaz:

- **Tipos de Dominio** (`src/types/domain.ts`): `Product`, `OrderItem`, `User`, `Order` con status y métodos de pago tipados.
- **Enums con `as const`** (`src/types/enums.ts`): `OrderStatus` y `PaymentMethod` para eliminación óptima de código muerto.
- **`ActionResponse<T>`** (`src/types/api.ts`): Tipo discriminado (unión) para respuestas consistentes de Server Actions.
- **Tipos de UI** (`src/types/ui.ts`): `ProductListProps`, `ClassNameProps`, `ChildrenProps` centralizados.
- **Validación Isomórfica**: Esquemas Zod (`src/schemas/auth.ts`) compartidos entre cliente (`react-hook-form` + `zodResolver`) y servidor (Server Actions con `safeParse`).
- **Mapa de Errores Global**: `src/lib/zod-error-map.ts` con traducción automática de errores de validación.

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
│       └── index.ts  # API Pública
├── lib/              # Supabase clients, utilidades y helpers
├── middlewares/      # Cadena de middlewares (Seguridad, Auth, i18n, Límite de tasa)
├── schemas/          # Esquemas Zod (validación isomórfica)
├── types/            # Tipos de dominio, API, UI y enums
├── middleware.ts     # Punto de entrada de la cadena de middlewares
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
