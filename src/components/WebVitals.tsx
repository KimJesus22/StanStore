'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
    useReportWebVitals((metric) => {
        const { name, value, id } = metric;

        // Formatear métricas para fácil lectura en consola
        const formattedValue = name === 'CLS' ? value.toFixed(4) : `${Math.round(value)}ms`;
        const color = name === 'LCP' && value > 2500 ? '🔴' : '🟢';
        const clsColor = name === 'CLS' && value > 0.1 ? '🔴' : '🟢';

        switch (name) {
            case 'LCP':
                console.log(`${color} [LCP] Largest Contentful Paint: ${formattedValue} (ID: ${id})`);
                break;
            case 'FID':
                console.log(`🟢 [FID] First Input Delay: ${formattedValue} (ID: ${id})`);
                break;
            case 'CLS':
                console.log(`${clsColor} [CLS] Cumulative Layout Shift: ${formattedValue} (ID: ${id})`);
                break;
            case 'FCP':
                console.log(`ℹ️ [FCP] First Contentful Paint: ${formattedValue}`);
                break;
            case 'TTFB':
                console.log(`ℹ️ [TTFB] Time to First Byte: ${formattedValue}`);
                break;
            default:
                console.log(`📊 [${name}]: ${formattedValue}`);
        }
    });

    return null;
}
