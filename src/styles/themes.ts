export const themes = {
    Clancy: {
        name: 'Clancy',
        colors: {
            primary: '#D13639', // Red
            background: '#FFFFFF',
            text: '#1A1A1A',
            accent: '#F57F17', // Darkened Yellow for contrast
            secondaryBackground: '#F5F5F5',
            border: '#E0E0E0',
            textMuted: '#616161', // 4.5:1 check
        },
    },
    ScaledAndIcy: {
        name: 'Scaled and Icy',
        colors: {
            // Darkened from #00B7D6 to #00796B for text contrast (4.5:1)
            primary: '#00796B',
            background: '#F9F9F9', // White/Grey
            text: '#2D2D2D',
            accent: '#C2185B', // Darkened Pink for contrast
            secondaryBackground: '#FFFFFF',
            border: '#E0E0E0',
            textMuted: '#585858',
        },
    },
    Minimalist: {
        name: 'Minimalist K-Pop',
        colors: {
            // Darkened from #A8D0E6 to #457B9D for text contrast
            primary: '#457B9D',
            background: '#FFFFFF',
            text: '#333333',
            accent: '#D84315', // Darkened Peach for contrast
            secondaryBackground: '#FAFAFA',
            border: '#EEEEEE',
            textMuted: '#666666',
        },
    },
};

export type ThemeType = typeof themes.Clancy;
