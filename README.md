# StanStore

Proyecto de portafolio de e-commerce enfocado en mercancía de K-pop, construido con tecnologías web modernas.

## Tecnologías Utilizadas

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Styled Components](https://styled-components.com/) (Configurado con SSR)
- **Manejo de Estado**: [Zustand](https://github.com/pmndrs/zustand) (con middleware `persist`)
- **Iconos**: [Lucide React](https://lucide.dev/)

## Características

- **Diseño Responsivo**: Enfoque mobile-first para todos los componentes.
- **Grilla de Productos**: Diseño dinámico para mostrar productos.
- **Sistema de Carrito**:
  - Funcionalidad de agregar al carrito.
  - Almacenamiento persistente usando `localStorage`.
  - Distintivo (badge) dinámico en la barra de navegación.
- **Interfaz Interactiva**:
  - Efectos hover en tarjetas de productos.
  - Transiciones suaves.

## Estructura del Proyecto

- `src/app`: Páginas y layouts de App Router.
- `src/components`: Componentes de UI reutilizables (`Navbar`, `ProductCard`).
- `src/store`: Manejo de estado global (`useCartStore`).
- `src/data`: Datos de prueba para desarrollo.
- `src/lib`: Configuraciones de utilidades (ej. registro de Styled Components).
- `src/types.ts`: Interfaces de TypeScript.

## Comenzando

1.  Instala las dependencias:
    ```bash
    npm install
    ```

2.  Ejecuta el servidor de desarrollo:
    ```bash
    npm run dev
    ```

3.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.
