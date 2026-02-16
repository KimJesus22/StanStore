import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@/theme';
import { useDarkMode } from '@/hooks/useDarkMode';
import { GlobalStyles } from '@/styles/GlobalStyles';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme, mounted } = useDarkMode();

    const themeObject = theme === 'light' ? lightTheme : darkTheme;

    if (!mounted) {
        // Return an empty div to avoid hydration mismatch (as requested)
        return <div style={{ visibility: 'hidden' }} />;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
            <StyledThemeProvider theme={themeObject}>
                <GlobalStyles />
                {children}
            </StyledThemeProvider>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
