import { registerSchema, RegisterInput } from './auth';
import { registerZodErrorMap } from '../lib/zod-error-map';

// Registramos el mapa de errores para ver los mensajes en español en la consola
registerZodErrorMap();

// Caso Exitoso
const validInput: RegisterInput = {
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123"
};

const resultSuccess = registerSchema.safeParse(validInput);
if (resultSuccess.success) {
    console.log("✅ Validación exitosa:", resultSuccess.data);
} else {
    console.error("❌ Error inesperado en validación exitosa:", resultSuccess.error);
}

// Caso Contraseña Corta
const shortPasswordInput = {
    email: "test@example.com",
    password: "123",
    confirmPassword: "123"
};

const resultShort = registerSchema.safeParse(shortPasswordInput);
if (!resultShort.success) {
    // En Zod, los errores están en .issues (o .errors en versiones anteriores)
    // Usamos una forma segura de acceder o mostramos el error formateado
    const errorMsg = resultShort.error.issues?.[0]?.message || resultShort.error.errors?.[0]?.message || resultShort.error.toString();
    console.log("✅ Error esperado (contraseña corta):", errorMsg);
} else {
    console.error("❌ Falló la detección de contraseña corta");
}

// Caso Contraseñas No Coinciden
const mismatchInput = {
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password456"
};

const resultMismatch = registerSchema.safeParse(mismatchInput);
if (!resultMismatch.success) {
    const errorMsg = resultMismatch.error.issues?.[0]?.message || resultMismatch.error.errors?.[0]?.message || resultMismatch.error.toString();
    console.log("✅ Error esperado (no coinciden):", errorMsg);
} else {
    console.error("❌ Falló la detección de contraseñas no coincidentes");
}
