"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";
import { theme } from "@/styles/theme";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <StyledComponentsRegistry>
            <NextThemesProvider {...props}>
                <StyledThemeProvider theme={theme}>
                    {children}
                </StyledThemeProvider>
            </NextThemesProvider>
        </StyledComponentsRegistry>
    );
}
