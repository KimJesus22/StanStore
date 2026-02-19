'use client';

import SwaggerUI from 'swagger-ui-react';

export default function SwaggerPage({ url }: { url: string }) {
    return <SwaggerUI url={url} />;
}
