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

    return (
        <section className='mx-auto max-w-6xl px-5 py-16'>
            <SectionHeading
                title={t('landing.featuresTitle')}
                text={t('landing.featuresText')}
            />
            <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {FEATURES.map((feature) => (
                    <div
                        key={feature.title}
                        className='border-card-border bg-card-background hover:border-brand-accent/40 rounded-2xl border p-6 transition'
                    >
                        <span className='bg-brand-accent/10 text-brand-accent flex size-10 items-center justify-center rounded-xl'>
                            {feature.icon}
                        </span>
                        <h3 className='text-text-primary mt-4 font-semibold'>
                            {t(feature.title)}
                        </h3>
                        <p className='text-text-tertiary mt-2 text-sm leading-6'>
                            {t(feature.text)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
