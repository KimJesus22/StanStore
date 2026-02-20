import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
    name: 'Light',
    colors: {
        background: '#FFFFFF',
        backgroundSecondary: '#F5F5F5',
        secondaryBackground: '#F5F5F5',
        text: '#1A1A1A',
        textSecondary: '#616161',
        textMuted: '#616161',
        primary: '#D13639',
        primaryForeground: '#FFFFFF',
        accent: '#F57F17',
        border: '#E0E0E0',
    },
    breakpoints: {
        mobile: '768px',
        desktop: '1024px',
    },
};

export const darkTheme: DefaultTheme = {
    name: 'Dark',
    colors: {
        background: '#121212',
        backgroundSecondary: '#1E1E1E',
        secondaryBackground: '#1E1E1E',
        text: '#E0E0E0',
        textSecondary: '#B0B0B0',
        textMuted: '#B0B0B0',
        primary: '#EF5350',
        primaryForeground: '#FFFFFF',
        accent: '#FFB74D',
        border: '#333333',
    },
    breakpoints: {
        mobile: '768px',
        desktop: '1024px',
    },
};
