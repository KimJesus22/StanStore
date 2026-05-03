<p align="center">
  <img src="https://img.shields.io/badge/Group_Order_Manager-Plataforma_E--commerce-8B5CF6?style=for-the-badge&labelColor=1a1a2e" alt="Group Order Manager" />
</p>

<h1 align="center">Group Order Manager</h1>
<p align="center">
  <strong>Plataforma E-commerce de Alto Tráfico para Pedidos Grupales Internacionales</strong>
</p>

<p align="center">
  <a href="#descripción-general">Descripción General</a> •
  <a href="#stack-tecnológico">Stack Tecnológico</a> •
  <a href="#características-clave">Características Clave</a> •
  <a href="#architecture--system-design">System Design</a> •
  <a href="#arquitectura-del-proyecto">Arquitectura</a> •
  <a href="#getting-started-local-development">Getting Started</a> •
  <a href="#licencia">Licencia</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/deploy-vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Desplegado en Vercel" />
  <img src="https://img.shields.io/badge/licencia-MIT-22c55e?style=flat-square" alt="Licencia MIT" />
  <img src="https://img.shields.io/badge/cobertura-86%25-34d399?style=flat-square&logo=vitest&logoColor=white" alt="Cobertura de Tests 86%" />
  <img src="https://img.shields.io/badge/i18n-4_idiomas-f59e0b?style=flat-square" alt="4 Idiomas" />
  <img src="https://img.shields.io/badge/a11y-WCAG_2.1_AA-3b82f6?style=flat-square" alt="WCAG 2.1 AA" />
</p>

---

## Descripción General

**Group Order Manager** es una plataforma de e-commerce de grado producción, diseñada específicamente para organizar y gestionar **pedidos grupales internacionales** de mercancía exclusiva — construida para soportar los picos extremos de tráfico y la complejidad logística de los lanzamientos de mercancía K-pop / BTS, donde miles de fans convergen simultáneamente para realizar pedidos.

La plataforma resuelve un problema real: cuando un organizador grupal recopila pedidos de decenas (o cientos) de participantes en diferentes países, necesita gestionar **envío internacional prorrateado**, pagos divididos, reserva de inventario bajo alta concurrencia y checkout multi-moneda — todo manteniendo la experiencia rápida, accesible y localizada.

### ¿Qué hace único a este proyecto?

- **Diseño concurrencia-primero** — ISR con stale-while-revalidate, caché a nivel CDN y validación de inventario en servidor garantizan comportamiento consistente bajo ráfagas simultáneas de pedidos.
- **Orquestación de pagos complejos** — Stripe Payment Intents con Google Pay / Apple Pay, manejo de 3D Secure, cálculo de envío prorrateado por participante y MercadoPago para mercados LATAM.
- **Seguridad en profundidad** — 5 rondas de auditoría de hardening, Row Level Security en las 14 tablas, cifrado AES-256-CBC con rotación de claves y prevención automatizada de fugas de secretos en CI.
- **Búsqueda semántica con IA** — Embeddings locales con transformers (costo $0) e índices HNSW con pgvector para descubrimiento de productos basado en significado.

---

## Stack Tecnológico

<table>
  <thead>
    <tr>
      <th align="center">Capa</th>
      <th align="center">Tecnología</th>
      <th align="center">Propósito</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" /></td>
      <td><strong>Next.js 16</strong> (App Router)</td>
      <td>Server Components, Server Actions, ISR, streaming SSR</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></td>
      <td><strong>TypeScript 5</strong></td>
      <td>Tipado extremo a extremo desde el esquema de BD hasta los props de UI</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></td>
      <td><strong>Supabase</strong> (PostgreSQL)</td>
      <td>Auth, RLS, pgvector, suscripciones en tiempo real</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Stripe-Pagos-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" /></td>
      <td><strong>Stripe</strong></td>
      <td>Payment Intents, webhooks, Google Pay / Apple Pay</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Styled_Components-6-DB7093?style=for-the-badge&logo=styled-components&logoColor=white" alt="Styled Components" /></td>
      <td><strong>Styled Components 6</strong></td>
      <td>Tematización SSR-compatible con soporte de modo claro/oscuro</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></td>
      <td><strong>Framer Motion</strong></td>
      <td>Transiciones de página, micro-animaciones, manejo de gestos</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/next--intl-4-f97316?style=for-the-badge" alt="next-intl" /></td>
      <td><strong>next-intl</strong></td>
      <td>i18n con rutas localizadas, formateadores y mensajes Zod traducidos</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" /></td>
      <td><strong>Vitest</strong> + <strong>Playwright</strong></td>
      <td>Tests unitarios, de integración y E2E (86% de cobertura)</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Sentry-10-362D59?style=for-the-badge&logo=sentry&logoColor=white" alt="Sentry" /></td>
      <td><strong>Sentry</strong></td>
      <td>Monitoreo de errores, trazado de rendimiento, source maps</td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Zod-4-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" /></td>
      <td><strong>Zod</strong></td>
      <td>Validación isomórfica compartida entre cliente y servidor</td>
    </tr>
  </tbody>
