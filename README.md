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
- **`ExpressPaymentButton`**: Integrado en `CheckoutForm`, justo encima del botón principal. Usa `stripe.paymentRequest()` + `canMakePayment()` para mostrar el botón solo si el dispositivo tiene un wallet configurado (Google Pay en Android/Chrome, Apple Pay en Safari/iOS). Invisible en PC sin wallets registradas.
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

- **ISR (Incremental Static Regeneration)**: Todas las páginas de producto (`/[locale]/product/[id]`) se pre-generan en build con `generateStaticParams` (~63 páginas × 3 locales) y se revalidan cada hora (`revalidate = 3600`). Nuevos productos se renderizan on-demand gracias a `dynamicParams = true`. Las páginas expiradas son regeneradas en background sin bloquear al usuario (`stale-while-revalidate`).
- **Home sin fetch del cliente**: El servidor pre-carga todos los productos con `getProducts()` (cacheada 1h via `unstable_cache`) y los pasa como `initialProducts` a `HomeContent`. Los filtros se aplican en memoria en el cliente — **cero peticiones a Supabase desde el navegador** en la carga inicial, eliminando el spinner de LCP.
- **Cache-Control en rutas API públicas**: `GET /api/artists` y `GET /api/products/similar` incluyen `s-maxage=3600, stale-while-revalidate=86400` para ser cacheadas por el CDN de Vercel entre peticiones.
- **Invalidación por evento**: Los webhooks de Stripe y las Server Actions de admin llaman `revalidateTag('products')` para invalidar el caché inmediatamente al actualizar stock o crear un producto nuevo.
- **Charts sin dependencias**: `SalesChart` y `CategoryChart` del admin implementados con SVG puro (eliminando `recharts` ~400 KB del chunk de admin). Soportan tema claro/oscuro y tooltip nativo en cada punto.
- **jsPDF lazy**: `generateContractPDF` usa `import('jspdf')` dinámico — la librería (~500 KB) se descarga solo cuando el usuario hace clic en "Descargar contrato", no al cargar `/success`.
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
- **Navegación por Teclado**: Componente **Enlace de Salto** para saltar al contenido y anillos de foco de alto contraste (`:focus-visible`) globales. Todos los inputs, selects y botones exponen indicador de foco visible; se eliminaron overrides `outline: none` sin reemplazo (`HeaderSearch`, `CurrencySelector`, `SortSelector`).
- **Formularios Accesibles**: Todos los campos de `CheckoutForm` y del panel de administración tienen `<label htmlFor>` asociado al `id` del input correspondiente. Los mensajes de error usan `role="alert"` via `styled.span.attrs({ role: 'alert' })`. Iconos decorativos llevan `aria-hidden="true"`.
- **Controles Interactivos**: Opciones de envío implementadas con patrón ARIA radio (`role="radiogroup"` + `role="radio"` + `aria-checked` + navegación por teclado Enter/Space). Botones con estado usan `aria-pressed`. Botones de acción tienen `aria-label` descriptivo con el nombre específico del recurso.
- **Contraste de Color**: Paleta auditada — todos los pares pasan WCAG AA. Los más ajustados: `#D13639` sobre blanco ~4.9:1 (light), `#EF5350` sobre `#121212` ~5.4:1 (dark). Variables `textMuted` ajustadas para ambos modos.
- **Imágenes**: Componente `ProductImage` inteligente que exige `alt` o genera fallbacks automáticos basados en metadatos del producto (`"{nombre} - {categoría} merchandise"`).
- **QA Automatizado**: Integración de `eslint-plugin-jsx-a11y` y diagnósticos en consola con **Axe Core** en entorno de desarrollo.

## 🛡️ Ingeniería de Seguridad (Fortalecimiento del Sistema)

1. **Audit Logs Inmutables**: Registro detallado de acciones críticas incluyendo latencia y metadatos.
2. **Cifrado de Alta Seguridad**: Implementación de AES-256-CBC con **rotación de claves** y versionado de secretos.
3. **Validación de Integraciones**: El endpoint de Stripe valida que la versión del evento coincida con la configuración de la app (`STRIPE_API_VERSION`), alertando sobre discrepancias.
4. **Protección de Secretos**: Tests automatizados (`env.security.test.ts`) que bloquean el build si se detectan fugas de claves administrativas (`SERVICE_ROLE_KEY`) hacia el cliente.
5. **Validación Backend en Acciones de Admin**: Las Server Actions (`createProduct`, `updateProduct`, `deleteProduct`) incluyen verificación de sesión y rol admin en servidor (`verifyAdmin()`) mediante cookie Supabase SSR — independiente del `AdminGuard` del cliente. `ProductSchema` (Zod) reforzado: `category` restringido a enum `['albums','merch','photocards','clothing']`, `price` con límite superior `999999.99` y `.finite()`, campos de texto con `.trim()` y longitudes máximas. El cliente admin usa `createAdminClient()` que lanza excepción si `SERVICE_ROLE_KEY` está ausente (sin fallback a anon key).

### Modelo de Seguridad Supabase (RLS)

