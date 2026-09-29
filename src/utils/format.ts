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
        const date = typeof value === 'string' ? parseDate(value) : value;
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

/**
 * Faqat sanadan iborat qiymat (`2026-10-01`) — kalendar kuni, vaqt zonasi
 * yo'q. `new Date()` uni UTC yarim tuni deb o'qiydi va g'arbdagi zonalarda bir
 * kun oldinga siljitardi, shuning uchun u mahalliy sana sifatida yasaladi.
 */
function parseDate(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return new Date(value);
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Mahalliy sana `YYYY-MM-DD` ko'rinishida — sana maydonlari va API uchun. */
export function toISODate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Har qanday kiritilgan sanani `YYYY-MM-DD` ISO formatiga o'tkazadi:
 * - `2026-09-29`
 * - `29.09.2026`, `29/09/2026`, `29-09-2026`
 * - `2026.09.29`, `2026/09/29`
 * - `29092026` yoki `20260929`
 * - `5.9.2026` -> `2026-09-05`
 * Noto'g'ri bo'lsa null qaytaradi; bo'sh satr bo'lsa '' qaytaradi.
 */
export function normalizeDateString(raw: string): string | null {
    const trimmed = (raw || '').trim();
    if (!trimmed) return '';

    // Match YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
    const isoMatch = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/.exec(trimmed);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10);
        const day = parseInt(isoMatch[3], 10);
        if (isValidDateParts(year, month, day)) {
            return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
        }
    }

    // Match DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/.exec(trimmed);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10);
        const year = parseInt(dmyMatch[3], 10);
        if (isValidDateParts(year, month, day)) {
            return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
        }
    }

    // 8 raw digits: YYYYMMDD
    if (/^(19|20)\d{6}$/.test(trimmed)) {
        const year = parseInt(trimmed.slice(0, 4), 10);
        const month = parseInt(trimmed.slice(4, 6), 10);
        const day = parseInt(trimmed.slice(6, 8), 10);
        if (isValidDateParts(year, month, day)) {
            return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
        }
    }

    // 8 raw digits: DDMMYYYY
    if (/^\d{4}(19|20)\d{2}$/.test(trimmed)) {
        const day = parseInt(trimmed.slice(0, 2), 10);
        const month = parseInt(trimmed.slice(2, 4), 10);
        const year = parseInt(trimmed.slice(4, 8), 10);
        if (isValidDateParts(year, month, day)) {
            return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
        }
    }

    return null;
}

export function isValidDateParts(
    year: number,
    month: number,
    day: number,
): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    const d = new Date(year, month - 1, day);
    return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
    );
}

export function isValidISODate(
    value?: string | number | readonly string[],
): boolean {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Til bilan bog'liq emas — hamma joyda "Familiya Ism" tartibida. */
export function fullName(person: {
    first_name: string;
    last_name: string;
}): string {
    return `${person.last_name} ${person.first_name}`.trim();
}

/** Telefon raqamini o'qilishga qulay formatlash: +998 90 123 45 67 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '—';
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.startsWith('998') && digits.length === 12) {
        return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }
    return phone;
}

/** O'zbekiston mobil operatorlari kodlari */
export const UZBEK_MOBILE_PREFIXES = [
    '20', // OQ
    '33', // Humans
    '50', // Ucell
    '55', // Ucell
    '77', // Uzmobile
    '88', // Mobiuz
    '90', // Beeline
    '91', // Beeline
    '93', // Ucell
    '94', // Ucell
    '95', // Uzmobile
    '97', // Mobiuz
    '98', // Perfectum
    '99', // Uzmobile
];

/** Raqam SMS qabul qila oladigan haqiqiy O'zbekiston mobil raqami ekanligini tekshiradi */
export function isValidUzbekMobile(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    if (digits === '998000000000') return true; // test raqami
    if (digits.length !== 12 || !digits.startsWith('998')) return false;
    const prefix = digits.slice(3, 5);
    return UZBEK_MOBILE_PREFIXES.includes(prefix);
}
