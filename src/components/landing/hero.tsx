'use client';

import { Button } from '@/components/tailgrids/core/button';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import {
    Check,
    Code1,
    ColourPalette3,
    EmojiSmile,
    Globe2,
    Hat1,
    Rocket1,
} from '@tailgrids/icons';
import type { ReactNode } from 'react';
import { ImageSlot } from './image-slot';

const POINTS: TranslationKey[] = [
    'landing.heroPoint.noCard',
    'landing.heroPoint.languages',
    'landing.heroPoint.devices',
];

const AUDIENCE: { icon: ReactNode; label: TranslationKey }[] = [
    {
        icon: <Globe2 className='size-4' />,
        label: 'landing.audience.languages',
    },
    { icon: <Code1 className='size-4' />, label: 'landing.audience.it' },
    { icon: <Hat1 className='size-4' />, label: 'landing.audience.exam' },
    { icon: <EmojiSmile className='size-4' />, label: 'landing.audience.kids' },
    {
        icon: <ColourPalette3 className='size-4' />,
        label: 'landing.audience.studios',
    },
];

export function Hero({
    trialDays,
    onStart,
}: {
    trialDays: number;
    onStart: () => void;
}) {
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
                <span className='border-card-border bg-card-background text-text-secondary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
                    <Rocket1 className='text-brand-accent size-4' />
                    {t('landing.badge', { days: trialDays })}
                </span>
                <h1 className='text-text-primary font-display mt-6 text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl'>
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
                <ul className='text-text-secondary mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm'>
                    {POINTS.map((point) => (
                        <li
                            key={point}
                            className='inline-flex items-center gap-2'
                        >
                            <Check className='text-brand-accent size-4' />
                            {t(point)}
                        </li>
                    ))}
                </ul>
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

            <div className='mx-auto max-w-5xl px-5 pb-8 text-center'>
                <p className='text-text-tertiary text-sm font-medium'>
                    {t('landing.audienceTitle')}
                </p>
                <ul className='mt-4 flex flex-wrap justify-center gap-2'>
                    {AUDIENCE.map((item) => (
                        <li
                            key={item.label}
                            className='border-card-border bg-card-background text-text-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'
                        >
                            <span className='text-brand-accent'>
                                {item.icon}
                            </span>
                            {t(item.label)}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
