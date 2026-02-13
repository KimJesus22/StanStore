import crypto from 'crypto';

// Key must be 32 characters (256 bits)
// In production, this should be a long random string in env vars
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16; // AES block size

export function encrypt(text: string): string {
    if (!text) return '';

    // Verify key length
    if (ENCRYPTION_KEY.length !== 32) {
        console.error('Invalid ENCRYPTION_KEY length. Using fallback for dev or throwing error.');
        // For safety in this demo, strict check:
        // throw new Error('Invalid ENCRYPTION_KEY. It must be 32 characters long.');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text) return '';

    try {
        const textParts = text.split(':');
        // Handle legacy or invalid format
        if (textParts.length < 2) return text;

        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error);
        return 'Error decrypting data';
    }
}