- **RLS habilitado en las 14 tablas** públicas. La clave `anon` solo puede leer datos públicos (productos, artistas, reseñas) o insertar en tablas con política explícita.
- **`orders` INSERT restringido a `service_role`**: Las órdenes solo se crean desde Server Actions; se eliminó la política `TO public` para evitar inserciones anónimas directas.
- **`group_orders` con política de creador**: El organizador (`organizer_id = auth.uid()`) puede crear y editar sus propios GOs directamente. El borrado permanece exclusivo de `service_role` para proteger GOs con participantes pagados.
- **`user_rewards` y `group_order_participants`**: Solo el propietario puede leer su propia fila; escritura via `service_role` para garantizar integridad de pagos y puntos.
- **`audit_logs`**: Inserción pública (vía `SECURITY DEFINER`), lectura solo para admins.
- **Admin (`lib/supabase/admin.ts`)**: Usa `SERVICE_ROLE_KEY`. Omite RLS — exclusivo de Server Actions en entorno servidor.

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

## 🔧 Correcciones de Bugs Críticos

### Crash de Checkout (Stripe `Elements` Context)
- **Problema**: La página `/checkout` crasheaba con `"Could not find Elements context"` porque `ExpressPaymentButton` llamaba a `useStripe()` antes de que el `clientSecret` estuviera disponible, renderizándose fuera del wrapper `<Elements>`.
- **Solución**: `StripeElementsProvider` ahora **siempre** envuelve a los hijos en `<Elements>`. Cuando no hay `clientSecret`, usa `mode: 'payment'` como fallback. Se añadió `key={clientSecret ?? 'loading'}` para forzar un remount limpio al recibir el `clientSecret`, evitando corrupción del contexto Stripe.
- **`ExpressPaymentButton`**: Añadido guard `isLoading` desde el contexto para evitar inicializar `paymentRequest` prematuramente.

### Páginas de Redirección Post-Pago (`/success` y `/cancel`)
- **Problema**: Stripe redirigía a `/{locale}/success` (404) y a `/{locale}/` al cancelar (sin feedback). MercadoPago enviaba fallos y pagos pendientes a `/checkout`.
- **Solución**: Creada página `/cancel` con mensaje contextual (`?reason=failed` diferencia pago rechazado de cancelación voluntaria) y dos CTAs. Página `/success` corregida: `Link` de `next/link` → `@/navigation` (locale-aware). `cancel_url` de Stripe apunta a `/{locale}/cancel`; `failure` de MercadoPago a `/{locale}/cancel?reason=failed`; `pending` a `/{locale}/success`. Ruta `/cancel` registrada en `navigation.ts`.

### Dropdown de Búsqueda Persistente
- **Problema**: Al buscar y navegar a la página de resultados, el dropdown de sugerencias permanecía visible superpuesto sobre los resultados.
- **Solución**: Se limpian los arrays `suggestions[]` y `products[]` tanto al navegar vía `debouncedQuery` como al seleccionar una sugerencia en `handleSuggestionSelect`.

### Claves de Traducción Faltantes (`MISSING_MESSAGE`)
- **Problema**: El namespace `Validations` (con "s") no contenía las claves `acceptTerms` ni `phoneMin`, usadas por el schema Zod del checkout. Existían solo en el namespace `Validation` (sin "s").
- **Solución**: Añadidas las claves faltantes al namespace `Validations` en los 4 locales (`es`, `en`, `fr-CA`, `pt-BR`).

## 🌍 Corrección de Uniformidad de Rutas (i18n)

Con `localePrefix: 'always'`, todas las rutas deben incluir prefijo de locale. Se identificaron y corrigieron componentes que usaban `useRouter` de `next/navigation` en lugar de `@/navigation`, lo que provocaba redirecciones sin prefijo (p. ej. `/` en vez de `/es/`):

- **`useAdmin.tsx` (`AdminGuard`)**: `router.push('/')` al detectar no-admin ahora usa `useRouter` de `@/navigation`.
- **`profile/page.tsx`**: `router.push('/')` en logout y redirección por sesión inválida ahora preserva el locale del usuario.

Componentes correctos que no requirieron cambio: `HeaderNav`, `HeaderSearch` (ya importaban de `@/navigation`); `useProductFilters` (usa `usePathname` de `next/navigation` que devuelve el path con locale ya embebido, correcto para actualizar query params en la misma página).

## 📊 Gestión de Estados Vacíos (Admin Dashboard)

Mejora de la percepción de la aplicación cuando no hay datos de ventas:

- **KPI Cards**: Muestran `—` con texto explicativo ("Sin pedidos registrados aún") cuando `totalRevenue === 0` o `totalOrders === 0`, en lugar de mostrar `$0.00` o conteos confusos.
- **`SalesChart`**: Condición mejorada `data.length === 0 || data.every(d => d.total === 0)` con icono `TrendingUp` semitransparente, mensaje principal y hint contextual.
- **`CategoryChart`**: Condición mejorada `data.length === 0 || totalCount === 0` que cubre el caso donde la RPC devuelve categorías con `count: 0` (antes mostraba solo la leyenda sin gráfico ni mensaje).

---
## 📄 Licencia
Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE).
