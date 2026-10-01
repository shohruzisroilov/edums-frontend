'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import {
    BarChart2,
    Buildings11,
    CalendarTime,
    ChevronLeft,
    ChevronRight,
    ClockThree,
    Code1,
    DoubleCheckMark,
    Funnel1,
    HandTakingCoins,
    Locked3,
    Message1,
    Shield1Check,
    Wallet2,
} from '@tailgrids/icons';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SectionHeading } from './section-heading';

/**
 * Faqat tizimda hozir haqiqatan bor imkoniyatlar — yangi modul qo'shilganda
 * ro'yxat ham kengayadi. Auto slider ko'rinishida.
 */
const FEATURES: {
    icon: ReactNode;
    title: TranslationKey;
    text: TranslationKey;
}[] = [
    {
        icon: <CalendarTime className='size-5' />,
        title: 'landing.featureGroupsTitle',
        text: 'landing.featureGroupsText',
    },
    {
        icon: <DoubleCheckMark className='size-5' />,
        title: 'landing.featureAttendanceTitle',
        text: 'landing.featureAttendanceText',
    },
    {
        icon: <HandTakingCoins className='size-5' />,
        title: 'landing.featureFinanceTitle',
        text: 'landing.featureFinanceText',
    },
    {
        icon: <Wallet2 className='size-5' />,
        title: 'landing.featureSalariesTitle',
        text: 'landing.featureSalariesText',
    },
    {
        icon: <Funnel1 className='size-5' />,
        title: 'landing.featureLeadsTitle',
        text: 'landing.featureLeadsText',
    },
    {
        icon: <Code1 className='size-5' />,
        title: 'landing.featureWebsiteTitle',
        text: 'landing.featureWebsiteText',
    },
    {
        icon: <Message1 className='size-5' />,
        title: 'landing.featureSmsTitle',
        text: 'landing.featureSmsText',
    },
    {
        icon: <BarChart2 className='size-5' />,
        title: 'landing.featureReportsTitle',
        text: 'landing.featureReportsText',
    },
    {
        icon: <Buildings11 className='size-5' />,
        title: 'landing.featureBranchesTitle',
        text: 'landing.featureBranchesText',
    },
    {
        icon: <Shield1Check className='size-5' />,
        title: 'landing.featureRolesTitle',
        text: 'landing.featureRolesText',
    },
    {
        icon: <ClockThree className='size-5' />,
        title: 'landing.featureAuditTitle',
        text: 'landing.featureAuditText',
    },
    {
        icon: <Locked3 className='size-5' />,
        title: 'landing.featureSecurityTitle',
        text: 'landing.featureSecurityText',
    },
];

export function FeatureGrid() {
    const t = useT();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, clientWidth, scrollWidth } =
            scrollContainerRef.current;
        const cardWidth = 300;

        let newScrollLeft =
            direction === 'left'
                ? scrollLeft - cardWidth
                : scrollLeft + cardWidth;

        if (
            direction === 'right' &&
            scrollLeft + clientWidth >= scrollWidth - 20
        ) {
            newScrollLeft = 0;
        } else if (direction === 'left' && scrollLeft <= 10) {
            newScrollLeft = scrollWidth - clientWidth;
        }

        scrollContainerRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    // Auto-play scroll every 3 seconds unless hovered
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            scroll('right');
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16'>
            <SectionHeading
                title={t('landing.featuresTitle')}
                text={t('landing.featuresText')}
            />

            <div
                className='relative mt-8 px-0 sm:mt-10 sm:px-4'
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Previous Button */}
                <button
                    type='button'
                    onClick={() => scroll('left')}
                    aria-label={t('common.previous')}
                    className='border-card-border bg-card-background text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary absolute top-1/2 -left-1 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-lg transition-all active:scale-95 sm:left-0 sm:size-12'
                >
                    <ChevronLeft className='size-4 sm:size-6' />
                </button>

                {/* Next Button */}
                <button
                    type='button'
                    onClick={() => scroll('right')}
                    aria-label={t('common.next')}
                    className='border-card-border bg-card-background text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary absolute top-1/2 -right-1 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-lg transition-all active:scale-95 sm:right-0 sm:size-12'
                >
                    <ChevronRight className='size-4 sm:size-6' />
                </button>

                {/* Horizontal Auto Slider Track */}
                <div
                    ref={scrollContainerRef}
                    className='flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth rounded-2xl px-4 py-2 sm:gap-4 sm:px-10 sm:py-3'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className='border-card-border bg-card-background hover:border-brand-accent/50 flex w-[250px] shrink-0 snap-center flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-lg sm:w-[290px] sm:p-6'
                        >
                            <div>
                                <span className='bg-brand-accent/10 text-brand-accent flex size-9 items-center justify-center rounded-xl sm:size-10'>
                                    {feature.icon}
                                </span>
                                <h3 className='text-text-primary mt-3 text-sm font-semibold sm:mt-4 sm:text-base'>
                                    {t(feature.title)}
                                </h3>
                                <p className='text-text-tertiary mt-1.5 text-xs leading-relaxed sm:mt-2 sm:text-sm'>
                                    {t(feature.text)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
