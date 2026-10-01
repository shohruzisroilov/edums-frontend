'use client';

import { useFormat } from '@/hooks/use-format';
import type { ChangeEvent } from 'react';
import { TextInput } from './form-field';

/**
 * Son va pul maydonlari. Foydalanuvchi `300 000 so'm` ko'radi, tashqariga
 * backend kutgan xom qiymat chiqadi: `300000`. `value` — raqamlardan iborat
 * satr (bo'sh satr — qiymat yo'q).
 */
interface BaseProps {
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    value: string;
    onValueChange: (value: string) => void;
}

function digitsOnly(text: string): string {
    return text.replace(/\D/g, '');
}

/** `300000` → `300 000`. */
function groupInteger(digits: string, separator: string): string {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Kursorni formatlashdan keyin ham o'sha belgi yonida ushlab turadi.
 * `significant` — sanaladigan belgilar (raqamlar, kasrli maydonda nuqta ham):
 * ajratgich probellari qo'shilib-olinsa ham kursor siljimaydi.
 */
function keepCaret(event: ChangeEvent<HTMLInputElement>, significant: RegExp) {
    const input = event.target;
    const caret = input.selectionStart ?? input.value.length;
    const count = (text: string) =>
        [...text].filter((char) => significant.test(char)).length;
    const digitIndex = count(input.value.slice(0, caret));

    requestAnimationFrame(() => {
        if (!input.isConnected) return;
        let seen = 0;
        let next = input.value.length;
        for (let i = 0; i < input.value.length; i += 1) {
            if (significant.test(input.value[i])) seen += 1;
            if (seen === digitIndex) {
                next = i + 1;
                break;
            }
        }
        input.setSelectionRange(digitIndex ? next : 0, digitIndex ? next : 0);
    });
}

/**
 * Kiritilgan matndan xom qiymat: `12 000` → `12000`, kasrli maydonda
 * `12,5` / `12.5` → `12.5` (ko'pi bilan `decimals` xona). Vergul kasr
 * belgisi faqat u minglik ajratgichi bo'lmagan tilda.
 */
function toRawValue(
    text: string,
    decimals: number,
    commaIsDecimal: boolean,
): string {
    if (!decimals) return digitsOnly(text).replace(/^0+(?=\d)/, '');

    const normalized = commaIsDecimal ? text.replace(',', '.') : text;
    const dot = normalized.indexOf('.');
    const whole = digitsOnly(
        dot === -1 ? normalized : normalized.slice(0, dot),
    );
    const integer = whole.replace(/^0+(?=\d)/, '');
    if (dot === -1) return integer;

    const fraction = digitsOnly(normalized.slice(dot + 1)).slice(0, decimals);
    return `${integer || '0'}.${fraction}`;
}

/** Xom qiymat → ko'rinish: butun qismi minglarga bo'linadi. */
function toDisplayValue(value: string, separator: string): string {
    const [integer, fraction] = value.split('.');
    const grouped = groupInteger(integer, separator);
    return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

/**
 * Son. `unit` — o'ng tomondagi birlik ("kun", "ta", "%"). `decimals` —
 * kasr xonalari (standart 0 — butun son), masalan foiz stavkasi uchun 2.
 */
export function NumberInput({
    value,
    onValueChange,
    unit,
    decimals = 0,
    ...rest
}: BaseProps & { unit?: string; decimals?: number }) {
    const { groupSeparator } = useFormat();
    const commaIsDecimal = groupSeparator !== ',';
    const significant = !decimals ? /\d/ : commaIsDecimal ? /[\d.,]/ : /[\d.]/;

    return (
        <TextInput
            {...rest}
            type='text'
            inputMode={decimals ? 'decimal' : 'numeric'}
            autoComplete='off'
            value={toDisplayValue(value, groupSeparator)}
            onChange={(event) => {
                keepCaret(event, significant);
                onValueChange(
                    toRawValue(event.target.value, decimals, commaIsDecimal),
                );
            }}
            suffix={unit}
        />
    );
}

/** Pul — butun so'mlarda. `currency` — o'ng tomondagi valyuta nomi. */
export function MoneyInput({
    currency,
    ...rest
}: BaseProps & { currency: string }) {
    return <NumberInput {...rest} unit={currency} />;
}