</table>

**También utiliza:** React 19 · Zustand · React Query · Husky + lint-staged · Serwist (PWA) · jsPDF · Resend (email transaccional) · Docker

---

## Características Clave

### 🔒 Seguridad a Nivel de Base de Datos (Row Level Security)

RLS está habilitado en **las 14 tablas públicas**. Las inserciones de órdenes están restringidas a `service_role` (solo Server Actions), los pedidos grupales aplican políticas basadas en el creador, y `audit_logs` usa `SECURITY DEFINER` para inserciones públicas con lectura exclusiva para administradores. Las Server Actions realizan verificaciones `verifyAdmin()` independientes — nunca dependen únicamente de guards del lado del cliente. Cinco rondas de auditoría de seguridad han fortalecido cada ruta API, Server Action e inicialización de cliente Supabase con patrones fail-fast y mensajes de error sanitizados.

### 🌍 Internacionalización Completa (next-intl)

Cuatro idiomas — 🇪🇸 Español, 🇺🇸 Inglés, 🇰🇷 Coreano, 🇧🇷 Portugués — con enrutamiento localizado (`/[locale]/...`), formateo dinámico de monedas y fechas vía `useFormatter`, esquemas de validación Zod que inyectan mensajes de error traducidos en tiempo real, y localización de contenido basada en JSONB con fallbacks automáticos. Las páginas legales se renderizan desde archivos Markdown por idioma con `gray-matter` + `remark`.

### ⚡ Optimizaciones de Rendimiento (ISR + Edge Caching)

Todas las páginas de producto (~63 × 4 idiomas) se generan estáticamente en build con `generateStaticParams` y se revalidan cada hora mediante ISR. La página principal ejecuta **cero fetches del lado del cliente** — los productos se cachean en servidor con `unstable_cache` y se filtran en memoria. Las rutas API públicas incluyen headers `s-maxage` + `stale-while-revalidate` para caché CDN en Vercel Edge, y los webhooks de Stripe disparan invalidación instantánea con `revalidateTag`. Los gráficos del admin usan SVG puro (eliminando ~400 KB de librerías de gráficos), y dependencias pesadas como jsPDF se importan dinámicamente bajo demanda del usuario.

### 🧠 Búsqueda Semántica con IA (Costo: $0)

El descubrimiento de productos funciona con embeddings locales de transformers (`transformers.js` / `all-MiniLM-L6-v2`) almacenados en columnas PostgreSQL `vector(384)` con **índices HNSW** vía pgvector. La generación incremental de embeddings procesa únicamente productos nuevos o modificados. Esto ofrece búsqueda basada en significado sin costo de API externa ni latencia adicional — el modelo corre completamente dentro del runtime de Node.js.

---

## Architecture & System Design

### Control de Acceso Basado en Roles (RBAC via RLS)

El sistema implementa un modelo RBAC declarativo directamente en PostgreSQL mediante las **políticas de Row Level Security (RLS)** de Supabase, eliminando la dependencia de lógica de autorización en el código de la aplicación. Esto garantiza que incluso si un atacante logra bypassar la capa de aplicación (Server Actions), la base de datos misma rechaza las operaciones no autorizadas.

