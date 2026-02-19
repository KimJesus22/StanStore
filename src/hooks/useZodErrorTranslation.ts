'use client';

import { useTranslations } from 'next-intl';
import type { FieldError } from 'react-hook-form';

const VALIDATION_PREFIX = 'validation.';

/**
 * Maps parameterized validation keys to their interpolation variable name.
 * Used when the schema message encodes the value: 'validation.passwordMin:8'
 */
const PARAM_MAP: Record<string, string> = {
    passwordMin: 'min',
    passwordMax: 'max',
    minLength: 'min',
    maxLength: 'max',
    searchMax: 'max',
};

/**
 * Returns a function that translates Zod validation error keys using next-intl.
 *
 * Schema message convention:
 *   - Simple:        'validation.required'       → t('required')
 *   - Parameterized: 'validation.passwordMin:8'  → t('passwordMin', { min: 8 })
 *
 * Messages that don't start with 'validation.' (e.g. server-side errors)
 * are returned as-is so they always display correctly.
 *
 * @example
 * const translateError = useZodErrorTranslation();
 * <span>{translateError(errors.email)}</span>
 */
export function useZodErrorTranslation() {
    const t = useTranslations('Validation');

    return function translateError(error?: FieldError): string | undefined {
        const msg = error?.message;
        if (!msg) return undefined;

        // Non-prefixed messages come from the server or custom logic — show as-is
        if (!msg.startsWith(VALIDATION_PREFIX)) {
            return msg;
        }

        // Strip prefix: 'validation.passwordMin:8' → 'passwordMin:8'
        const keyPart = msg.slice(VALIDATION_PREFIX.length);
        const colonIdx = keyPart.indexOf(':');

        if (colonIdx === -1) {
            // Simple key without params: 'required', 'email', 'passwordsMatch', etc.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return t(keyPart as any);
        }

        // Parameterized key: 'passwordMin:8'
        const key = keyPart.slice(0, colonIdx);
        const rawValue = keyPart.slice(colonIdx + 1);
        const numericValue = Number(rawValue);
        const paramValue = Number.isNaN(numericValue) ? rawValue : numericValue;
        const paramName = PARAM_MAP[key] ?? 'value';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return t(key as any, { [paramName]: paramValue });
    };
}
