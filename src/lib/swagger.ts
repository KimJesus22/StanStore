import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api', // Carpeta donde buscar rutas
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'StanStore API Documentation',
                version: '1.0.0',
                description: 'Documentación de API Routes para el sistema de e-commerce StanStore.',
            },
            security: [], // Por defecto público, pero se puede configurar Bearer
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });
    return spec;
};
