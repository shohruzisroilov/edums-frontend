export const LOCALES = ['uz', 'uz-cyrl', 'ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

/** Til tanlagichdagi nomlar — har biri o'z tilida yoziladi. */
export const LOCALE_LABELS: Record<Locale, string> = {
    uz: "O'zbekcha",
    'uz-cyrl': 'Ўзбекча',
    ru: 'Русский',
    en: 'English',
};

/** Tanlagichda joy tejash uchun qisqartma. */
export const LOCALE_SHORT: Record<Locale, string> = {
    uz: 'UZ',
    'uz-cyrl': 'ЎЗ',
    ru: 'RU',
    en: 'EN',
};

/** Intl uchun BCP-47 teglari — sana va son formatlari shunga qarab tuziladi. */
export const INTL_LOCALES: Record<Locale, string> = {
    uz: 'uz-UZ',
    'uz-cyrl': 'uz-Cyrl-UZ',
    ru: 'ru-RU',
    en: 'en-US',
};

/** <html lang="..."> uchun. */
export const HTML_LANG: Record<Locale, string> = {
    uz: 'uz',
    'uz-cyrl': 'uz-Cyrl',
    ru: 'ru',
    en: 'en',
};

export function isLocale(value: unknown): value is Locale {
    return (
        typeof value === 'string' &&
        (LOCALES as readonly string[]).includes(value)
    );
}
