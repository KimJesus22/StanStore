import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['en', 'es', 'ko', 'pt-BR', 'fr-CA'] as const;

// Map each locale to its fallback. New locales fall back to 'en' so missing
// keys never surface as raw identifiers (e.g. "Product.addToCart") in the UI.
const FALLBACK_LOCALE: Record<string, string> = {
    'pt-BR': 'en',
    'fr-CA': 'en',
    'ko':    'en',
    'en':    'es',  // last-resort chain
};

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
        locale = 'es';
    }

    const messages = (await import(`../messages/${locale}.json`)).default;

    // Load the fallback messages once so getMessageFallback can reference them
    // without an async import inside the callback (which is synchronous).
    const fallbackLocale = FALLBACK_LOCALE[locale] ?? 'en';
    const fallbackMessages = (await import(`../messages/${fallbackLocale}.json`)).default;

    return {
        locale,
        messages,

        // Called by next-intl whenever a key is missing in the active locale.
        // Returning the fallback string instead of undefined prevents the raw
        // key (e.g. "Home.title") from being rendered in the UI.
        getMessageFallback({ namespace, key, error }) {
            // Walk the fallback messages object using the namespace + key path
            const path = [namespace, key].filter(Boolean).join('.');
            const parts = path.split('.');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value: any = fallbackMessages;
            for (const part of parts) {
                value = value?.[part];
                if (value === undefined) break;
            }

            if (typeof value === 'string') return value;

            // If even the fallback is missing, log in dev and return the key
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    `[next-intl] Missing key "${path}" in both "${locale}" and "${fallbackLocale}".`,
                    error,
                );
            }

            // Last resort: return just the leaf key (e.g. "addToCart"), never
            // the full dot-path which looks broken to end users.
            return key;
        },
    };
});