Se definen **tres roles funcionales** con privilegios estrictamente separados:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    MODELO RBAC (Supabase RLS)                       │
├──────────────────┬──────────────────────────────────────────────────┤
│ Rol              │ Privilegios                                      │
├──────────────────┼──────────────────────────────────────────────────┤
│ Visitante (anon) │ SELECT en products, artists, group_orders        │
│                  │ Sin INSERT/UPDATE/DELETE en ninguna tabla         │
├──────────────────┼──────────────────────────────────────────────────┤
│ Participante     │ SELECT en su propia fila (group_order_            │
│ (authenticated)  │   participants WHERE auth.uid() = user_id)       │
│                  │ INSERT su propia fila al unirse a un GO           │
│                  │ Sin UPDATE/DELETE (protege pagos procesados)      │
├──────────────────┼──────────────────────────────────────────────────┤
│ Manager/Admin    │ CRUD completo en products (vía is_admin check)   │
│ (authenticated + │ Lectura de audit_logs y blocked_ips              │
│  profiles.       │ Ejecución de Server Actions protegidas           │
│  is_admin=true)  │   con requireAdmin() + verifyAdmin()            │
├──────────────────┼──────────────────────────────────────────────────┤
│ service_role     │ Bypass total de RLS — exclusivo del backend      │
│ (backend only)   │ INSERT en orders, audit_logs (Server Actions)    │
│                  │ ALL en group_orders, group_order_participants     │
└──────────────────┴──────────────────────────────────────────────────┘
```

**Decisiones de diseño clave:**

- **`orders` INSERT solo `service_role`**: Las órdenes se crean exclusivamente desde Server Actions con `createAdminClient()`. Se eliminó la política `TO public` que permitía inserciones anónimas directas — un participante no puede fabricar una orden sin pasar por la verificación de Stripe/MercadoPago.
- **`group_order_participants` sin UPDATE/DELETE para el usuario**: Un participante puede unirse (INSERT su fila), pero no puede modificar ni borrar su participación una vez que hay pagos procesados. Solo el backend (`service_role`) puede actualizar el estado de pagos, protegiendo la integridad financiera.
- **Verificación de admin en dos capas**: Las Server Actions (`createProduct`, `deleteProduct`, `generateShippingInvoices`) verifican el rol admin en servidor con `requireAdmin()` (sesión + dominio de email + `profiles.is_admin`) — independiente del `AdminGuard` del cliente. Patrón **fail-closed**: cualquier error de BD niega el acceso.

### Data Flow & Concurrency

#### Prevención de Race Conditions en Inventario

Durante un pico de ventas (ej. lanzamiento de photocard set limitado), cientos de usuarios pueden intentar comprar el último ítem simultáneamente. Sin protección, esto resulta en **overselling** — vender más unidades de las disponibles en stock.

La solución implementa **bloqueo pesimista a nivel de fila** en PostgreSQL:

```sql
-- supabase/inventory.sql
CREATE OR REPLACE FUNCTION decrement_stock(
    product_id UUID,
    quantity_to_decrement INTEGER
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_stock INTEGER;
  new_stock     INTEGER;
BEGIN
  -- 1. SELECT FOR UPDATE adquiere un row-level lock exclusivo.
  --    Cualquier transacción concurrente que intente leer esta fila
  --    QUEDA BLOQUEADA hasta que esta transacción haga COMMIT o ROLLBACK.
  SELECT stock INTO current_stock
  FROM products WHERE id = product_id
  FOR UPDATE;

  -- 2. Verificación atómica: si el stock no alcanza, RAISE aborta
  --    la transacción completa — no se modifica ningún dato.
  IF current_stock < quantity_to_decrement THEN
    RAISE EXCEPTION 'Insufficient stock: requested %, available %',
                     quantity_to_decrement, current_stock;
  END IF;

  -- 3. Decremento seguro: ejecutado dentro del mismo lock,
  --    garantiza que nadie más modificó el stock entre el SELECT y el UPDATE.
  new_stock := current_stock - quantity_to_decrement;
  UPDATE products SET stock = new_stock WHERE id = product_id;

  RETURN jsonb_build_object('success', true, 'new_stock', new_stock);
END; $$;
```

**¿Por qué `SELECT FOR UPDATE` en lugar de un UPDATE con WHERE condicional?**

Un `UPDATE products SET stock = stock - 1 WHERE stock > 0` *es* atómico, pero no proporciona feedback útil: si no se actualizó ninguna fila, el caller no sabe si fue por stock insuficiente o porque el `product_id` no existe. Con `SELECT FOR UPDATE` + `RAISE EXCEPTION`, el webhook de Stripe recibe un error explícito que se registra en audit logs con `logAuditAction('INVENTORY_SYNC_FAILED', {...})` para trazabilidad operacional.

**Flujo completo durante un pico de ventas:**

```text
Stripe Event: checkout.session.completed
  │
  ├─→ Webhook valida firma + versión de API
  ├─→ Parsea items de metadata (UUID regex + quantity bounds)
  │
  └─→ Para cada item:
        │
        ├─→ supabaseAdmin.rpc('decrement_stock', { product_id, quantity })
        │     │
        │     ├─→ PostgreSQL adquiere row lock (FOR UPDATE)
        │     ├─→ Verifica stock disponible
        │     ├─→ Decrementa atómicamente
        │     └─→ Libera lock → siguiente transacción en cola procede
        │
        └─→ Si error → logAuditAction('INVENTORY_SYNC_FAILED') + continúa con el siguiente item
```

#### Restricciones Adicionales a Nivel de Base de Datos

```sql
-- group_order_participants: constraints que la aplicación no puede violar
items_count    INTEGER NOT NULL DEFAULT 0 CHECK (items_count >= 0),
total_weight   NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_weight >= 0),
UNIQUE (group_order_id, user_id)  -- Un usuario no puede unirse dos veces al mismo GO
```

El constraint `UNIQUE (group_order_id, user_id)` funciona como **última línea de defensa** contra participaciones duplicadas: incluso si la aplicación fallara en validar la unicidad, PostgreSQL rechaza la inserción a nivel de storage engine.

### Estrategia de Idempotencia

Los pagos en e-commerce fallan por red, timeouts, o reintentos automáticos de los procesadores de pago. Sin idempotencia, un webhook que se ejecuta dos veces puede producir **cobros duplicados** o **doble decremento de inventario**.

Se implementan **tres niveles de idempotencia**:

#### 1. Idempotencia en Webhooks de MercadoPago

```typescript
// src/app/api/webhooks/mercadopago/route.ts

