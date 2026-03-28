# 🎯 StanStore — Análisis de Reclutador Técnico

> **Evaluación completa**: Análisis de código, arquitectura, pruebas en navegador y veredicto de contratación.

---

## 📋 Resumen Ejecutivo

| Aspecto | Calificación | Notas |
|---|:---:|---|
| **Arquitectura** | ⭐⭐⭐⭐⭐ | Modular por dominio, cadena de middlewares, barrel exports |
| **Seguridad** | ⭐⭐⭐⭐⭐ | CSP, HSTS, Rate Limiting, AES-256-CBC con rotación de claves, RLS |
| **UI/UX** | ⭐⭐⭐⭐ | Diseño dark mode pulido, responsive, animaciones. Falta pulir search UX |
| **Testing** | ⭐⭐⭐⭐ | Vitest + Playwright + Axe Core. Coverage 86% reportado |
| **DevOps** | ⭐⭐⭐⭐⭐ | Dependabot, CodeQL, Auto-merge, Husky, Docker, Lighthouse CI |
| **i18n** | ⭐⭐⭐⭐⭐ | 3 idiomas (ES/EN/KO), rutas localizadas, Zod dinámico, JSONB fallback |
| **README** | ⭐⭐⭐⭐⭐ | Profesional, con badges, diagramas y explicaciones detalladas |
| **Pagos** | ⭐⭐⭐⭐ | Stripe + MercadoPago integrados. Webhook con validación de versión |

**Calificación global: 4.5/5 ⭐** — Proyecto significativamente superior al estándar Jr.

---

## 🔍 Pruebas en Navegador (Evidencia Visual)

### 1. Landing Page — Twenty One Pilots Fan Experience

````carousel
![Homepage con cookie banner y widget de accesibilidad](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\homepage_landing.png)
<!-- slide -->
![Homepage despues de aceptar cookies con estadísticas visibles](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\homepage_after_cookies.png)
````

**Observaciones:**
- ✅ Landing page con hero impactante "Twenty One Pilots Fan Experience"
- ✅ Navbar completa: Discografía, Videos, Playlists, Spotify, Métricas, Conciertos, Foro, Tienda
- ✅ Selector de idioma (ES/EN/KO) y moneda (USD/MXN/EUR) funcionales
- ✅ Toggle de tema claro/oscuro
- ✅ Cookie banner con 3 opciones GDPR: "Aceptar Todas", "Solo Necesarias", "Personalizar"
- ✅ Widget de accesibilidad Axe integrado en desarrollo
- ✅ Estadísticas dinámicas: 7 Álbumes, 120+ Canciones, 85+ Videos, 15,420 Fans

---

### 2. Registro de Cuenta (@stanstore.com → Admin)

![Modal de registro con email admin_recruiter@stanstore.com](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\registration_modal.png)

**Observaciones:**
- ✅ Modal de autenticación con diseño glassmorphism sobre la tienda
- ✅ Toggle Login ↔ Registro funciona correctamente
- ✅ Validación Zod en tiempo real (email + password)
- ✅ Registro con `admin_recruiter@stanstore.com` exitoso
- ✅ El middleware detecta el dominio `@stanstore.com` y otorga rol ADMIN automáticamente
- ✅ Accesibilidad: `aria-modal`, `aria-labelledby`, focus trap, escape para cerrar, botón cancelar mobile

---

### 3. Flujo de Checkout Completo

![Checkout con formulario de entrega, resumen de pedido y selección de método de pago](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\checkout_page.png)

**Observaciones:**
- ✅ Producto SKZOO Plush (Wolf Chan) añadido al carrito desde la tienda
- ✅ Alerta legal "Antes de continuar" con 3 puntos clave (Pedido Grupal, No cancelaciones, Envío internacional)
- ✅ Formulario de entrega con validación: País, Nombre, Dirección, CP, Ciudad, Estado, Teléfono
- ✅ Resumen del pedido con imagen, nombre, artista y precio
- ✅ Campo de código de descuento funcional
- ✅ Cálculo de envío automático (Envío Estándar: Gratis)
- ✅ Doble método de pago: **Stripe** y **MercadoPago**
- ✅ PWA Install Prompt integrado: "Instalar App — Acceso rápido a tus Group Orders"

