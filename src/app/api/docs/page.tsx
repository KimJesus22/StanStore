'use client';

import { AdminGuard } from '@/hooks/useAdmin';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// SwaggerUI debe cargarse dinámicamente porque usa window
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
    return (
        <AdminGuard>
            <div style={{ padding: '2rem', background: 'white' }}>
                <SwaggerUI url="/api/doc" />
            </div>
        </AdminGuard>
    );
}
