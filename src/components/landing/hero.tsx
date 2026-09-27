'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { ImageSlot } from './image-slot';

export function Hero({ onStart }: { onStart: () => void }) {
    const t = useT();

    return (
        <section className='relative overflow-hidden'>
            {/* Gradient fon */}
            <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
                <div className='bg-brand-500/12 absolute -top-32 left-1/2 size-[800px] -translate-x-1/2 rounded-full blur-[100px]' />
                <div className='absolute -top-10 right-0 size-80 rounded-full bg-violet-500/8 blur-3xl' />
                <div className='absolute top-40 -left-20 size-72 rounded-full bg-blue-500/8 blur-3xl' />
            </div>

            <div className='relative mx-auto max-w-5xl px-4 pt-10 sm:pt-24 pb-8 sm:pb-10'>
                {/* Sarlavha */}
                <h1 className='text-text-primary font-display text-center text-3xl leading-[1.15] font-bold sm:text-5xl lg:text-[64px] tracking-tight'>
                    {t('landing.heroTitle')}
                    <span className='relative mt-2 block'>
                        {/* Highlighted word */}
                        <span className='bg-brand-500 relative inline-block rounded-xl sm:rounded-2xl px-3 sm:px-4 py-0.5 sm:py-1 text-white shadow-md shadow-brand-500/20'>
                            {t('landing.heroAccent')}
                        </span>
                    </span>
                </h1>

                <p className='text-text-secondary mx-auto mt-5 sm:mt-7 max-w-2xl text-center text-base sm:text-xl leading-relaxed'>
                    {t('landing.heroText')}
                </p>

                {/* Buttons */}
                <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-none mx-auto px-2 sm:px-0'>
                    <Button
                        size='xl'
                        onPress={onStart}
                        className='shadow-lg shadow-brand-500/20 px-6 sm:px-8 w-full sm:w-auto justify-center'
                    >
                        {t('landing.startFree')} →
                    </Button>
                    <Button
                        appearance='outline'
                        size='xl'
                        onPress={() =>
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className='px-6 sm:px-8 w-full sm:w-auto justify-center'
                    >
                        {t('landing.seeFeatures')}
                    </Button>
                </div>
            </div>

            {/* Hero screenshot */}
            <div className='relative mx-auto max-w-5xl px-4 sm:px-5 pb-12 sm:pb-16'>
                <div aria-hidden='true' className='bg-brand-500/15 absolute inset-x-8 sm:inset-x-24 top-4 sm:top-8 bottom-0 rounded-full blur-3xl' />
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
