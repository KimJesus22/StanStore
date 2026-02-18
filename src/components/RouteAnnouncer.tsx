'use client';

import { useEffect, useState } from 'react';
import { usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function RouteAnnouncer() {
    const pathname = usePathname();
    const t = useTranslations('RouteAnnouncer');
    const [announcement, setAnnouncement] = useState('');

    useEffect(() => {
        // Pequeño delay para permitir que el título del documento se actualice si cambia
        // (Next.js actualiza el título automáticamente, pero a veces hay un desfase)
        const timeout = setTimeout(() => {
            const title = document.title || 'StanStore';
            setAnnouncement(t('navigatedTo', { title }));
        }, 500);

        return () => clearTimeout(timeout);
    }, [pathname, t]);

    return (
        <div
            aria-live="assertive"
            aria-atomic="true"
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: '0'
            }}
        >
            {announcement}
        </div>
    );
}
