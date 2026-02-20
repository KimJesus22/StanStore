import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
    name: 'Light',
    colors: {
        background: '#FFFFFF',
        text: '#1A1A1A',
        primary: '#D13639', // Red from Clancy theme
        secondaryBackground: '#F5F5F5', // Acts as cardBg
        accent: '#F57F17',
        border: '#E0E0E0',
        textMuted: '#616161', // High contrast gray
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
        text: '#E0E0E0',
        primary: '#EF5350', // Lighter red for dark mode contrast
        secondaryBackground: '#1E1E1E', // Dark card background
        accent: '#FFB74D', // Lighter orange for dark mode
        border: '#333333',
        textMuted: '#B0B0B0', // Light gray for dark bg
    },
    breakpoints: {
        mobile: '768px',
        desktop: '1024px',
    },
};
