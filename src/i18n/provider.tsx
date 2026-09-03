'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { en } from './dictionaries/en';
import { ru } from './dictionaries/ru';
import { uz, type Dictionary, type TranslationKey } from './dictionaries/uz';
import { uzCyrl } from './dictionaries/uz-cyrl';
import { DEFAULT_LOCALE, HTML_LANG, isLocale, type Locale } from './locales';

const DICTIONARIES: Record<Locale, Dictionary> = {
    uz,
    'uz-cyrl': uzCyrl,
    ru,
    en,
};

const LOCALE_STORAGE_KEY = 'edums_locale';

/** `{name}` ko'rinishidagi o'rinbosarlarni almashtiradi. */
type Values = Record<string, string | number>;

function interpolate(template: string, values?: Values): string {
    if (!values) return template;

    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match,
    );
}

export type Translate = (key: TranslationKey, values?: Values) => string;

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translate;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    // localStorage faqat brauzerda mavjud, shuning uchun saqlangan til
    // hydration tugagach o'qiladi.
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (isLocale(stored)) setLocaleState(stored);
        } catch {
            /* localStorage yopiq bo'lishi mumkin */
        }
    }, []);

    // <html lang> ekran o'quvchilar va brauzer uchun to'g'ri bo'lishi kerak.
    useEffect(() => {
        document.documentElement.lang = HTML_LANG[locale];
    }, [locale]);

    const setLocale = useCallback((next: Locale) => {
        try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        } catch {
            /* saqlanmasa ham joriy sessiyada ishlaydi */
        }
        setLocaleState(next);
    }, []);

    const t = useCallback<Translate>(
        (key, values) => interpolate(DICTIONARIES[locale][key], values),
        [locale],
    );

    const value = useMemo(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t],
    );

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale faqat LocaleProvider ichida ishlaydi');
    }
    return context;
}

/** Faqat tarjima funksiyasi kerak bo'lganda. */
export function useT(): Translate {
    return useLocale().t;
}
