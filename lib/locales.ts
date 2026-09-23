// Shared by server and client code.
export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';
export const localeLabels: Record<Locale, { short: string; name: string; html: string; og: string }> = {
  pt: { short: 'PT', name: 'Português', html: 'pt-BR', og: 'pt_BR' },
  en: { short: 'EN', name: 'English', html: 'en', og: 'en_US' },
  es: { short: 'ES', name: 'Español', html: 'es', og: 'es_ES' },
};
export const localePath = (locale: Locale) => (locale === defaultLocale ? '/' : `/${locale}`);
// Database row holding each language's content. Portuguese keeps the original 'main' row.
export const contentRow = (locale: Locale) => (locale === defaultLocale ? 'main' : locale);
