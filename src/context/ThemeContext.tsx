'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { themes, ThemeType } from '@/styles/themes';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';

type ThemeName = keyof typeof themes;

interface ThemeContextType {
    currentTheme: ThemeName;
    changeTheme: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('Clancy');
    const [mounted, setMounted] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        setMounted(true);
        // Load from local storage initially
        const savedTheme = localStorage.getItem('theme') as ThemeName;
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // If user is logged in, try to fetch their preference from Supabase
        const fetchProfileTheme = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('theme')
                .eq('id', user.id)
                .single();

            if (data && data.theme && themes[data.theme as ThemeName]) {
                setCurrentTheme(data.theme as ThemeName);
                localStorage.setItem('theme', data.theme);
            } else if (!data && !error) {
                // If profile doesn't exist (edge case if trigger failed), create it
                await supabase.from('profiles').insert({ id: user.id, theme: currentTheme });
            }
        };

        if (user) {
            fetchProfileTheme();
        }
    }, [user]);

    const changeTheme = async (theme: ThemeName) => {
        setCurrentTheme(theme);
        localStorage.setItem('theme', theme);

        if (user) {
            // Persist to Supabase
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, theme: theme });

            if (error) {
                console.error('Error saving theme to Supabase:', error);
            }
        }
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
            <StyledThemeProvider theme={themes[currentTheme]}>
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