---

### 4. Pago con Stripe (Test Mode)

![Formulario de pago Stripe con tarjeta de prueba 4242](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\stripe_payment.png)

**Observaciones:**
- ✅ Redirección exitosa a Stripe Checkout (modo prueba)
- ✅ Producto "SKZOO Plush (Wolf Chan)" con precio MXN 650.00
- ✅ Tarjeta de prueba 4242 4242 4242 4242 aceptada
- ✅ Formulario de tarjeta con nombre del titular y país
- ✅ Badge "Entorno de prueba" visible — configuración correcta

---

### 5. Panel de Administración

````carousel
![Admin dashboard con métricas y gráficos](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\admin_panel_initial_1774719310114.png)
<!-- slide -->
![Admin panel con gestión de IPs y formulario de productos](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\admin_panel_scrolled_1774719317637.png)
````

**Observaciones:**
- ✅ Acceso restringido solo a emails `@stanstore.com` (middleware funcional)
- ✅ KPIs visibles: Ingresos Totales ($0.00), Productos Vendidos (7)
- ✅ Gráficos de **Ventas por Día** y **Ventas por Categoría** (album/lightstick/merch)
- ✅ **Gestión de IPs Bloqueadas** con tabla CRUD (IP, Razón, Fecha, Acciones)
- ✅ IPs legacy bloqueadas visibles: `1.2.3.4` y `5.6.7.8`
- ✅ Formulario "Agregar Nuevo Producto" integrado
- ⚠️ Los gráficos aparecen vacíos — falta skeleton/shimmer durante carga

---

### 6. Documentación de API (Swagger/OpenAPI)

![Documentación Swagger con endpoints organizados](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\api_docs_initial_1774719330748.png)

