'use client';

import {
    CheckIcon,
    CopyIcon,
    GroupIcon,
    PhoneIcon,
    SupportHeadsetIcon,
    SupportModal,
    TelegramIcon,
} from '@/components/ui/support-modal';
import { useT } from '@/i18n/provider';
import { SUPPORT_CONTACTS } from '@/utils/site';
import { useState } from 'react';
import { toast } from 'sonner';
import { SectionHeading } from './section-heading';

export function ContactSection() {
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
        <section
            id='contact'
            className='mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-5 sm:py-24'
        >
            <SectionHeading
                eyebrow={t('landing.contactEyebrow')}
                title={t('landing.contactTitle')}
                text={t('landing.contactSubtitle')}
            />

            {/* Status Beacon Banner */}
            <div className='border-card-border bg-card-surface-area/80 text-text-secondary mx-auto mt-8 flex max-w-md items-center justify-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-medium shadow-xs backdrop-blur-sm sm:text-sm'>
                <span className='relative flex size-2.5'>
                    <span className='bg-badge-success-text absolute inline-flex size-full animate-ping rounded-full opacity-75' />
                    <span className='bg-badge-success-text relative inline-flex size-2.5 rounded-full' />
                </span>
                <span>{t('support.fastResponse')}</span>
                <span className='text-text-tertiary'>•</span>
                <span className='text-text-tertiary'>
                    09:00 - 20:00 (GMT+5)
                </span>
            </div>

            {/* 3 Contact Cards */}
            <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* 1. Telefon */}
                <div className='group border-card-border bg-card-background relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg dark:hover:border-emerald-500/30'>
                    <div>
                        <div className='flex items-center justify-between'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400'>
                                <PhoneIcon className='size-6' />
                            </div>
                            <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                                <PhoneIcon className='size-3' />
                                <span>Qo&apos;ng&apos;iroq</span>
                            </span>
                        </div>

                        <h3 className='font-display text-text-primary mt-5 text-lg font-bold'>
                            {t('support.phone')}
                        </h3>
                        <p className='text-text-secondary mt-1 text-xs leading-relaxed'>
                            {t('support.phoneHint')}
                        </p>

                        <div className='border-card-border bg-background-gray-secondary/70 mt-4 rounded-xl border px-3.5 py-2.5'>
                            <p className='text-text-primary font-mono text-base font-bold tracking-tight sm:text-lg'>
                                {SUPPORT_CONTACTS.phoneFormatted}
                            </p>
                        </div>
                    </div>

                    <div className='mt-6 flex items-center gap-2'>
                        <a
                            href={SUPPORT_CONTACTS.phoneTel}
                            className='bg-brand-500 hover:bg-brand-600 flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98]'
                        >
                            <PhoneIcon className='size-3.5' />
                            {t('support.callNow')}
                        </a>
                        <button
                            type='button'
                            onClick={handleCopyPhone}
                            className='border-card-border bg-card-surface-area text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition'
                            title={t('support.copyPhone')}
                            aria-label={t('support.copyPhone')}
                        >
                            {copied ? (
                                <CheckIcon className='text-badge-success-text size-4' />
                            ) : (
                                <CopyIcon className='size-4' />
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Shaxsiy Telegram */}
                <div className='group border-card-border bg-card-background relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg dark:hover:border-sky-500/30'>
                    <div>
                        <div className='flex items-center justify-between'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-colors group-hover:bg-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400'>
                                <TelegramIcon className='size-6' />
                            </div>
                            <span className='rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400'>
                                ⚡ Tezkor chat
                            </span>
                        </div>

                        <h3 className='font-display text-text-primary mt-5 text-lg font-bold'>
                            {t('support.telegramPersonal')}
                        </h3>
                        <p className='text-text-secondary mt-1 text-xs leading-relaxed'>
                            {t('support.telegramPersonalHint')}
                        </p>

                        <div className='border-card-border bg-background-gray-secondary/70 mt-4 rounded-xl border px-3.5 py-2.5'>
                            <p className='text-text-primary font-mono text-base font-bold tracking-tight sm:text-lg'>
                                {SUPPORT_CONTACTS.telegramPersonal}
                            </p>
                        </div>
                    </div>

                    <div className='mt-6'>
                        <a
                            href={SUPPORT_CONTACTS.telegramPersonalUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 active:scale-[0.98] dark:text-sky-400'
                        >
                            <TelegramIcon className='size-3.5' />
                            {t('support.openTelegram')} ↗
                        </a>
                    </div>
                </div>

                {/* 3. Savol-javoblar guruhi */}
                <div className='group border-card-border bg-card-background relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg dark:hover:border-indigo-500/30'>
                    <div>
                        <div className='flex items-center justify-between'>
                            <div className='flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400'>
                                <GroupIcon className='size-6' />
                            </div>
                            <span className='inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400'>
                                <GroupIcon className='size-3' />
                                <span>Hamjamiyat</span>
                            </span>
                        </div>

                        <h3 className='font-display text-text-primary mt-5 text-lg font-bold'>
                            {t('support.telegramGroup')}
                        </h3>
                        <p className='text-text-secondary mt-1 text-xs leading-relaxed'>
                            {t('support.telegramGroupHint')}
                        </p>

                        <div className='border-card-border bg-background-gray-secondary/70 mt-4 rounded-xl border px-3.5 py-2.5'>
                            <p className='text-text-primary font-mono text-base font-bold tracking-tight sm:text-lg'>
                                {SUPPORT_CONTACTS.telegramGroup}
                            </p>
                        </div>
                    </div>

                    <div className='mt-6'>
                        <a
                            href={SUPPORT_CONTACTS.telegramGroupUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-500/20 active:scale-[0.98] dark:text-indigo-400'
                        >
                            <GroupIcon className='size-3.5' />
                            {t('support.joinGroup')} ↗
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Guarantee Banner */}
            <div className='border-card-border bg-card-surface-area/60 mx-auto mt-10 max-w-4xl rounded-2xl border p-5 backdrop-blur-xs'>
                <div className='text-text-secondary flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm'>
                    <div className='flex items-center gap-2'>
                        <span className='text-badge-success-text font-bold'>
                            ✓
                        </span>
                        <span>Hisob ochish bepul va tezkor</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-badge-success-text font-bold'>
                            ✓
                        </span>
                        <span>Kredit karta talab etilmaydi</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-badge-success-text font-bold'>
                            ✓
                        </span>
                        <span>14 kun to&apos;liq sinov muddati</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Landing sahifasining pastki o'ng burchagidagi zamonaviy suzuvchi aloqa tugmasi.
 * Foydalanuvchi sahifaning istalgan joyida bo'lganda 1 marta bosish bilan
 * qo'ng'iroq, nusxa olish, Telegram yoki guruhga kirish oynasini ochadi.
 */
export function FloatingContactWidget() {
    const t = useT();
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className='fixed right-4 bottom-5 z-40 sm:right-6 sm:bottom-6'>
                <button
                    type='button'
                    onClick={() => setOpen(true)}
                    aria-label={t('landing.floatingContact')}
                    className='group border-card-border bg-card-surface-area/95 text-text-primary hover:border-brand-500/50 flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95'
                >
                    <span className='relative flex size-2.5'>
                        <span className='bg-badge-success-text absolute inline-flex size-full animate-ping rounded-full opacity-75' />
                        <span className='bg-badge-success-text relative inline-flex size-2.5 rounded-full' />
                    </span>
                    <SupportHeadsetIcon className='text-brand-500 size-5 transition-transform duration-200 group-hover:scale-110' />
                    <span className='hidden text-xs font-semibold sm:inline-block'>
                        {t('landing.floatingContact')}
                    </span>
                </button>
            </div>

            <SupportModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
