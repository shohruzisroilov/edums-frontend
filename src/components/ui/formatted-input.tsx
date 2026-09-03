'use client';

import { useFormat } from '@/hooks/use-format';
import type { ChangeEvent } from 'react';
import { TextInput } from './form-field';

/**
 * Formatlanadigan kiritish maydonlari.
 *
 * Umumiy qoida: foydalanuvchi o'qishga qulay ko'rinishni ko'radi
 * (`500 000`, `+998 90 123 45 67`), tashqariga esa backend kutgan xom qiymat
 * chiqadi (`500000`, `+998901234567`). Formatlash faqat ko'rinish qatlamida.
 */

interface BaseProps {
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Xom qiymat: faqat raqamlar (va pul uchun kasr nuqtasi). */
    value: string;
    onValueChange: (value: string) => void;
}

/** Kiritilgan matndan faqat raqamlarni oladi. */
function digitsOnly(text: string): string {
    return text.replace(/\D/g, '');
}

/**
 * Kursor o'rnini raqamlar bo'yicha hisoblaydi. Formatlashdan keyin kursorni
 * shu raqamdan keyin qo'yamiz — aks holda u har yozilganda oxiriga sakraydi.
 */
function caretFromDigitIndex(formatted: string, digitIndex: number): number {
    if (digitIndex <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i += 1) {
        if (/\d/.test(formatted[i])) {
            seen += 1;
            if (seen === digitIndex) return i + 1;
        }
    }
    return formatted.length;
}

function digitIndexFromCaret(text: string, caret: number): number {
    return digitsOnly(text.slice(0, caret)).length;
}

function applyWithCaret(
    event: ChangeEvent<HTMLInputElement>,
    format: (raw: string) => string,
) {
    const input = event.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitIndex = digitIndexFromCaret(input.value, caret);
    const formatted = format(input.value);

    // React qiymatni qayta chizgach kursorni joyiga qaytaramiz.
    requestAnimationFrame(() => {
        if (!input.isConnected) return;
        const next = caretFromDigitIndex(input.value, digitIndex);
        input.setSelectionRange(next, next);
    });

    return formatted;
}

/* ── Pul ──────────────────────────────────────────────────────────────── */

/** Butun qismni minglik ajratgich bilan bo'ladi: `500000` → `500 000`. */
function groupInteger(digits: string, separator: string): string {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function MoneyInput({
    currency,
    value,
    onValueChange,
    ...rest
}: BaseProps & { currency: string }) {
    const { groupSeparator } = useFormat();

    // Backend narxda 2 tagacha kasr xonasini qabul qiladi.
    const [whole = '', fraction] = value.split('.');
    const display =
        groupInteger(whole, groupSeparator) +
        (fraction !== undefined ? `.${fraction}` : '');

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        applyWithCaret(event, (raw) => {
            const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
            const [w = '', f] = cleaned.split('.');
            onValueChange(f !== undefined ? `${w}.${f.slice(0, 2)}` : w);
            return cleaned;
        });
    }

    return (
        <TextInput
            {...rest}
            type='text'
            inputMode='decimal'
            autoComplete='off'
            value={display}
            onChange={handleChange}
            suffix={currency}
        />
    );
}

/* ── Butun son ────────────────────────────────────────────────────────── */

export function NumberInput({
    value,
    onValueChange,
    min,
    max,
    unit,
    ...rest
}: BaseProps & { min?: number; max?: number; unit?: string }) {
    const { groupSeparator } = useFormat();

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        applyWithCaret(event, (raw) => {
            let digits = digitsOnly(raw).replace(/^0+(?=\d)/, '');
            if (digits && max !== undefined && Number(digits) > max) {
                digits = String(max);
            }
            onValueChange(digits);
            return digits;
        });
    }

    return (
        <TextInput
            {...rest}
            type='text'
            inputMode='numeric'
            autoComplete='off'
            value={groupInteger(value, groupSeparator)}
            onChange={handleChange}
            onBlur={() => {
                // Pastki chegara faqat maydondan chiqqanda qo'llanadi:
                // yozayotganda `1` ni darhol `10` ga aylantirish xalaqit beradi.
                if (!value) return;
                if (min !== undefined && Number(value) < min) {
                    onValueChange(String(min));
                }
            }}
            suffix={unit}
        />
    );
}

/* ── Telefon ──────────────────────────────────────────────────────────── */

const PHONE_PREFIX = '+998';
const NATIONAL_DIGITS = 9;

/**
 * `901234567` → `90 123 45 67`.
 *
 * `+998` maydonning tahrirlanmaydigan qismi sifatida chapda turadi: aks holda
 * kursor prefiksdan oldin qolib, raqamlar noto'g'ri joyga tushardi va
 * foydalanuvchi mamlakat kodini tasodifan o'chirib yuborishi mumkin edi.
 */
function formatNational(digits: string): string {
    const d = digits.slice(0, NATIONAL_DIGITS);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)]
        .filter(Boolean)
        .join(' ');
}

export function PhoneInput({ value, onValueChange, ...rest }: BaseProps) {
    // Tashqi qiymat to'liq raqam (+998XXXXXXXXX), maydonda esa faqat milliy qism.
    const national = digitsOnly(value)
        .replace(/^998/, '')
        .slice(0, NATIONAL_DIGITS);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        applyWithCaret(event, (raw) => {
            const digits = digitsOnly(raw).slice(0, NATIONAL_DIGITS);
            onValueChange(digits ? `${PHONE_PREFIX}${digits}` : '');
            return formatNational(digits);
        });
    }

    return (
        <TextInput
            {...rest}
            type='tel'
            inputMode='tel'
            autoComplete='off'
            prefix={PHONE_PREFIX}
            placeholder='90 123 45 67'
            value={formatNational(national)}
            onChange={handleChange}
        />
    );
}
