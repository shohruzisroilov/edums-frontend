'use client';

import { useT } from '@/i18n/provider';
import { Eye, EyeDisabled } from '@tailgrids/icons';
import { useState, type ComponentProps } from 'react';
import { TextInput } from './form-field';

/**
 * Parol maydoni: o'ng chetdagi ko'zcha bilan kiritilgan parolni ko'rsatish
 * yoki yashirish mumkin — uzun parolni xatosiz terish uchun.
 */
export function PasswordInput(
    props: Omit<ComponentProps<typeof TextInput>, 'type' | 'action'>,
) {
    const t = useT();
    const [visible, setVisible] = useState(false);

    return (
        <TextInput
            {...props}
            type={visible ? 'text' : 'password'}
            action={
                <button
                    type='button'
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={t(
                        visible ? 'auth.hidePassword' : 'auth.showPassword',
                    )}
                    aria-pressed={visible}
                    disabled={props.disabled}
                    className='text-text-tertiary hover:text-text-primary focus-visible:ring-input-primary-focus-border/30 flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    {visible ? (
                        <EyeDisabled className='size-5' />
                    ) : (
                        <Eye className='size-5' />
                    )}
                </button>
            }
        />
    );
}
