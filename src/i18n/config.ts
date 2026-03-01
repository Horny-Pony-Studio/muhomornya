export const locales = ['uk', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';

export const localeNames: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
  de: 'Deutsch',
};

export const ogLocales: Record<Locale, string> = {
  uk: 'uk_UA',
  en: 'en_US',
  de: 'de_DE',
};

export const siteUrl = 'https://muhomornya.com';
export const siteName = 'Крамниця Мухоморня';
