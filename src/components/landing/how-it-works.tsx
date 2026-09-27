'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { Buildings11, Send1, UserMultiple1 } from '@tailgrids/icons';
import type { ReactNode } from 'react';
import { SectionHeading } from './section-heading';

const STEPS: {
    title: TranslationKey;
    text: TranslationKey;
    icon: ReactNode;
    color: string;
    iconColor: string;
}[] = [
    {
        title: 'landing.step1Title',
        text: 'landing.step1Text',
        icon: <Buildings11 className='size-7' />,
        color: 'from-blue-500/10 to-brand-500/10',
        iconColor: 'text-blue-500',
    },
    {
        title: 'landing.step2Title',
        text: 'landing.step2Text',
        icon: <Send1 className='size-7' />,
        color: 'from-violet-500/10 to-purple-500/10',
        iconColor: 'text-violet-500',
    },
    {
        title: 'landing.step3Title',
        text: 'landing.step3Text',
        icon: <UserMultiple1 className='size-7' />,
        color: 'from-emerald-500/10 to-teal-500/10',
        iconColor: 'text-emerald-500',
    },
];

export function HowItWorks({ trialDays }: { trialDays: number }) {
    const t = useT();

    return (
        <section id='how' className='mx-auto max-w-6xl scroll-mt-20 px-5 py-20'>
            <SectionHeading
                eyebrow='Qanday ishlaydi'
                title={t('landing.stepsTitle')}
                text={t('landing.stepsText', { days: trialDays })}
            />

            <div className='relative mt-14'>
                {/* Connecting line */}
                <div
                    aria-hidden='true'
                    className='bg-gradient-to-r from-transparent via-card-border to-transparent absolute top-10 right-[15%] left-[15%] hidden h-px md:block'
                />

                <ol className='relative grid gap-8 md:grid-cols-3'>
                    {STEPS.map((step, index) => (
                        <li key={step.title} className='relative flex flex-col items-center text-center'>
                            {/* Icon box */}
                            <div className={`bg-gradient-to-br ${step.color} border-card-border ${step.iconColor} relative flex size-20 items-center justify-center rounded-3xl border shadow-sm`}>
                                {step.icon}
                                {/* Step number */}
                                <span className='bg-brand-500 absolute -top-2.5 -right-2.5 flex size-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md shadow-brand-500/30'>
                                    {index + 1}
                                </span>
                            </div>

                            <h3 className='text-text-primary mt-6 text-lg font-semibold'>
                                {t(step.title, { days: trialDays })}
                            </h3>
                            <p className='text-text-tertiary mx-auto mt-3 max-w-xs text-sm leading-relaxed'>
                                {t(step.text)}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
