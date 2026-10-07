import en from '@/locales/en.json';
import id from '@/locales/id.json';

export type Language = 'en' | 'id';

export const dictionaries = {
  en,
  id,
};

export type Dictionary = typeof en;

// Utility to get a nested value type-safely (simplified for this app)
export function getTranslation(dict: Dictionary, section: keyof Dictionary, key: string): string {
  // @ts-expect-error
  return dict[section]?.[key] || key;
}

export function resolveLocale(locale: any): Language {
  if (locale === 'id' || locale === 'en') {
    return locale;
  }
  return 'en';
}
