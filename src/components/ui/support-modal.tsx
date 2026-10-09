'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useT } from '@/i18n/provider';
import { SUPPORT_CONTACTS } from '@/utils/site';
import { useState } from 'react';
import { toast } from 'sonner';

export function SupportModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const [copied, setCopied] = useState(false);

    const handleCopyPhone = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_CONTACTS.phone);
            setCopied(true);
            toast.success(t('support.copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('error.unknown'));
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size='lg'
            title={t('support.title')}
            description={t('support.subtitle')}
            footer={
                <Button
                    variant='ghost'
                    appearance='outline'
                    size='md'
                    onPress={onClose}
                >
                    {t('common.close')}
                </Button>
            }
        >
            <div className='space-y-3.5 pt-1'>
                {/* 1. Telefon */}
                <div className='border-card-border bg-card-background hover:border-card-border/80 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center'>
                    <div className='flex items-center gap-3.5'>
                        <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'>
                            <PhoneIcon className='size-5' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <span className='text-text-primary text-sm font-semibold'>
                                    {t('support.phone')}
                                </span>
                            </div>
                            <p className='text-text-primary mt-0.5 font-mono text-base font-bold tracking-tight whitespace-nowrap'>
                                {SUPPORT_CONTACTS.phoneFormatted}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 sm:shrink-0'>
                        <a
                            href={SUPPORT_CONTACTS.phoneTel}
                            className='border-card-border bg-background-gray-secondary hover:bg-card-border text-text-primary flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors'
                        >
                            <PhoneIcon className='size-3.5' />
                            {t('support.callNow')}
                        </a>
                        <button
                            type='button'
                            onClick={handleCopyPhone}
                            className='border-card-border bg-card-surface-area hover:bg-background-gray-secondary text-text-secondary hover:text-text-primary flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors'
                            title={t('support.copyPhone')}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className='text-badge-success-text size-3.5' />
                                    <span className='text-badge-success-text font-medium'>
                                        OK
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon className='size-3.5' />
                                    {t('support.copyPhone')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Shaxsiy Telegram */}
                <div className='border-card-border bg-card-background hover:border-card-border/80 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center'>
                    <div className='flex items-center gap-3.5'>
                        <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 dark:text-sky-400'>
                            <TelegramIcon className='size-5' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <span className='text-text-primary text-sm font-semibold'>
                                    {t('support.telegramPersonal')}
                                </span>
                                <span className='rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400'>
                                    Direct
                                </span>
                            </div>
                            <p className='text-text-secondary mt-0.5 text-xs'>
                                {SUPPORT_CONTACTS.telegramPersonal}
                            </p>
                        </div>
                    </div>

                    <a
                        href={SUPPORT_CONTACTS.telegramPersonalUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex h-9 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-sky-700 sm:shrink-0 dark:bg-sky-500 dark:hover:bg-sky-600'
                    >
                        <TelegramIcon className='size-3.5' />
                        {t('support.openTelegram')}
                    </a>
                </div>

                {/* 3. Savol-javoblar guruhi */}
                <div className='border-card-border bg-card-background hover:border-card-border/80 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center'>
                    <div className='flex items-center gap-3.5'>
                        <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400'>
                            <GroupIcon className='size-5' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <span className='text-text-primary text-sm font-semibold'>
                                    {t('support.telegramGroup')}
                                </span>
                                <span className='rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400'>
                                    Community
                                </span>
                            </div>
                            <p className='text-text-secondary mt-0.5 text-xs'>
                                {SUPPORT_CONTACTS.telegramGroup} ·{' '}
                                {t('support.telegramGroupHint')}
                            </p>
                        </div>
                    </div>

                    <a
                        href={SUPPORT_CONTACTS.telegramGroupUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='border-card-border bg-background-gray-secondary hover:bg-card-border text-text-primary flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-xs font-medium transition-colors sm:shrink-0'
                    >
                        <TelegramIcon className='size-3.5' />
                        {t('support.joinGroup')}
                    </a>
                </div>
            </div>
        </Modal>
    );
}

/**
 * Header yoki asboblar panelida ko'rsatiladigan Yordam tugmasi.
 */
export function SupportHelpButton({
    className,
    showLabel = false,
    onClick,
}: {
    className?: string;
    showLabel?: boolean;
    onClick?: () => void;
}) {
    const t = useT();
    const [internalOpen, setInternalOpen] = useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            setInternalOpen(true);
        }
    };

    return (
        <>
            <button
                type='button'
                onClick={handleClick}
                aria-label={t('support.title')}
                title={t('support.title')}
                className={
                    className ??
                    'border-card-border bg-card-background text-icon-primary hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 flex size-9 items-center justify-center rounded-lg border shadow-xs transition-colors outline-none focus-visible:ring-4 sm:size-10'
                }
            >
                <SupportHeadsetIcon className='size-4.5' />
                {showLabel && (
                    <span className='ml-2 text-xs font-medium'>
                        {t('support.buttonLabel')}
                    </span>
                )}
            </button>

            {!onClick && (
                <SupportModal
                    open={internalOpen}
                    onClose={() => setInternalOpen(false)}
                />
            )}
        </>
    );
}

