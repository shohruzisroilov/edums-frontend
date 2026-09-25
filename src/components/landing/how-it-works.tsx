'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { SectionHeading } from './section-heading';

const STEPS: { title: TranslationKey; text: TranslationKey }[] = [
    { title: 'landing.step1Title', text: 'landing.step1Text' },
    { title: 'landing.step2Title', text: 'landing.step2Text' },
    { title: 'landing.step3Title', text: 'landing.step3Text' },
];

export function HowItWorks({ trialDays }: { trialDays: number }) {
    const t = useT();

    return (
        <section id='how' className='mx-auto max-w-6xl scroll-mt-20 px-5 py-16'>
            <SectionHeading
                title={t('landing.stepsTitle')}
                text={t('landing.stepsText', { days: trialDays })}
            />
            <div className='relative mt-12'>
                {/* Qadamlarni bog'lovchi chiziq — faqat keng ekranda. */}
                <div
                    aria-hidden='true'
                    className='bg-card-border absolute top-5 right-[16%] left-[16%] hidden h-px md:block'
                />
                <ol className='relative grid gap-6 md:grid-cols-3'>
                    {STEPS.map((step, index) => (
                        <li key={step.title} className='relative text-center'>
                            <span className='bg-brand-500 ring-background-gray-secondary_alt_2 mx-auto flex size-10 items-center justify-center rounded-full font-semibold text-white ring-8'>
                                {index + 1}
                            </span>
                            <h3 className='text-text-primary mt-5 text-lg font-semibold'>
                                {t(step.title, { days: trialDays })}
                            </h3>
                            <p className='text-text-tertiary mx-auto mt-2 max-w-xs text-sm leading-6'>
                                {t(step.text)}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
