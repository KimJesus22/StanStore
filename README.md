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

## 🔐 Hardening de Seguridad (Ronda 2)

Correcciones aplicadas tras auditoría de código:

### Políticas RLS en `fix_all_rls.sql`
- **Problema**: El script de emergencia contenía `UPDATE public.profiles SET is_admin = true` (promovía a todos los usuarios a administrador) y políticas INSERT `TO public` en `orders` y `audit_logs` (cualquier cliente podía insertar órdenes o logs directamente).
- **Solución**: Eliminada la línea de promoción masiva; políticas INSERT de `orders` y `audit_logs` cambiadas de `TO public` a `TO service_role`. El script ahora incluye advertencia explícita de no ejecutar en producción sin revisión.

### Tipado estricto en AdminDashboard
- **Problema**: `salesData` y `categoryData` tenían tipo `any[]`, anulando las garantías de TypeScript. El `reduce` de categorías accedía a `.total` (campo inexistente en `CategoryData`) produciendo siempre `totalOrders = 0`.
- **Solución**: Añadidas interfaces `SalesData { date: string; total: number }` y `CategoryData { category: string; count: number }`. Corregido el `reduce` para usar `.count`. Eliminados los comentarios `eslint-disable`.

### Sanitización de mensajes de error en Server Actions
- **Problema**: `createProduct`, `updateProduct` y `deleteProduct` concatenaban `error.message` de Supabase directamente en la respuesta al cliente, filtrando posibles detalles internos (nombres de tablas, constraints).
- **Solución**: Los mensajes al cliente son ahora genéricos (`'Error al guardar el producto. Inténtalo de nuevo.'`). El `error.message` real se preserva únicamente en `console.error` y `logAuditAction` para trazabilidad servidor.

### Fail-fast en clientes Supabase
- **Problema**: `supabaseClient.ts` usaba `|| 'placeholder-key'` y `|| 'https://placeholder.supabase.co'` como fallback, permitiendo que la app arrancara silenciosamente con credenciales inválidas. `client.ts` y `server.ts` usaban el operador `!` (solo compilador, sin protección en runtime).
- **Solución**: Los cuatro clientes (`supabaseClient.ts`, `client.ts`, `server.ts`, `admin.ts`) extraen las variables de entorno en constantes y lanzan `throw new Error('FATAL: ...')` inmediatamente si alguna está ausente. `admin.ts` ya tenía este patrón; los demás fueron alineados.

## 🔐 Hardening de Seguridad (Ronda 3)

Correcciones aplicadas tras segunda auditoría de rutas API:

### `POST /api/create-payment-intent` — Autenticación y límites de monto
- **Problema**: Cualquier visitante podía crear PaymentIntents de Stripe sin autenticación, sin tope de monto y con cualquier moneda, permitiendo abusar del saldo de la cuenta.
- **Solución**: Verificación de sesión con `supabase.auth.getUser()` → 401. Validación estricta: `Number.isInteger(amount)`, `MIN_AMOUNT = 100`, `MAX_AMOUNT = 1_000_000`. Lista blanca de monedas `VALID_CURRENCIES = new Set(['mxn', 'usd'])`. UUID regex en `orderId`. `user_id` añadido a `metadata` del PaymentIntent.

### `POST /api/create-preference` — Descuento manipulable desde el cliente
- **Problema**: El campo `discountAmount` llegaba directamente desde el body del cliente sin verificación; un atacante podía aplicar cualquier descuento arbitrario. Sin autenticación y sin validación de ítems.
- **Solución**: Autenticación obligatoria → 401. Reemplazado `discountAmount` (client-supplied) por `promoCodeId` + `usePoints`: el descuento se calcula completamente en el servidor mediante `stripe.promotionCodes.retrieve()` y consulta a `users.loyalty_points`. Agregados `VALID_LOCALES`, `MAX_ITEMS = 50`, `MAX_QUANTITY = 99` y UUID regex por ítem. Se reemplazó el cliente browser de Supabase por `createClient()` de `@/lib/supabase/server`.

### `POST /api/csp-reports` — Inyección de logs
- **Problema**: El endpoint registraba el cuerpo crudo del reporte sin sanitizar, permitiendo inyección de caracteres de control/saltos de línea en los logs del servidor. Sin límite de tamaño de payload.
- **Solución**: Límite `MAX_BODY_BYTES = 8 192`. Lista blanca `CSP_FIELDS` con los 11 campos estándar de CSP. Función `sanitize()` que elimina caracteres de control `\x00-\x1f\x7f` y trunca a 500 caracteres por campo. El log solo incluye campos conocidos y saneados.

### `GET /api/doc` — Spec OpenAPI sin autenticación
- **Problema**: El handler devolvía la especificación OpenAPI completa (endpoints, esquemas, parámetros) a cualquier visitante sin ningún control de acceso.
- **Solución**: Agregado `requireAdmin()` antes de servir el spec; devuelve 401/403 según el motivo del rechazo.

### Helper compartido `requireAdmin()`
- **Creado** `src/lib/supabase/requireAdmin.ts`: verifica sesión, dominio de email (`NEXT_PUBLIC_ADMIN_DOMAIN`) y `profiles.is_admin` en ese orden. Patrón fail-closed — cualquier error de BD niega el acceso. Reutilizado en `GET /api/doc` y `GET /api/docs`, eliminando lógica duplicada.

### `GET /api/products/similar` — Service role key y validación de parámetros
- **Problema**: El handler instanciaba `createClient` de `@supabase/supabase-js` directamente con `SUPABASE_SERVICE_ROLE_KEY`, bypassando todas las políticas RLS. El parámetro `limit` usaba `parseInt` sin verificar `NaN` (podía devolver todas las filas). `productId` sin validación UUID.
- **Solución**: Reemplazado por `createClient` compartido de `@/lib/supabase/server` (usa `anon key` + RLS). UUID regex en `productId` → 400. Límite seguro: `Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 10) : 4`.

### `GET /api/rewards/download` — Cliente Supabase inline con `!` non-null
- **Problema**: El handler instanciaba `createServerClient` de `@supabase/ssr` directamente usando `NEXT_PUBLIC_SUPABASE_URL!` y `NEXT_PUBLIC_SUPABASE_ANON_KEY!` (operadores `!` sin protección en runtime). Sin validación UUID en el parámetro `id`.
- **Solución**: Reemplazado por `createClient` de `@/lib/supabase/server` (centraliza cookies y fail-fast de env vars). UUID regex en `rewardId` → 400 si inválido o ausente. El uso de `createAdminClient()` para generar signed URLs permanece correcto (requiere service role, y la auth se verifica primero con anon client).

---
## 📄 Licencia
Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE).
