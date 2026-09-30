'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { Check, Copy1 } from '@tailgrids/icons';
import Link from 'next/link';
import { useState } from 'react';
import { ImageSlot } from './image-slot';

export function Hero({ onStart }: { onStart: () => void }) {
    const t = useT();
    const [copiedField, setCopiedField] = useState<'phone' | 'pass' | null>(
        null,
    );

    const handleCopy = (text: string, field: 'phone' | 'pass') => {
        void navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <section className='relative overflow-hidden'>
            {/* Gradient fon */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='bg-brand-500/12 absolute -top-32 left-1/2 size-[800px] -translate-x-1/2 rounded-full blur-[100px]' />
                <div className='absolute -top-10 right-0 size-80 rounded-full bg-violet-500/8 blur-3xl' />
                <div className='absolute top-40 -left-20 size-72 rounded-full bg-blue-500/8 blur-3xl' />
            </div>

            <div className='relative mx-auto max-w-5xl px-4 pt-10 pb-8 sm:pt-24 sm:pb-10'>
                {/* Sarlavha */}
                <h1 className='text-text-primary font-display text-center text-3xl leading-[1.15] font-bold tracking-tight sm:text-5xl lg:text-[64px]'>
                    {t('landing.heroTitle')}
                    <span className='relative mt-2 block'>
                        {/* Highlighted word */}
                        <span className='bg-brand-500 shadow-brand-500/20 relative inline-block rounded-xl px-3 py-0.5 text-white shadow-md sm:rounded-2xl sm:px-4 sm:py-1'>
                            {t('landing.heroAccent')}
                        </span>
                    </span>
                </h1>

                <p className='text-text-secondary mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed sm:mt-7 sm:text-xl'>
                    {t('landing.heroText')}
                </p>

                {/* Buttons */}
                <div className='mx-auto mt-6 flex w-full max-w-sm flex-col items-stretch justify-center gap-2.5 px-2 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:gap-3 sm:px-0'>
                    <Button
                        size='xl'
                        onPress={onStart}
                        className='shadow-brand-500/20 w-full justify-center px-6 shadow-lg sm:w-auto sm:px-8'
                    >
                        {t('landing.startFree')} →
                    </Button>
                    <Button
                        appearance='outline'
                        size='xl'
                        onPress={() =>
                            document
                                .getElementById('features')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className='w-full justify-center px-6 sm:w-auto sm:px-8'
                    >
                        {t('landing.seeFeatures')}
                    </Button>
                </div>

                {/* Demo hisob kartasi */}
                <div className='mx-auto mt-7 max-w-xl px-2 sm:mt-9 sm:px-0'>
                    <div className='border-card-border/80 bg-card-surface-area/85 shadow-brand-500/5 hover:shadow-brand-500/10 relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all sm:p-5'>
                        {/* Yuqori nozik neon gradient chiziq */}
                        <div
                            aria-hidden='true'
                            className='from-brand-500/10 via-brand-500 to-brand-500/10 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r'
                        />

                        {/* Sarlavha qismi */}
                        <div className='border-card-border/60 flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex flex-wrap items-center gap-2.5'>
                                <span className='border-brand-500/25 bg-brand-500/10 text-brand-accent inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-xs'>
                                    <span className='bg-brand-500 size-1.5 animate-pulse rounded-full' />
                                    {t('landing.demoBadge')}
                                </span>
                                <span className='text-text-secondary text-xs font-medium sm:text-sm'>
                                    {t('landing.demoTitle')}
                                </span>
                            </div>

                            <Link
                                href='/login?demo=1'
                                className='bg-brand-accent hover:bg-brand-accent/90 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-95'
                            >
                                <span>{t('landing.demoLoginBtn')}</span>
                                <span aria-hidden='true'>→</span>
                            </Link>
                        </div>

                        {/* Ma'lumotlar kataklari */}
                        <div className='mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                            {/* Telefon */}
                            <div
                                onClick={() =>
                                    handleCopy('+998 94 008 04 73', 'phone')
                                }
                                className='group border-card-border/80 bg-background-gray-secondary/50 hover:bg-background-gray-secondary hover:border-brand-accent/50 flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all active:scale-[0.98]'
                            >
                                <div className='flex min-w-0 flex-col'>
                                    <span className='text-text-tertiary text-[10px] font-bold tracking-wider uppercase'>
                                        {t('common.phoneNumber')}
                                    </span>
                                    <span className='text-text-primary truncate font-mono text-sm font-bold tracking-wide select-all'>
                                        +998 94 008 04 73
                                    </span>
                                </div>
                                <div
                                    className='text-text-tertiary group-hover:text-text-primary group-hover:bg-card-surface-area shrink-0 rounded-lg p-2 transition-all'
                                    title={
                                        copiedField === 'phone'
                                            ? t('landing.demoCopied')
                                            : 'Nusxa olish'
                                    }
                                >
                                    {copiedField === 'phone' ? (
                                        <div className='flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                                            <Check className='size-4' />
                                        </div>
                                    ) : (
                                        <Copy1 className='size-4' />
                                    )}
                                </div>
                            </div>

                            {/* Parol */}
                            <div
                                onClick={() => handleCopy('edums@2026', 'pass')}
                                className='group border-card-border/80 bg-background-gray-secondary/50 hover:bg-background-gray-secondary hover:border-brand-accent/50 flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all active:scale-[0.98]'
                            >
                                <div className='flex min-w-0 flex-col'>
                                    <span className='text-text-tertiary text-[10px] font-bold tracking-wider uppercase'>
                                        {t('common.password')}
                                    </span>
                                    <span className='text-text-primary truncate font-mono text-sm font-bold tracking-wide select-all'>
                                        edums@2026
                                    </span>
                                </div>
                                <div
                                    className='text-text-tertiary group-hover:text-text-primary group-hover:bg-card-surface-area shrink-0 rounded-lg p-2 transition-all'
                                    title={
                                        copiedField === 'pass'
                                            ? t('landing.demoCopied')
                                            : 'Nusxa olish'
                                    }
                                >
                                    {copiedField === 'pass' ? (
                                        <div className='flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                                            <Check className='size-4' />
                                        </div>
                                    ) : (
                                        <Copy1 className='size-4' />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero screenshot */}
            <div className='relative mx-auto max-w-5xl px-4 pb-12 sm:px-5 sm:pb-16'>
                <div
                    aria-hidden='true'
                    className='bg-brand-500/15 absolute inset-x-8 top-4 bottom-0 rounded-full blur-3xl sm:inset-x-24 sm:top-8'
                />
                <div className='relative'>
                    <ImageSlot
                        image='hero'
                        label={t('landing.image.hero')}
                        sizes='(min-width: 1024px) 1024px, 100vw'
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
