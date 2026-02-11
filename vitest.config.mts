import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [], // Add setup file if we need jest-dom matchers later
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