/**
 * Profil sahifasi uchun alohida to'liq Yordam va Aloqa kartasi.
 */
export function SupportContactCard() {
    const t = useT();
    const [copied, setCopied] = useState(false);

    const handleCopyPhone = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_CONTACTS.phone);
            setCopied(true);
            toast.success(t('support.copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('error.unknown'));
        }
    };

    return (
        <div className='border-card-border bg-card-background rounded-xl border p-6'>
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h2 className='text-text-primary font-display text-base font-semibold'>
                        {t('support.cardTitle')}
                    </h2>
                    <p className='text-text-tertiary mt-0.5 text-sm'>
                        {t('support.cardDescription')}
                    </p>
                </div>
                <span className='bg-badge-success-background text-badge-success-text rounded-full px-2.5 py-1 text-xs font-medium'>
                    24/7 Aloqa
                </span>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
                {/* Telefon */}
                <div className='border-card-border bg-background-gray-secondary/40 hover:bg-background-gray-secondary flex flex-col justify-between rounded-xl border p-4 transition-colors'>
                    <div>
                        <div className='flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'>
                            <PhoneIcon className='size-4.5' />
                        </div>
                        <p className='text-text-secondary mt-3 text-xs font-medium'>
                            {t('support.phone')}
                        </p>
                        <p className='text-text-primary font-mono text-sm font-bold whitespace-nowrap'>
                            {SUPPORT_CONTACTS.phoneFormatted}
                        </p>
                    </div>

                    <div className='mt-3 flex items-center gap-2'>
                        <a
                            href={SUPPORT_CONTACTS.phoneTel}
                            className='bg-card-background border-card-border text-text-primary hover:bg-background-gray-secondary flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium transition-colors'
                        >
                            <PhoneIcon className='size-3' />
                            {t('support.callNow')}
                        </a>
                        <button
                            type='button'
                            onClick={handleCopyPhone}
                            className='bg-card-background border-card-border text-text-secondary hover:text-text-primary flex size-8 items-center justify-center rounded-lg border transition-colors'
                            title={t('support.copyPhone')}
                        >
                            {copied ? (
                                <CheckIcon className='text-badge-success-text size-3.5' />
                            ) : (
                                <CopyIcon className='size-3.5' />
                            )}
                        </button>
                    </div>
                </div>

                {/* Shaxsiy Telegram */}
                <div className='border-card-border bg-background-gray-secondary/40 hover:bg-background-gray-secondary flex flex-col justify-between rounded-xl border p-4 transition-colors'>
                    <div>
                        <div className='flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 dark:text-sky-400'>
                            <TelegramIcon className='size-4.5' />
                        </div>
                        <p className='text-text-secondary mt-3 text-xs font-medium'>
                            {t('support.telegramPersonal')}
                        </p>
                        <p className='text-text-primary text-sm font-semibold'>
                            {SUPPORT_CONTACTS.telegramPersonal}
                        </p>
                    </div>

                    <a
                        href={SUPPORT_CONTACTS.telegramPersonalUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600'
                    >
                        <TelegramIcon className='size-3' />
                        {t('support.openTelegram')}
                    </a>
                </div>

                {/* Telegram Guruh */}
                <div className='border-card-border bg-background-gray-secondary/40 hover:bg-background-gray-secondary flex flex-col justify-between rounded-xl border p-4 transition-colors'>
                    <div>
                        <div className='flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400'>
                            <GroupIcon className='size-4.5' />
                        </div>
                        <p className='text-text-secondary mt-3 text-xs font-medium'>
                            {t('support.telegramGroup')}
                        </p>
                        <p className='text-text-primary text-sm font-semibold'>
                            {SUPPORT_CONTACTS.telegramGroup}
                        </p>
                    </div>

                    <a
                        href={SUPPORT_CONTACTS.telegramGroupUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-card-background border-card-border text-text-primary hover:bg-background-gray-secondary mt-3 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-colors'
                    >
                        <TelegramIcon className='size-3' />
                        {t('support.joinGroup')}
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ── SVG Ikonkalar ── */

export function SupportHeadsetIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3' />
        </svg>
    );
}

export function PhoneIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
        </svg>
    );
}

export function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='currentColor'
            aria-hidden='true'
        >
            <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
        </svg>
    );
}

export function GroupIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
        </svg>
    );
}

export function CopyIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
            <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
        </svg>
    );
}

export function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M20 6 9 17l-5-5' />
        </svg>
    );
}
