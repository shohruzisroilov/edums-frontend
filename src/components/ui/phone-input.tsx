'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { TextInput } from './form-field';

/**
 * Telefon maydoni. Foydalanuvchi `+998 90 123 45 67` ko'rinishini ko'radi,
 * tashqariga esa backend kutgan xom qiymat chiqadi: `+998901234567`.
 */

interface BaseProps {
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    /** Xom qiymat: `+998XXXXXXXXX` yoki bo'sh satr. */
    value: string;
    onValueChange: (value: string) => void;
}

/** Kiritilgan matndan faqat raqamlarni oladi. */
function digitsOnly(text: string): string {
    return text.replace(/\D/g, '');
}

const PHONE_PREFIX = '+998';
const NATIONAL_DIGITS = 9;

/**
 * Tashqi (prop) qiymatdan milliy 9 xonali raqamni ajratib oladi.
 * Prop odatda `+998901234567` yoki qisman `+99890` ko'rinishida keladi.
 */
function extractNationalFromValue(value: string | null | undefined): string {
    if (!value) return '';
    // Agar +998 bilan boshlansa, xalqaro prefiksni olib tashlaymiz
    if (value.startsWith('+998')) {
        return digitsOnly(value.slice(4)).slice(0, NATIONAL_DIGITS);
    }
    if (value.startsWith('+')) {
        const d = digitsOnly(value);
        if (d.startsWith('998')) {
            return d.slice(3, 3 + NATIONAL_DIGITS);
        }
        return d.slice(0, NATIONAL_DIGITS);
    }
    let digits = digitsOnly(value);
    // 12 xonali (998XXXXXXXXX) kelsa prefiksni kesamiz
    if (digits.length > NATIONAL_DIGITS && digits.startsWith('998')) {
        digits = digits.slice(3);
    }
    // 10 xonali (8XXXXXXXXX) kelsa boshidagi 8 ni kesamiz
    if (digits.length === 10 && digits.startsWith('8')) {
        digits = digits.slice(1);
    }
    return digits.slice(0, NATIONAL_DIGITS);
}

/**
 * Foydalanuvchi maydonga yozgan yoki nusxalab qo'ygan (paste) matndan
 * milliy raqamni ajratib oladi.
 */
function extractNationalFromInput(raw: string): string {
    if (!raw) return '';
    const trimmed = raw.trim();

    // Agar + bilan boshlansa (masalan, +998 90 123 45 67)
    if (trimmed.startsWith('+')) {
        let d = digitsOnly(trimmed);
        if (d.startsWith('998')) {
            d = d.slice(3);
        }
        return d.slice(0, NATIONAL_DIGITS);
    }

    let digits = digitsOnly(trimmed);
    // 12 xonali (998XXXXXXXXX) yoki 9 tadan ko'p bo'lib 998 bilan boshlansa
    if (digits.length > NATIONAL_DIGITS && digits.startsWith('998')) {
        digits = digits.slice(3);
    } else if (digits.length === 10 && digits.startsWith('8')) {
        // 8 90 123 45 67 ko'rinishida yozilgan bo'lsa
        digits = digits.slice(1);
    }
    return digits.slice(0, NATIONAL_DIGITS);
}

/**
 * `901234567` → `90 123 45 67`.
 */
function formatNational(digits: string): string {
    const d = digits.slice(0, NATIONAL_DIGITS);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)]
        .filter(Boolean)
        .join(' ');
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

export function PhoneInput({
    value,
    onValueChange,
    autoComplete = 'off',
    ...rest
}: BaseProps) {
    // Tashqi qiymat to'liq raqam (+998XXXXXXXXX), maydonda esa faqat milliy qism.
    const national = extractNationalFromValue(value);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        applyWithCaret(event, (raw) => {
            const digits = extractNationalFromInput(raw);
            onValueChange(digits ? `${PHONE_PREFIX}${digits}` : '');
            return formatNational(digits);
        });
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Backspace') {
            const input = event.currentTarget;
            const { selectionStart, selectionEnd } = input;
            if (
                selectionStart !== null &&
                selectionStart === selectionEnd &&
                selectionStart > 1 &&
                input.value[selectionStart - 1] === ' '
            ) {
                // Kursordan chapda bo'shliq tursa, bo'shliqdan oldingi raqamni o'chiramiz
                event.preventDefault();
                const text = input.value;
                const nextText =
                    text.slice(0, selectionStart - 2) +
                    text.slice(selectionStart);
                const digits = extractNationalFromInput(nextText);
                onValueChange(digits ? `${PHONE_PREFIX}${digits}` : '');
                const targetDigitIndex = digitIndexFromCaret(
                    text.slice(0, selectionStart - 2),
                    selectionStart - 2,
                );
                requestAnimationFrame(() => {
                    if (!input.isConnected) return;
                    const nextCaret = caretFromDigitIndex(
                        input.value,
                        targetDigitIndex,
                    );
                    input.setSelectionRange(nextCaret, nextCaret);
                });
            }
        }
    }

    return (
        <TextInput
            {...rest}
            type='tel'
            inputMode='tel'
            autoComplete={autoComplete}
            prefix={PHONE_PREFIX}
            placeholder='90 123 45 67'
            value={formatNational(national)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
}
