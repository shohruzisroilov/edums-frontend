'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { ChevronDown } from '@tailgrids/icons';
import { SectionHeading } from './section-heading';

/** Javoblar tizimning haqiqiy qoidalariga mos (obuna, to'lov, limitlar). */
const QUESTIONS: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'landing.faq.trialQ', a: 'landing.faq.trialA' },
    { q: 'landing.faq.signupQ', a: 'landing.faq.signupA' },
    { q: 'landing.faq.paymentQ', a: 'landing.faq.paymentA' },
    { q: 'landing.faq.limitsQ', a: 'landing.faq.limitsA' },
    { q: 'landing.faq.securityQ', a: 'landing.faq.securityA' },
    { q: 'landing.faq.websiteQ', a: 'landing.faq.websiteA' },
    { q: 'landing.faq.mobileQ', a: 'landing.faq.mobileA' },
];

export function Faq({ trialDays }: { trialDays: number }) {
    const t = useT();

    return (
        <section id='faq' className='mx-auto max-w-3xl scroll-mt-20 px-5 py-16'>
            <SectionHeading title={t('landing.faqTitle')} />
            <div className='border-card-border bg-card-background divide-card-border mt-10 divide-y rounded-2xl border'>
                {QUESTIONS.map((item) => (
                    <details key={item.q} className='group px-6'>
                        <summary className='text-text-primary flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden'>
                            {t(item.q, { days: trialDays })}
                            <ChevronDown className='text-text-tertiary size-5 shrink-0 transition group-open:rotate-180' />
                        </summary>
                        <p className='text-text-secondary -mt-1 pb-5 text-sm leading-6'>
                            {t(item.a, { days: trialDays })}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
}
