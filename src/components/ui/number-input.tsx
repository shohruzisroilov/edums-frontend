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

/** Kursorni formatlashdan keyin ham o'sha raqam yonida ushlab turadi. */
function keepCaret(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitIndex = digitsOnly(input.value.slice(0, caret)).length;

    requestAnimationFrame(() => {
        if (!input.isConnected) return;
        let seen = 0;
        let next = input.value.length;
        for (let i = 0; i < input.value.length; i += 1) {
            if (/\d/.test(input.value[i])) seen += 1;
            if (seen === digitIndex) {
                next = i + 1;
                break;
            }
        }
        input.setSelectionRange(digitIndex ? next : 0, digitIndex ? next : 0);
    });
}

/** Butun son. `unit` — o'ng tomondagi birlik ("kun", "ta"). */
export function NumberInput({
    value,
    onValueChange,
    unit,
    ...rest
}: BaseProps & { unit?: string }) {
    const { groupSeparator } = useFormat();

    return (
        <TextInput
            {...rest}
            type='text'
            inputMode='numeric'
            autoComplete='off'
            value={groupInteger(value, groupSeparator)}
            onChange={(event) => {
                keepCaret(event);
                onValueChange(
                    digitsOnly(event.target.value).replace(/^0+(?=\d)/, ''),
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
