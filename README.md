# StanStore

Proyecto de e-commerce moderno enfocado en mercancía de K-pop (MVP), construido con Next.js 15, TypeScript y Supabase.

**[🌐 Ver Demo en Vivo](https://stan-store.vercel.app/)**

## 🚀 Tecnologías

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Estilos**: [Styled Components](https://styled-components.com/) (Configurado con SSR)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) (con persistencia en `localStorage`)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Notificaciones**: [React Hot Toast](https://react-hot-toast.com/)

## ✨ Características Implementadas

### 🛍️ Experiencia de Compra
- **Diseño Responsivo**: Interfaz adaptada a móviles y escritorio.
- **Grilla de Productos**: Visualización dinámica de items con efectos hover.
- **Filtrado por Categoría**: Filtros dinámicos por artista en la página de inicio.
- **Detalle de Producto**: Página individual (`/product/[id]`) con descripción, selector de cantidad y botones de acción.

### 🛒 Gestión del Carrito (Drawer)
- **Panel Deslizante**: Acceso rápido al carrito sin salir de la página.
- **Persistencia**: Los items se guardan localmente para no perder la sesión.
- **Acciones**:
  - Añadir productos (desde tarjeta o detalle).
  - Eliminar items individuales.
  - Cálculo automático del total.
  - Auto-apertura al añadir productos.

### 🗄️ Backend (Supabase)
- **Base de Datos Real**: Los productos se obtienen de una tabla `products` en Supabase.
- **Resiliencia**: Si la conexión falla o no hay credenciales, la app usa automáticamente datos de prueba (`mockData`) para no romper la experiencia.
- **Scripts SQL**: En la carpeta `/supabase` encontrarás los scripts para replicar la estructura (`schema.sql`) y datos (`seed.sql`).

### 🔔 Feedback de Usuario
- **Notificaciones Toast**: Confirmaciones visuales no intrusivas al realizar acciones.
- **Manejo de Errores**: Fallbacks visuales y notificaciones en caso de error de red.

### 🔐 Autenticación y Seguridad
- **Registro y Login**: Sistema completo con correo/contraseña usando Supabase Auth.
- **Estado Global**: Manejo de sesión con Zustand (`useAuthStore`).
- **Rutas Protegidas**: Redirección automática en el cliente para páginas privadas como `/profile`.
- **Row Level Security (RLS)**: Las políticas de base de datos aseguran que la data sensible esté protegida en el origen.

### 💳 Pagos y Pedidos
- **Stripe Checkout**: Integración segura para procesar pagos.
- **Historial de Compras**:
  - Los pedidos se guardan automáticamente en Supabase tras el pago exitoso.
  - Los usuarios pueden ver el detalle de sus compras pasadas en `/profile`.
  - Los items se guardan como JSON para mantener un registro histórico inmutable (por si los precios cambian después).

## 📂 Estructura del Proyecto

- `src/app`: Rutas de Next.js.
- `src/components`: Componentes reutilizables.
- `src/store`: Lógica de estado global.
- `src/lib`: Cliente de Supabase y configuraciones.
- `supabase/`: Scripts SQL para la base de datos.

## 🛠️ Instalación y Configuración

1.  **Clonar y configurar dependencias**:
    ```bash
    git clone <tu-repo>
    npm install
    ```

2.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` con tus credenciales de Supabase:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

## 🚀 Despliegue en Vercel

1.  Importa el proyecto en Vercel desde GitHub.
2.  En "Environment Variables", añade las mismas variables que en tu `.env.local`.
3.  ¡Despliega! La configuración de build (`npm run build`) es automática.
