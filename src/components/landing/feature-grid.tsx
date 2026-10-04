'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import {
    BarChart2,
    Buildings11,
    CalendarTime,
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
import { SectionHeading } from './section-heading';

/**
 * Faqat tizimda hozir haqiqatan bor imkoniyatlar — yangi modul qo'shilganda
 * ro'yxat ham kengayadi.
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

    // Telefonda — barmoq bilan suriladigan qator (keyingi karta chetda
    // ko'rinib turadi), kattaroq ekranda — hammasi bir qarashda ko'rinadigan
    // to'r. O'zi aylanadigan slayder yo'q: o'qib ulgurmay matn qochib ketardi.
    return (
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16'>
            <SectionHeading
                title={t('landing.featuresTitle')}
                text={t('landing.featuresText')}
            />

            <ul className='-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4'>
                {FEATURES.map((feature) => (
                    <li
                        key={feature.title}
                        className='border-card-border bg-card-background w-[78%] shrink-0 snap-start rounded-2xl border p-5 sm:w-auto sm:p-6'
                    >
                        <span
                            aria-hidden='true'
                            className='bg-brand-accent/10 text-brand-accent flex size-10 items-center justify-center rounded-xl'
                        >
                            {feature.icon}
                        </span>
                        <h3 className='text-text-primary mt-4 text-base font-semibold'>
                            {t(feature.title)}
                        </h3>
                        <p className='text-text-tertiary mt-2 text-sm leading-relaxed'>
                            {t(feature.text)}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