// Paso 3: Verificación de idempotencia ANTES de cualquier escritura
const { data: existingOrder } = await supabase
    .from('orders')
    .select('status')
    .eq('mp_payment_id', String(paymentId))
    .maybeSingle();

if (existingOrder?.status === 'PAID') {
    // Webhook duplicado — retornar 200 sin modificar nada
    return new NextResponse('Already processed', { status: 200 });
}

// Paso 5: Upsert con onConflict — operación atómica e idempotente
const { error } = await supabase
    .from('orders')
    .upsert(
        { mp_payment_id: String(paymentId), status: 'PAID', ... },
        { onConflict: 'mp_payment_id', ignoreDuplicates: false }
    );
```

**Doble protección:** primero un SELECT explícito (cortocircuita sin tocar la BD), luego un UPSERT con `onConflict` (el segundo webhook que pase el SELECT no duplica la fila).

#### 2. Idempotencia en Generación de Facturas de Envío

```typescript
// src/app/actions/generateShippingInvoices.ts

// Filtrar participantes que ya tienen payment link (idempotencia)
const pending = rows.filter(r => !r.ems_payment_link_url);
```

Si el organizador ejecuta `generateShippingInvoices()` dos veces (error de red, doble clic), la función **salta automáticamente** a los participantes que ya tienen un `ems_payment_link_url` persistido — no se crean Stripe Products/Prices duplicados.

#### 3. Idempotencia en Webhooks de Stripe

El webhook `payment_intent.succeeded` usa el `order_id` de los metadata del PaymentIntent como clave natural:

```typescript
// src/app/api/webhooks/stripe/route.ts

// UPDATE (no INSERT): solo cambia el status de una orden existente
await supabaseAdmin
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

// Si Stripe reintenta el webhook, el UPDATE es un no-op
// (ya estaba en 'paid' — no hay efecto secundario)
```

**Flujo de reintentos de Stripe:** si el UPDATE falla (error de red a Supabase), el webhook retorna `500` — Stripe reintenta automáticamente hasta 3 días. Cuando el reintento llega y el UPDATE ya se aplicó, es un **no-op seguro**.

---

## Arquitectura del Proyecto

### Arquitectura Modular por Dominio

```text
src/features/
├── auth/         # Autenticación (login, registro, gestión de sesión)
├── product/      # Catálogo, servicios de artistas, búsqueda semántica
├── cart/         # Carrito de compras (store Zustand)
├── checkout/     # Flujo de pago, creación de órdenes (esquemas Zod)
└── components/
    └── gamification/  # ShareToUnlock, NextPurchaseCoupon
