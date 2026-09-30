'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';

export function Hero({ onStart }: { onStart: () => void }) {
    const t = useT();

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
            </div>

            {/* Hero video */}
            <div className='relative mx-auto max-w-5xl px-4 pb-12 sm:px-5 sm:pb-16'>
                <div
                    aria-hidden='true'
                    className='bg-brand-500/15 absolute inset-x-8 top-4 bottom-0 rounded-full blur-3xl sm:inset-x-24 sm:top-8'
                />
                <div className='relative'>
                    <div className='border-card-border bg-card-background overflow-hidden rounded-2xl border shadow-2xl shadow-black/10'>
                        <div
                            aria-hidden='true'
                            className='border-card-border bg-background-gray-secondary/70 flex items-center justify-between border-b px-4 py-3'
                        >
                            <div className='flex items-center gap-2'>
                                <span className='size-3 rounded-full bg-[#EC6A5E]' />
                                <span className='size-3 rounded-full bg-[#F5BF4F]' />
                                <span className='size-3 rounded-full bg-[#61C554]' />
                            </div>
                            <span className='text-text-tertiary text-xs font-mono select-none'>
                                youtube.com · EDUMS Taqdimoti
                            </span>
                            <div className='w-12' />
                        </div>
                        <div className='relative aspect-video w-full bg-black'>
                            <iframe
                                className='h-full w-full'
                                src='https://www.youtube.com/embed/ByVbY2w7kMQ'
                                title='EDUMS — O‘quv markazlari uchun to‘liq CRM tizimi'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                referrerPolicy='strict-origin-when-cross-origin'
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
