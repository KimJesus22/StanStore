'use client';

export const dynamic = 'force-dynamic';

import { AdminGuard } from '@/hooks/useAdmin';
import nextDynamic from 'next/dynamic';

// Carga SwaggerPage (que incluye el CSS) solo en el cliente para evitar
// que webpack evalúe swagger-ui-react en el servidor (React is not defined).
const SwaggerPage = nextDynamic(() => import('./SwaggerPage'), { ssr: false });

export default function ApiDocs() {
    return (
        <AdminGuard>
            <div style={{ padding: '2rem', background: 'white' }}>
                <SwaggerPage url="/api/doc" />
            </div>
        </AdminGuard>
    );
}