```

Cada módulo expone una **API pública** a través de su `index.ts` — las importaciones profundas entre módulos están prohibidas mediante reglas ESLint (`no-restricted-imports`).

### Cadena Componible de Middlewares

```text
Request → Headers de Seguridad → Límite de Tasa → Auth → i18n → Response
```

| Middleware             | Responsabilidad                                       |
|------------------------|-------------------------------------------------------|
| `withSecurityHeaders`  | CSP, HSTS, X-Frame-Options                            |
| `withRateLimit`        | Limitación de peticiones por IP                        |
| `withAuth`             | Validación de sesión Supabase y protección de rutas    |
| `withI18n`             | Detección de locale, persistencia en cookie, reescritura de URL |

### Tipado Seguro Extremo a Extremo

```text
Esquema Supabase → Tipos Generados → Tipos de Dominio → Esquemas Zod → React Hook Form → UI
```

- **Tipos de dominio** (`Product`, `Order`, `User`) con enums de estado tipados vía `as const`
- **`ActionResponse<T>`** unión discriminada para respuestas consistentes de Server Actions
- **Esquemas Zod isomórficos** compartidos entre `zodResolver` (cliente) y `safeParse` (servidor)
- **Mapa de errores global** con traducción automática i18n de mensajes de validación

---

## Getting Started (Local Development)

### Prerrequisitos

| Herramienta | Versión mínima | Instalación |
|---|---|---|
| **Node.js** | ≥ 18.17 | [nodejs.org](https://nodejs.org/) |
| **pnpm** *(recomendado)* | ≥ 9 | `npm install -g pnpm` |
| **Supabase CLI** | ≥ 1.100 | `npm install -g supabase` |
| **Docker** *(opcional)* | ≥ 24 | [docker.com](https://www.docker.com/) |

Adicionalmente necesitas:
- Un proyecto en [Supabase](https://supabase.com/) con la extensión **pgvector** habilitada
- Una cuenta de [Stripe](https://stripe.com/) en modo **Test**
- *(Opcional)* Una cuenta de [MercadoPago Developers](https://www.mercadopago.com.mx/developers/) para pagos LATAM

---

### Paso 1 — Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone https://github.com/KimJesus22/StanStore.git
cd StanStore

# Instalar dependencias (pnpm recomendado para mayor velocidad y dedup)
pnpm i

# Alternativa con npm
npm install
```

---

### Paso 2 — Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Complétalo con las siguientes variables:

