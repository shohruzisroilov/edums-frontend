'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { ChevronDown } from '@tailgrids/icons';
import { SectionHeading } from './section-heading';

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
        <section id='faq' className='mx-auto max-w-3xl scroll-mt-20 px-5 py-20'>
            <SectionHeading
                eyebrow="Ko'p so'raladigan savollar"
                title={t('landing.faqTitle')}
            />

            <div className='mt-10 space-y-3'>
                {QUESTIONS.map((item) => (
                    <details
                        key={item.q}
                        className='border-card-border bg-card-background group rounded-2xl border transition-all open:shadow-md'
                    >
                        <summary className='text-text-primary flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-medium [&::-webkit-details-marker]:hidden'>
                            <span>{t(item.q, { days: trialDays })}</span>
                            <span className='border-card-border bg-background-gray-secondary flex size-7 shrink-0 items-center justify-center rounded-lg border transition group-open:rotate-180'>
                                <ChevronDown className='text-text-tertiary size-4' />
                            </span>
                        </summary>
                        <div className='border-card-border border-t px-6 pb-5 pt-4'>
                            <p className='text-text-secondary text-sm leading-relaxed'>
                                {t(item.a, { days: trialDays })}
                            </p>
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}
