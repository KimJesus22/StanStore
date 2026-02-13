import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "styled-components";
import { NextIntlClientProvider } from "next-intl";
import GlobalStyles from "../src/styles/StorybookGlobalStyles";
import { CurrencyProvider } from "../src/context/CurrencyContext";

// Mock básico del tema (deberías importar tu tema real si lo tienes en un archivo separado)
const theme = {
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

// Mock de mensajes para next-intl
const messages = {
    "ProductCard": {
        "addToCart": "Añadir al carrito",
        "outOfStock": "Agotado",
    }
};

export const parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/i,
        },
    },
    nextjs: {
        appDirectory: true,
    },
};

export const decorators = [
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
];

const preview: Preview = {
    parameters,
    decorators,
};

export default preview;