| Variable | Requerida | Descripción | Dónde obtenerla |
|---|:---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL de tu proyecto Supabase | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clave pública (anon) de Supabase | Supabase Dashboard → Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clave de servicio (bypasa RLS) | Supabase Dashboard → Settings → API → `service_role` `secret` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Clave pública de Stripe (test) | Stripe Dashboard → Developers → API Keys → Publishable key |
| `STRIPE_SECRET_KEY` | ✅ | Clave secreta de Stripe (test) | Stripe Dashboard → Developers → API Keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Secreto de firma de webhooks | Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `STRIPE_API_VERSION` | ✅ | Versión de API de Stripe | Usar `'2025-01-27.acacia'` o consultar tu Stripe Dashboard |
| `NEXT_PUBLIC_BASE_URL` | ✅ | URL base de la app | `http://localhost:3000` para desarrollo local |
| `ENCRYPTION_KEY` | ✅ | Clave AES-256 para cifrado de datos sensibles | Generar con: `openssl rand -hex 32` |
| `NEXT_PUBLIC_ADMIN_DOMAIN` | ⚠️ | Dominio de email para verificación de admin | Ej: `@stanstore.com` — los admins deben tener email con este dominio |
| `MP_ACCESS_TOKEN` | ⬜ | Token de acceso MercadoPago (test) | MercadoPago Developers → Tus integraciones → Credenciales de prueba |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | ⬜ | Clave pública MercadoPago (test) | MercadoPago Developers → Tus integraciones → Credenciales de prueba |
| `MP_WEBHOOK_SECRET` | ⬜ | Secreto de webhook MercadoPago | MercadoPago Dashboard → Webhooks → Tu endpoint |
| `SPOTIFY_CLIENT_ID` | ⬜ | Client ID de Spotify API | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | ⬜ | Client Secret de Spotify API | Spotify Developer Dashboard → Tu app → Settings |
| `YOUTUBE_API_KEY` | ⬜ | API Key de YouTube Data v3 | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services |
| `RESEND_API_KEY` | ⬜ | API Key de Resend (email transaccional) | [Resend Dashboard](https://resend.com/) → API Keys |

> **✅** = Requerida para arrancar | **⚠️** = Recomendada | **⬜** = Opcional (funcionalidad específica)

> [!CAUTION]
> **Nunca subas el archivo `.env.local` al repositorio.** El `.gitignore` ya incluye el patrón `.env*` para prevenir fugas accidentales. Además, el proyecto incluye un test de seguridad automatizado (`npm run test:security`) que bloquea el build si detecta claves administrativas (`SERVICE_ROLE_KEY`) expuestas al cliente.

---

### Paso 3 — Ejecutar migraciones de base de datos

Conecta el CLI de Supabase a tu proyecto y aplica todas las migraciones SQL:

```bash
# Vincular el CLI a tu proyecto remoto
supabase link --project-ref <tu-project-ref>

# Aplicar todas las migraciones (esquemas, RLS, funciones, triggers)
supabase db push
```

Los archivos de migración se encuentran en `supabase/` e incluyen:

| Archivo | Contenido |
|---|---|
| `schema.sql` | Esquema base de tablas |
| `group_orders.sql` | Tablas de pedidos grupales, RLS y vista de resumen |
| `inventory.sql` | Función `decrement_stock()` con `SELECT FOR UPDATE` |
| `fix_all_rls.sql` | Políticas RLS hardeneadas (14 tablas) |
| `products_vector.sql` | Columna `vector(384)` e índice HNSW para búsqueda semántica |
| `loyalty_rewards.sql` | Sistema de puntos y recompensas |
| `audit_v2.sql` | Audit logs inmutables con metadatos de latencia |

> [!TIP]
> Si prefieres trabajar con Supabase **local** (sin proyecto remoto), ejecuta `supabase start` para levantar una instancia PostgreSQL en Docker y luego `supabase db push` contra ella.

---

### Paso 4 — Iniciar el servidor de desarrollo

```bash
# Iniciar con Turbopack (compilación incremental ultra-rápida)
pnpm dev
# o con npm
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**.

Para escuchar webhooks de Stripe en desarrollo local:

```bash
# En otra terminal — reenvía eventos de Stripe a tu servidor local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### Comandos útiles

```bash
# Tests unitarios (Vitest + Happy-DOM)
pnpm test

# Tests con reporte de cobertura
pnpm test:coverage

# Test de seguridad (bloquea build si hay fugas de secretos)
pnpm test:security

# Verificar claves de traducción i18n
pnpm i18n:check

# Lanzar Storybook (explorador de componentes)
pnpm storybook

# Analizar el tamaño del bundle
pnpm analyze

# Generar tipos TypeScript desde el esquema de Supabase
pnpm update-types
```

---

### Docker (alternativa)

```bash
# Construir e iniciar la app contenerizada
docker compose up --build -d

# Detener contenedores
docker compose down
```

---

## DevOps y CI/CD

| Herramienta         | Configuración                                                        |
|---------------------|----------------------------------------------------------------------|
| **Dependabot**      | Actualizaciones npm semanales (lunes 09:00), GitHub Actions mensual  |
| **Auto-Merge**      | Merge automático para PRs patch/minor de Dependabot que pasen CI     |
| **CodeQL**          | Análisis estático de seguridad en push, PR y cron semanal            |
| **Husky**           | Hooks pre-commit con `lint-staged` (ESLint + Vitest)                 |
| **Sentry**          | Monitoreo de errores con carga de source maps en CI                  |
| **Secret Scanning** | Push protection activado para bloquear credenciales expuestas        |

---

## Licencia

Este proyecto es de código abierto bajo la [Licencia MIT](LICENSE).

---

<p align="center">
  Construido con ☕ y 🎵 por <a href="https://github.com/KimJesus22">@KimJesus22</a>
</p>
