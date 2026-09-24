import { INTL_LOCALES, type Locale } from '@/i18n/locales';

/**
 * Sana va son ko'rinishi aniq belgilangan — brauzerlarning ICU ma'lumotiga
 * tayanilmaydi. Sabab: Chrome `uz-UZ` uchun sanani `2026-03-09`, sonni esa
 * `500,000` deb chiqaradi (Node'da `09/03/2026` va `500 000`). Bir xil natija
 * bo'lishi uchun ajratgichlar va tartib shu yerda qo'lda belgilanadi.
 */

/** Mingliklar ajratgichi. null = shu tilning o'z standarti saqlanadi. */
const GROUP_SEPARATOR: Record<Locale, string | null> = {
    uz: ' ', // uzilmas probel
    'uz-cyrl': ' ',
    ru: ' ',
    en: null, // en-US da vergul
};

/** Sana tartibi. */
const DATE_ORDER: Record<Locale, 'dmy-dot' | 'mdy-slash'> = {
    uz: 'dmy-dot',
    'uz-cyrl': 'dmy-dot',
    ru: 'dmy-dot',
    en: 'mdy-slash',
};

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

export function createFormatters(locale: Locale) {
    const tag = INTL_LOCALES[locale];
    const separator = GROUP_SEPARATOR[locale];
    const order = DATE_ORDER[locale];

    const numberFormat = new Intl.NumberFormat(tag);

    function formatInteger(value: number): string {
        if (separator === null) return numberFormat.format(value);

        // Guruh ajratgichini almashtiramiz, qolgan qismini Intl beradi.
        return numberFormat
            .formatToParts(value)
            .map((part) => (part.type === 'group' ? separator : part.value))
            .join('');
    }

    function toDate(value: string | Date | null | undefined): Date | null {
        if (!value) return null;
        const date = typeof value === 'string' ? new Date(value) : value;
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function datePart(date: Date): string {
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        return order === 'dmy-dot'
            ? `${day}.${month}.${year}`
            : `${month}/${day}/${year}`;
    }

    return {
        /** Maydonlarda raqam yozilayotganda ham shu ajratgich ishlatiladi. */
        groupSeparator: separator ?? ',',

        formatDate(value: string | Date | null | undefined): string {
            const date = toDate(value);
            return date ? datePart(date) : '—';
        },

        formatDateTime(value: string | Date | null | undefined): string {
            const date = toDate(value);
            if (!date) return '—';
            return `${datePart(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        },

        formatNumber(value: number | null | undefined): string {
            return value === null || value === undefined
                ? '—'
                : formatInteger(value);
        },

        /** Narx. Valyuta nomi tarjimadan keladi. */
        formatPrice(
            value: number | null | undefined,
            currency: string,
        ): string {
            return value === null || value === undefined
                ? '—'
                : `${formatInteger(value)} ${currency}`;
        },
    };
}

/** Til bilan bog'liq emas — hamma joyda "Familiya Ism" tartibida. */
export function fullName(person: {
    first_name: string;
    last_name: string;
}): string {
    return `${person.last_name} ${person.first_name}`.trim();
}
