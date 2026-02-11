# StanStore

E-commerce portfolio project focused on K-pop merchandise, built with modern web technologies.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Styled Components](https://styled-components.com/) (Server-Side Rendering configured)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with `persist` middleware)
- **Icons**: [Lucide React](https://lucide.dev/)

## Features

- **Responsive Design**: Mobile-first approach for all components.
- **Product Grid**: Dynamic grid layout for displaying products.
- **Cart System**:
  - Add to cart functionality.
  - Persistent storage using `localStorage`.
  - Dynamic cart badge in Navbar.
- **Interactive UI**:
  - Hover effects on product cards.
  - Smooth transitions.

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components (`Navbar`, `ProductCard`).
- `src/store`: Global state management (`useCartStore`).
- `src/data`: Mock data for development.
- `src/lib`: Utility configurations (e.g., Styled Components registry).
- `src/types.ts`: TypeScript interfaces.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
