// eslint-disable-next-line storybook/no-renderer-packages
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

import { CurrencyProvider } from '@/context/CurrencyContext';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '@/styles/StorybookGlobalStyles';

// Mock theme and messages locally to avoid import issues
const theme = {
    name: 'light',
    colors: {
        background: "#ffffff",
        secondaryBackground: "#f5f5f5",
        text: "#000000",
        primary: "#0070f3",
        secondary: "#ff4081",
        border: "#eaeaea",
        accent: "#0070f3",
        muted: "#888888",
    },
};

const messages = {
    "ProductCard": {
        "addToCart": "Añadir al carrito",
        "outOfStock": "Agotado",
    }
};

const meta: Meta<typeof ProductCard> = {
    title: 'Components/ProductCard',
    component: ProductCard,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <NextIntlClientProvider locale="es" messages={messages}>
                <CurrencyProvider>
                    <ThemeProvider theme={theme}>
                        <GlobalStyles />
                        <Story />
                    </ThemeProvider>
                </CurrencyProvider>
            </NextIntlClientProvider>
        ),
    ],
    argTypes: {
        // ... existing argTypes
    },
    args: {
        // ... existing args
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
