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
                    <div className='border-brand-500/25 bg-brand-500/5 relative overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-sm sm:p-5'>
                        <div className='border-card-border/60 flex flex-wrap items-center justify-between gap-2 border-b pb-3'>
                            <div className='flex items-center gap-2'>
                                <span className='bg-brand-500/15 text-brand-accent inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                                    <span className='bg-brand-500 size-1.5 animate-pulse rounded-full' />
                                    {t('landing.demoBadge')}
                                </span>
                                <span className='text-text-secondary text-xs font-medium sm:text-sm'>
                                    {t('landing.demoTitle')}
                                </span>
                            </div>
                            <Link
                                href='/login?demo=1'
                                className='text-brand-accent inline-flex items-center gap-1 text-xs font-semibold transition hover:underline sm:text-sm'
                            >
                                {t('landing.demoLoginBtn')} →
                            </Link>
                        </div>

                        <div className='mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                            {/* Telefon */}
                            <div className='border-card-border bg-card-surface-area flex items-center justify-between rounded-xl border px-3.5 py-2.5 shadow-xs'>
                                <div className='flex flex-col'>
                                    <span className='text-text-tertiary text-[11px] font-semibold tracking-wider uppercase'>
                                        {t('common.phoneNumber')}
                                    </span>
                                    <span className='text-text-primary font-mono text-sm font-bold tracking-wide select-all'>
                                        +998 94 008 04 73
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleCopy('+998 94 008 04 73', 'phone')
                                    }
                                    title={
                                        copiedField === 'phone'
                                            ? t('landing.demoCopied')
                                            : 'Nusxa olish'
                                    }
                                    aria-label='Copy phone'
                                    className='text-text-tertiary hover:text-text-primary hover:bg-background-gray-secondary cursor-pointer rounded-md p-1.5 transition-colors'
                                >
                                    {copiedField === 'phone' ? (
                                        <Check className='size-4 text-emerald-500' />
                                    ) : (
                                        <Copy1 className='size-4' />
                                    )}
                                </button>
                            </div>

                            {/* Parol */}
                            <div className='border-card-border bg-card-surface-area flex items-center justify-between rounded-xl border px-3.5 py-2.5 shadow-xs'>
                                <div className='flex flex-col'>
                                    <span className='text-text-tertiary text-[11px] font-semibold tracking-wider uppercase'>
                                        {t('common.password')}
                                    </span>
                                    <span className='text-text-primary font-mono text-sm font-bold tracking-wide select-all'>
                                        shohruz2003dev
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleCopy('shohruz2003dev', 'pass')
                                    }
                                    title={
                                        copiedField === 'pass'
                                            ? t('landing.demoCopied')
                                            : 'Nusxa olish'
                                    }
                                    aria-label='Copy password'
                                    className='text-text-tertiary hover:text-text-primary hover:bg-background-gray-secondary cursor-pointer rounded-md p-1.5 transition-colors'
                                >
                                    {copiedField === 'pass' ? (
                                        <Check className='size-4 text-emerald-500' />
                                    ) : (
                                        <Copy1 className='size-4' />
                                    )}
                                </button>
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
