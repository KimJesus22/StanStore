export const themes = {
    Clancy: {
        name: 'Clancy',
        colors: {
            primary: '#D13639', // Red
            background: '#FFFFFF',
            text: '#1A1A1A',
            accent: '#FCE300', // Yellow
            secondaryBackground: '#F5F5F5',
            border: '#E0E0E0',
        },
    },
    ScaledAndIcy: {
        name: 'Scaled and Icy',
        colors: {
            // Darkened from #00B7D6 to #00796B for text contrast (4.5:1)
            primary: '#00796B',
            background: '#F9F9F9', // White/Grey
            text: '#2D2D2D',
            accent: '#F48FB1', // Pink
            secondaryBackground: '#FFFFFF',
            border: '#E0E0E0',
        },
    },
    Minimalist: {
        name: 'Minimalist K-Pop',
        colors: {
            // Darkened from #A8D0E6 to #457B9D for text contrast
            primary: '#457B9D',
            background: '#FFFFFF',
            text: '#333333',
            accent: '#F8B195', // Peach
            secondaryBackground: '#FAFAFA',
            border: '#EEEEEE',
        },
    },
};

export type ThemeType = typeof themes.Clancy;
