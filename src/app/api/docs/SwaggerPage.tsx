'use client';

import 'swagger-ui-react/swagger-ui.css';
import SwaggerUI from 'swagger-ui-react';

export default function SwaggerPage({ url }: { url: string }) {
    return <SwaggerUI url={url} />;
}
