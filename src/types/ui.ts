import { ReactNode } from 'react';
import { Product } from './domain';

// Tipos Utilitarios para Props Comunes
export interface ClassNameProps {
    className?: string; // Para inyectar estilos desde fuera (ej: styled-components)
}

export interface ChildrenProps {
    children: ReactNode;
}

export interface BaseComponentProps extends ClassNameProps, Partial<ChildrenProps> {
    id?: string;
    style?: React.CSSProperties;
}

// Tipos para Listas de Productos
export interface ProductListProps extends ClassNameProps {
    products: Product[];
    isLoading?: boolean;
    // Callback opcional por si el componente maneja clicks internamente
    onProductClick?: (product: Product) => void;
}
