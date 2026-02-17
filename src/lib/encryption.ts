import crypto from 'crypto';

// =============================================
// KEY MANAGEMENT & ROTATION CONFIG
// =============================================

// 1. Current Key Configuration
const CURRENT_VERSION = process.env.KEY_VERSION || 'v1';
const CURRENT_KEY_HEX = process.env.ENCRYPTION_KEY;

if (!CURRENT_KEY_HEX) {
    throw new Error('FATAL: ENCRYPTION_KEY (Current) missing in environment variables.');
}
if (CURRENT_KEY_HEX.length !== 64) {
    throw new Error(`FATAL: Invalid ENCRYPTION_KEY length. Expected 64 hex characters (32 bytes), got ${CURRENT_KEY_HEX.length}.`);
}

// 2. Key Archive (for rotation)
// Format: {"v1": "old-hex-key", "v2": "another-old-key"}
let KEY_ARCHIVE: Record<string, string> = {};
try {
    if (process.env.KEY_ARCHIVE) {
        KEY_ARCHIVE = JSON.parse(process.env.KEY_ARCHIVE);
    }
} catch (e) {
    console.warn('WARNING: Failed to parse KEY_ARCHIVE env var. Rotation might fail for old keys.');
}

// 3. Consolidated Key Store (Buffer map)
const KEYS: Record<string, Buffer> = {
    [CURRENT_VERSION]: Buffer.from(CURRENT_KEY_HEX, 'hex'),
};

// Validar y cargar keys del archivo
Object.entries(KEY_ARCHIVE).forEach(([version, hexKey]) => {
    if (hexKey.length === 64) {
        KEYS[version] = Buffer.from(hexKey, 'hex');
    } else {
        console.warn(`WARNING: Invalid length for archived key version ${version}. Skipping.`);
    }
});

const IV_LENGTH = 16; // AES block size

// =============================================
// ENCRYPTION (Always uses CURRENT_VERSION)
// =============================================
export function encrypt(text: string): string {
    if (!text) return '';

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', KEYS[CURRENT_VERSION], iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Output format: version:iv:ciphertext
        return `${CURRENT_VERSION}:${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
}

// =============================================
// DECRYPTION (Supports Key Rotation)
// =============================================
export function decrypt(text: string): string {
    if (!text) return '';

    try {
        const parts = text.split(':');

        // Handle Logic:
        // Case A (3 parts): version:iv:ciphertext (New Format)
        // Case B (2 parts): iv:ciphertext (Legacy/v1 Format) - Tratamos como CURRENT o 'v1' default

        let version = CURRENT_VERSION;
        let ivHex = '';
        let encryptedHex = '';
        let key: Buffer | undefined;

        if (parts.length === 3) {
            [version, ivHex, encryptedHex] = parts;
            key = KEYS[version];
        } else if (parts.length === 2) {
            // Asumimos formato legacy sin versión -> intentamos con v1 o current
            // Si el sistema es nuevo, esto probablemente sea 'v1' implícito.
            // Ajusta 'v1' si tu legacy era otra cosa.
            version = 'v1';
            [ivHex, encryptedHex] = parts;
            key = KEYS[version] || KEYS[CURRENT_VERSION]; // Fallback to current if v1 distinct
        } else {
            return text; // Formato desconocido o texto plano
        }

        if (!key) {
            console.error(`Decryption failed: Key version '${version}' not found in configuration.`);
            // Don't throw to avoid crashing app on bad data, just return empty or error string?
            // Throwing might be safer to alerting.
            return '';
        }

        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}

// =============================================
// LAZY MIGRATION HELPER
// =============================================
/**
 * Comprueba si un texto cifrado usa una versión de clave antigua.
 * Útil para migraciones "lazy": leer -> descifrar -> (si needsReencryption) -> cifrar -> guardar.
 */
export function needsReencryption(ciphertext: string): boolean {
    if (!ciphertext) return false;
    const parts = ciphertext.split(':');

    // Si no tiene 3 partes, es formato viejo (legacy) -> necesita migración a nuevo formato
    if (parts.length !== 3) return true;

    // Si la versión no coincide con la actual -> necesita migración
    const [version] = parts;
    return version !== CURRENT_VERSION;
}
