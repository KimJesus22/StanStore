import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Recreamos el esquema base para probar (o podríamos exportarlo desde auth.ts si lo separáramos)
const baseSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string()
});

const refinedSchema = baseSchema.refine((data) => data.password === data.confirmPassword);

console.log("--- String Schema ---");
const stringSchema = z.string();
console.log(JSON.stringify(zodToJsonSchema(stringSchema, "myString"), null, 2));

// Ejemplo de uso:
// Este objeto JSON resultante puede ser consumido por herramientas como:
// 1. Swagger UI (para documentación automática)
// 2. React JSON Schema Form (para generar formularios automáticamente)
// 3. Validadores en otros lenguajes (Python, Go, etc.) que entiendan JSON Schema
