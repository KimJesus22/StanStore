/**
 * Type augmentation for next-intl.
 *
 * Declares `IntlMessages` using `es.json` as the source of truth for all
 * message keys. This gives full type safety to `useTranslations()` and
 * `getTranslations()` across the app:
 *
 *   const t = useTranslations('Navigation');
 *   t('home')         // ✅ valid
 *   t('Navigatio')    // ❌ TypeScript error — key does not exist
 *   t('hom')          // ❌ TypeScript error — key does not exist in namespace
 *
 * All locale files (en.json, ko.json) must mirror the same key structure.
 * TypeScript will not catch missing *translations*, only missing *keys*.
 */

type Messages = typeof import('../messages/es.json');

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntlMessages extends Messages {}
}
