import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

// Mock del objeto producto
const mockProduct: Product = {
    id: '1',
    name: 'BTS - Proof (Standard Edition)',
    price: 55000,
    image_url: 'https://placehold.co/400x400/png?text=Album+Cover',
    category: 'album',
    artist: 'BTS',
    is_new: true,
    description: 'The latest anthology album from BTS.',
    stock: 10,
};

const meta: Meta<typeof ProductCard> = {
    title: 'Components/ProductCard',
    component: ProductCard,
    tags: ['autodocs'],
    argTypes: {
        isLoading: {
            control: 'boolean',
            description: 'Muestra el estado de carga (skeleton)',
        },
        product: {
            control: 'object',
            description: 'Datos del producto',
        },
    },
    args: {
        product: mockProduct,
        index: 0,
        isLoading: false,
    },
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

/**
 * Estado por defecto del componente, mostrando un producto disponible.
 */
export const Normal: Story = {};

/**
 * Estado "Sin Stock". Muestra un overlay y deshabilita la interacción.
 */
export const OutOfStock: Story = {
    args: {
        product: {
            ...mockProduct,
            stock: 0,
        },
    },
};

/**
 * Estado de carga. Muestra un skeleton animado.
 */
export const Loading: Story = {
    args: {
        isLoading: true,
    },
};

/**
 * Variación con un nombre de producto muy largo para probar el truncamiento de texto.
 */
export const LongName: Story = {
    args: {
        product: {
            ...mockProduct,
            name: 'Super Long Album Title That Certainly Will Not Fit In One Line And Maybe Not Even Two Lines So It Should Truncate With Ellipsis',
        },
    },
};
