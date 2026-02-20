export const theme = {
    name: 'Light',
    colors: {
        background: 'var(--bg-primary)',
        backgroundSecondary: 'var(--bg-secondary)',
        secondaryBackground: 'var(--bg-secondary)',
        text: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-secondary)',
        primary: 'var(--primary)',
        primaryForeground: 'var(--primary-foreground)',
        accent: 'var(--accent-neon)',
        border: 'var(--border-color)',
    },
    breakpoints: {
        mobile: '768px',
        desktop: '1024px',
    },
};

export type Theme = typeof theme;
