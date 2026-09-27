'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { ImageSlot } from './image-slot';

export function Hero({ onStart }: { onStart: () => void }) {
    const t = useT();

    return (
        <section className='relative overflow-hidden'>
            {/* Orqa fondagi yumshoq brend nuri. */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 -top-48 flex justify-center'
            >
                <div className='bg-brand-500/15 size-160 rounded-full blur-3xl' />
            </div>

            <div className='relative mx-auto max-w-4xl px-5 pt-16 pb-12 text-center sm:pt-24'>
                <h1 className='text-text-primary font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl'>
                    {t('landing.heroTitle')}
                    <span className='text-brand-accent block'>
                        {t('landing.heroAccent')}
                    </span>
                </h1>
                <p className='text-text-secondary mx-auto mt-6 max-w-2xl text-lg'>
                    {t('landing.heroText')}
                </p>
                <div className='mt-8 flex flex-wrap justify-center gap-3'>
                    <Button size='xl' onPress={onStart}>
                        {t('landing.startFree')}
                    </Button>
                    <Button
                        appearance='outline'
                        size='xl'
                        onPress={() =>
                            document
                                .getElementById('features')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                    >
                        {t('landing.seeFeatures')}
                    </Button>
                </div>
            </div>

            <div className='relative mx-auto max-w-5xl px-5 pb-16'>
                <div
                    aria-hidden='true'
                    className='bg-brand-500/20 absolute inset-x-16 top-16 bottom-4 rounded-full blur-3xl'
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
