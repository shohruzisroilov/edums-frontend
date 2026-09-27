'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Forma uchun modal oyna. Escape va fon bosilishi bilan yopiladi, ochiqligida
 * sahifa scroll'i to'xtaydi.
 *
 * Fokus boshqaruvi: ochilganda birinchi maydonga o'tadi, Tab oyna ichida
 * aylanadi (tashqaridagi elementlarga chiqib ketmaydi) va yopilganda fokus
 * oynani ochgan tugmaga qaytadi.
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    isDirty = false,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'md' | 'lg';
    isDirty?: boolean;
}) {
    const t = useT();
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleAttemptClose = () => {
        if (isDirty) {
            if (!window.confirm(t('common.confirmDiscard'))) {
                return;
            }
        }
        onClose();
    };

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const dialog = dialogRef.current;

        const focusables = () =>
            dialog
                ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
                : [];

        // Birinchi maydonga o'tamiz; hech nima yo'q bo'lsa oynaning o'ziga.
        const first = focusables()[0];
        if (first) first.focus();
        else dialog?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleAttemptClose();
                return;
            }
            if (event.key !== 'Tab') return;

            const items = focusables();
            if (items.length === 0) {
                event.preventDefault();
                return;
            }

            const firstItem = items[0];
            const lastItem = items[items.length - 1];

            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [open, isDirty, t]);

    if (!open) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4'>
            <div
                className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity'
                aria-hidden='true'
                onClick={handleAttemptClose}
            />
            <div
                ref={dialogRef}
                role='dialog'
                aria-modal='true'
                aria-label={title}
                tabIndex={-1}
                className={cn(
                    'border-card-border bg-card-surface-area relative z-10 my-0 sm:my-auto w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl border p-4.5 sm:p-6 shadow-2xl outline-none',
                    size === 'lg' ? 'max-w-3xl' : 'max-w-lg',
                )}
            >
                <div className='mb-5 pr-10'>
                    <h2 className='text-text-primary font-display text-lg font-semibold tracking-[-0.01em]'>
                        {title}
                    </h2>
                    {description && (
                        <p className='text-text-tertiary mt-1 text-sm'>
                            {description}
                        </p>
                    )}
                </div>

                {children}

                {footer && (
                    <div className='mt-6 flex items-center justify-end gap-2'>
                        {footer}
                    </div>
                )}

                {/*
                    Yopish tugmasi DOM'da oxirida turadi (ko'rinishi esa
                    absolute bilan yuqori o'ngda): shunda oyna ochilganda fokus
                    yopish tugmasiga emas, birinchi maydonga tushadi.
                */}
                <Button
                    onPress={handleAttemptClose}
                    variant='ghost'
                    iconOnly
                    size='md'
                    aria-label={t('common.close')}
                    className='absolute top-4 right-4'
                >
                    <CloseIcon />
                </Button>
            </div>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg
            width={20}
            height={20}
            viewBox='0 0 20 20'
            fill='none'
            aria-hidden='true'
        >
            <path
                d='M15 5L5 15M5 5l10 10'
                stroke='currentColor'
                strokeWidth={1.6}
                strokeLinecap='round'
            />
        </svg>
    );
}
