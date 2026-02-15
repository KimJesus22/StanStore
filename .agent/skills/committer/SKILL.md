---
name: Committer
description: Commit changes to the repository in a structured way
---

# Committer Skill

Este skill define cómo se deben estructurar los commits en este repositorio.

## Formato del Mensaje de Commit

Todos los mensajes de commit deben seguir el estándar **Conventional Commits**.

```
<tipo>(<ámbito opcional>): <descripción muy breve>

<descripción extensa>
```

### Reglas Críticas

1.  **Título (Primera línea)**:
    *   Debe tener un máximo de **50 caracteres**.
    *   Debe ser imperativo (ej: "agrega", "corrige", "elimina", no "agregado" o "corrigiendo").
    *   No debe terminar con punto.
    *   Usa el formato `<tipo>: <descripción>`.

2.  **Cuerpo (Descripción)**:
    *   Debe estar separado del título por una línea en blanco.
    *   Debe explicar **qué** se cambió y **por qué**, no solo el "cómo".
    *   Debe ser extensa y detallada. Menciona los archivos modificados si es relevante para el contexto.

### Tipos de Commit Permitidos

*   `feat`: Una nueva característica para el usuario.
*   `fix`: Una corrección de un bug.
*   `docs`: Cambios solo en la documentación.
*   `style`: Cambios que no afectan el significado del código (espacios, formato, puntos y comas faltantes, etc).
*   `refactor`: Un cambio de código que no corrige un bug ni agrega una característica.
*   `perf`: Un cambio de código que mejora el rendimiento.
*   `test`: Agregar pruebas faltantes o corregir las existentes.
*   `chore`: Cambios en el proceso de construcción o herramientas auxiliares y librerías, generación de documentación.

### Ejemplo

```text
feat(auth): agrega login con Google

Se implementó la autenticación con Google OAuth2 utilizando Firebase.
Esto permite a los usuarios registrarse e iniciar sesión con un solo clic,
mejorando la tasa de conversión en el registro.

Se modificaron:
- src/auth/AuthProvider.tsx
- src/components/LoginButton.tsx
```