'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import {
    CalendarTime,
    CheckCircle1,
    Funnel1,
    SackDollar,
    UserMultiple4,
} from '@tailgrids/icons';
import type { ReactNode } from 'react';
import { ImageSlot } from './image-slot';
import type { LandingImage } from './images';
import { SectionHeading } from './section-heading';

interface Showcase {
    image: LandingImage;
    icon: ReactNode;
    eyebrow: TranslationKey;
    title: TranslationKey;
    text: TranslationKey;
    bullets: TranslationKey[];
    imageLabel: TranslationKey;
}

const SHOWCASES: Showcase[] = [
    {
        image: 'finance',
        icon: <SackDollar className='size-4' />,
        eyebrow: 'landing.finance.eyebrow',
        title: 'landing.finance.title',
        text: 'landing.finance.text',
        bullets: [
            'landing.finance.point1',
            'landing.finance.point2',
            'landing.finance.point3',
        ],
        imageLabel: 'landing.image.finance',
    },
    {
        image: 'learning',
        icon: <CalendarTime className='size-4' />,
        eyebrow: 'landing.learning.eyebrow',
        title: 'landing.learning.title',
        text: 'landing.learning.text',
        bullets: [
            'landing.learning.point1',
            'landing.learning.point2',
            'landing.learning.point3',
        ],
        imageLabel: 'landing.image.learning',
    },
    {
        image: 'leads',
        icon: <Funnel1 className='size-4' />,
        eyebrow: 'landing.leads.eyebrow',
        title: 'landing.leads.title',
        text: 'landing.leads.text',
        bullets: [
            'landing.leads.point1',
            'landing.leads.point2',
            'landing.leads.point3',
        ],
        imageLabel: 'landing.image.leads',
    },
    {
        image: 'team',
        icon: <UserMultiple4 className='size-4' />,
        eyebrow: 'landing.team.eyebrow',
        title: 'landing.team.title',
        text: 'landing.team.text',
        bullets: [
            'landing.team.point1',
            'landing.team.point2',
            'landing.team.point3',
        ],
        imageLabel: 'landing.image.team',
    },
];

/**
 * Asosiy imkoniyatlar: Scroll qilinganda kartalar bir-birining ustiga ketma-ket
 * chiroyli chiqadigan Sticky Stacking Cards effekti.
 */
export function Showcases() {
    const t = useT();

    return (
        <section
            id='features'
            className='mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-5 sm:py-16'
        >
            <SectionHeading
                title={t('landing.showcaseTitle')}
                text={t('landing.showcaseText')}
            />
            <div className='relative mt-10 flex flex-col gap-6 pb-8 sm:mt-16 sm:gap-10 sm:pb-16'>
                {SHOWCASES.map((item, index) => (
                    <article
                        key={item.image}
                        style={{
                            top: `${4 + index * 0.75}rem`,
                            zIndex: 10 + index,
                        }}
                        className='border-card-border bg-card-background/95 relative grid items-center gap-6 rounded-2xl border p-5 shadow-xl backdrop-blur-md transition-all duration-300 sm:sticky sm:gap-8 sm:rounded-3xl sm:p-10 sm:shadow-2xl lg:grid-cols-2 lg:gap-12 lg:p-12'
                    >
                        <div
                            className={index % 2 ? 'lg:order-last' : undefined}
                        >
                            <p className='text-brand-accent inline-flex items-center gap-2 text-xs font-semibold sm:text-sm'>
                                {item.icon}
                                {t(item.eyebrow)}
                            </p>
                            <h3 className='text-text-primary font-display mt-2 text-xl leading-snug font-semibold sm:mt-3 sm:text-3xl'>
                                {t(item.title)}
                            </h3>
                            <p className='text-text-secondary mt-3 text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7'>
                                {t(item.text)}
                            </p>
                            <ul className='mt-4 space-y-2.5 sm:mt-6 sm:space-y-3'>
                                {item.bullets.map((bullet) => (
                                    <li
                                        key={bullet}
                                        className='text-text-primary flex gap-2.5 text-xs leading-5 sm:gap-3 sm:text-sm sm:leading-6'
                                    >
                                        <CheckCircle1 className='text-brand-accent mt-0.5 size-4 shrink-0 sm:size-5' />
                                        {t(bullet)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <ImageSlot
                            image={item.image}
                            label={t(item.imageLabel)}
                        />
                    </article>
                ))}
            </div>
        </section>
    );
}
