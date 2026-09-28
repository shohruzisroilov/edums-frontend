'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { Check, Xmark } from '@tailgrids/icons';
import { SectionHeading } from './section-heading';

const PAINS: { pain: TranslationKey; fix: TranslationKey }[] = [
    { pain: 'landing.pain1', fix: 'landing.fix1' },
    { pain: 'landing.pain2', fix: 'landing.fix2' },
    { pain: 'landing.pain3', fix: 'landing.fix3' },
    { pain: 'landing.pain4', fix: 'landing.fix4' },
];

export function PainPoints() {
    const t = useT();

    return (
        <section className='mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-20'>
            <SectionHeading
                eyebrow='Muammo va yechim'
                title={t('landing.painTitle')}
                text={t('landing.painText')}
            />

            <div className='mt-8 grid gap-3.5 sm:mt-12 sm:grid-cols-2 sm:gap-4'>
                {PAINS.map((item) => (
                    <div
                        key={item.pain}
                        className='border-card-border bg-card-background group rounded-2xl border p-5 transition-all hover:shadow-lg sm:rounded-3xl sm:p-7'
                    >
                        {/* Muammo */}
                        <div className='flex items-start gap-3 sm:gap-4'>
                            <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 sm:mt-0 sm:size-9 dark:bg-red-500/10'>
                                <Xmark className='size-3.5 sm:size-4' />
                            </div>
                            <p className='text-text-secondary pt-0.5 text-xs leading-relaxed sm:pt-1.5 sm:text-sm'>
                                {t(item.pain)}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className='my-3.5 flex items-center gap-2 sm:my-5 sm:gap-3'>
                            <div className='border-card-border h-px flex-1 border-t border-dashed' />
                            <span className='text-brand-500 text-[11px] font-semibold whitespace-nowrap'>
                                EDUMS bilan
                            </span>
                            <div className='border-card-border h-px flex-1 border-t border-dashed' />
                        </div>

                        {/* Yechim */}
                        <div className='flex items-start gap-3 sm:gap-4'>
                            <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:mt-0 sm:size-9 dark:bg-emerald-500/10'>
                                <Check className='size-3.5 sm:size-4' />
                            </div>
                            <p className='text-text-primary pt-0.5 text-xs leading-relaxed font-medium sm:pt-1.5 sm:text-sm'>
                                {t(item.fix)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
