'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
    const actualId = gaId || 'G-XXXXXXXXXX'; // Fallback for dev

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (consent !== 'true') return;

        // Logic to initialize GA only if consent is true
        // In Next.js with next/script, we can control 'strategy' or conditionally render
    }, []);

    // Only render scripts if consent is present (checked in a wrapper or parent)
    // For simplicity here, we assume this component is conditionally rendered OR we check consent inside
    // But Script component runs on mount. So better to wrap this whole component in a check in Layout OR
    // perform the check here and return null.

    // Since we need to access localStorage which is client-side, we do it after mount
    // But return null on first render/SSR avoids hydration mismatch, but complicates script injection.

    // Better approach: 
    // 1. Check localstorage. 
    // 2. If true, render scripts.

    if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') !== 'true') {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${actualId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${actualId}');
        `}
            </Script>
        </>
    );
}