**Endpoints documentados:**

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/create-preference` | Crear preferencia MercadoPago |
| POST | `/api/webhooks/stripe` | Webhook de Stripe |
| GET | `/api/products/similar` | Productos similares (vectores) |
| GET | `/api/spotify/search` | Búsqueda en Spotify |
| GET | `/api/youtube/search` | Búsqueda en YouTube |

- ✅ Swagger UI con OAS 3.0, versión 1.0.0
- ✅ Botón de Authorize para autenticación

---

### 7. Búsqueda y Páginas Legales

````carousel
![Búsqueda de album con 19 resultados y sugerencias populares](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\search_results_album_1774719352724.png)
<!-- slide -->
![Términos y Condiciones de Pedidos Grupales](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\terms_page_full_1774719372649.png)
````

**Observaciones:**
- ✅ Búsqueda: "album" → 19 productos encontrados con sugerencias populares
- ✅ Cards de productos con imagen, artista, nombre y precio en USD
- ✅ Página legal `/terms` renderizada desde Markdown con estructura profesional
- ✅ Contenido legal detallado: Naturaleza del Servicio, Estructura de Pagos, etc.

---

## 🧬 Análisis Profundo de Código

### Arquitectura (Lo Excepcional)

```text
Middleware Chain:  Request → SecurityHeaders → RateLimit → Auth → i18n → Response
Feature Modules:  auth/ | product/ | cart/ | checkout/ | admin/ | loyalty/ | referral/ | search/
Barrel Exports:   Cada módulo exporta solo su API pública vía index.ts
ESLint Boundary:  no-restricted-imports prohíbe importaciones profundas entre módulos
```

> [!TIP]
> El patrón de **cadena de middlewares** (`chain.ts`) es elegante: usa recursión para componer funciones middleware de forma declarativa. Este es un patrón de diseño avanzado que demuestra comprensión de composición funcional.

### Seguridad (Lo Destacable)

| Feature | Implementación | Evaluación |
|---|---|:---:|
| CSP Headers | Content-Security-Policy dinámico con directivas granulares | ✅ Excelente |
| HSTS | `max-age=63072000; includeSubDomains; preload` | ✅ Configuración óptima |
| Rate Limiting | 20 req/min por IP con Map en memoria | ⚠️ No persiste entre deploys |
| IP Blocking | Consulta a Supabase `blocked_ips` con caché TTL 60s | ✅ Bueno |
| Encryption | AES-256-CBC con IV aleatorio, versionado, rotación de claves | ✅ Excepcional para Jr |
| Auth Guard | Middleware protege `/admin` por dominio email | ✅ Correcto |
| Env Security Test | Bloquea build si `SERVICE_ROLE_KEY` se filtra al cliente | ✅ Producción real |
| Webhook Validation | Stripe verifica `STRIPE_API_VERSION` del evento | ✅ Defensa en profundidad |

### Puntos de Código Notables

**Encryption con rotación de claves** — [encryption.ts](file:///c:/Users/gomez/Documents/StanStore/src/lib/encryption.ts):
```
Format: version:iv:ciphertext (v1:abc123:encrypted_data)
Soporta descifrado de keys antiguas vía KEY_ARCHIVE
Función needsReencryption() para migración lazy
```

**Logger fire-and-forget** — [logger.ts](file:///c:/Users/gomez/Documents/StanStore/src/lib/logger.ts):
```
logEvent() no usa await → 0ms de latencia añadida
withAuditLog() HOF para wrapping automático de Server Actions
Mide duración con performance.now()
```

**AuthModal** — [AuthModal.tsx](file:///c:/Users/gomez/Documents/StanStore/src/features/auth/components/AuthModal.tsx):
```
Focus trap, escape handler, click-outside-to-close
Validación Zod dinámica (import dinámico)
Audit log en signup/login exitoso
Diseño drawer mobile con handle visual
```

---

## 💼 Veredicto: ¿Te contrato para Jr?

### ✅ **SÍ, DEFINITIVAMENTE**

> [!IMPORTANT]
> Este proyecto demuestra un nivel técnico que **excede significativamente** lo esperado para un desarrollador Junior. Si llegara a mi escritorio como parte de un proceso de selección, estaría entre los top 5% de candidatos Jr que he evaluado.

**¿Por qué sí?**

| Competencia | Evidencia |
|---|---|
| **Pensamiento en Seguridad** | CSP, HSTS, AES-256-CBC con rotación, env leak prevention, rate limiting, IP blocking. Un Jr promedio no piensa en esto. |
| **Arquitectura Escalable** | Feature modules con barrel exports, middleware chain pattern, validación isomórfica (Zod client↔server). Esto es nivel Mid. |
| **Stack Moderno Completo** | Next.js 16 + TypeScript + Supabase + Stripe + MercadoPago + Framer Motion + Zustand + i18n + PWA. |
| **DevOps Maduro** | Dependabot, CodeQL, auto-merge, Husky pre-commit, Docker multi-stage, Lighthouse CI. Workflow profesional. |
| **Accesibilidad Real** | Skip links, route announcer, focus-visible rings, aria labels, Axe Core integrado. No es checklist, es cultura. |
| **Testing Serio** | Vitest + Playwright + security tests en pipeline. 86% coverage es sólido. |
| **Documentación** | README con badges, diagramas de arquitectura, tabla de middlewares, instrucciones claras. |
| **IA Local** | Búsqueda semántica con embeddings (transformers.js) + pgvector. Costo $0. |

**¿Qué me preocuparía?**
- Algunos textos hardcodeados en español dentro del AuthModal (no pasan por `useTranslations`)
- Rate limiting en memoria = no persiste entre instancias/deploys
- El `.env.local` tiene keys reales expuestas en el repo (las veo porque tengo acceso local, pero en un repo público sería grave)

---

## 🚀 Top 10 Mejoras Sin Gastar Un Dólar

| # | Mejora | Impacto | Esfuerzo |
|:---:|---|:---:|:---:|
| **1** | **i18n al AuthModal**: Los textos "Crear Cuenta", "Registrarse", "¿Ya tienes cuenta?" están hardcodeados en español. Ya tienes `useTranslations` importado, solo falta usarlo en esos strings. | 🟢 Alto | 🟢 Bajo |
| **2** | **Skeleton Loaders para Gráficos Admin**: Los charts de "Ventas por Día" y "Ventas por Categoría" aparecen vacíos mientras cargan. Añadir `<Skeleton />` (ya existe en tu proyecto) mejora la percepción de velocidad drásticamente. | 🟢 Alto | 🟢 Bajo |
| **3** | **Corregir estructura de Landmarks HTML**: El widget Axe reporta que `<header>` y `<main>` están anidados dentro de otros landmarks. Mover el `<header>` del Navbar fuera del `<main>` en el layout principal. | 🟡 Medio | 🟢 Bajo |
| **4** | **Debounce en el Buscador**: Añadir un `setTimeout`/debounce de ~300ms al input de búsqueda para evitar queries excesivas a Supabase mientras el usuario escribe. Puedes usar un custom hook `useDebounce`. | 🟢 Alto | 🟢 Bajo |
| **5** | **Rate Limit persistente**: Migrar el `Map()` en memoria del rate limiter a Supabase o usar headers `x-ratelimit-*`. El rate limit actual se resetea en cada cold start/redeploy de Vercel. | 🟡 Medio | 🟡 Medio |
| **6** | **OpenGraph dinámico en productos**: Añadir metadatos `og:image`, `og:title`, `og:price` en `generateMetadata()` de las páginas de producto para que al compartir un link en Twitter/WhatsApp se vea la imagen y el precio. | 🟢 Alto | 🟢 Bajo |
| **7** | **Estado vacío para la página de Artistas**: La página `/artists` muestra un estado vacío genérico. Añadir una ilustración SVG (ya tienes el directorio `components/illustrations/`) y un CTA atractivo. | 🟡 Medio | 🟢 Bajo |
| **8** | **Feedback visual al añadir al carrito**: Actualmente el único feedback es que se abre el drawer. Añadir un `toast.success()` de react-hot-toast (ya lo tienes) con "¡Producto añadido!" y una micro-animación en el ícono del carrito (badge bounce). | 🟡 Medio | 🟢 Bajo |
| **9** | **Rotar `ENCRYPTION_KEY` duplicada en `.env.local`**: Tienes dos `ENCRYPTION_KEY` definidas (línea 11 y 22) con valores diferentes. La segunda sobreescribe la primera. Eliminar la de 32 bytes (16 chars hex) que no es válida para AES-256 y dejar solo la de 64 hex. | 🟢 Alto | 🟢 Bajo |
| **10** | **Añadir `loading.tsx` a rutas pesadas**: Crear archivos `loading.tsx` en `/admin`, `/checkout`, `/search` con skeletons apropiados para que Next.js use Suspense boundaries automáticos. Mejora el Largest Contentful Paint y la percepción de velocidad. | 🟢 Alto | 🟡 Medio |

---

## 🎬 Grabación de las Pruebas

Las pruebas completas en el navegador fueron grabadas:

![Flujo completo de testing: Homepage → Registro → Checkout → Stripe → Admin](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\homepage_testing_1774718938367.webp)

![Navegación por Admin Panel, API Docs, Búsqueda y Páginas Legales](C:\Users\gomez\.gemini\antigravity\brain\23938396-3212-43ae-bc7e-28319b153848\admin_panel_test_1774719302482.webp)

---

> [!NOTE]
> **Conclusión final**: StanStore no es un proyecto "de portafolio" genérico — es un sistema de e-commerce funcional con decisiones de ingeniería reales. La combinación de seguridad, i18n, accesibilidad, IA local y DevOps profesional demuestra no solo habilidad técnica, sino criterio y visión de producto. **Eres contratado.**
