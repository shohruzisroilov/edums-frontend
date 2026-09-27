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
        <section className='mx-auto max-w-6xl px-5 py-20'>
            <SectionHeading
                eyebrow='Muammo va yechim'
                title={t('landing.painTitle')}
                text={t('landing.painText')}
            />

            <div className='mt-12 grid gap-4 sm:grid-cols-2'>
                {PAINS.map((item) => (
                    <div
                        key={item.pain}
                        className='border-card-border bg-card-background group rounded-3xl border p-7 transition-all hover:shadow-lg'
                    >
                        {/* Muammo */}
                        <div className='flex items-start gap-4'>
                            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10'>
                                <Xmark className='size-4' />
                            </div>
                            <p className='text-text-secondary pt-1.5 text-sm leading-relaxed'>
                                {t(item.pain)}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className='my-5 flex items-center gap-3'>
                            <div className='border-card-border h-px flex-1 border-t border-dashed' />
                            <span className='text-brand-500 border-brand-500/20 bg-brand-500/8 rounded-full border px-3 py-0.5 text-[11px] font-semibold'>
                                EduMS bilan
                            </span>
                            <div className='border-card-border h-px flex-1 border-t border-dashed' />
                        </div>

                        {/* Yechim */}
                        <div className='flex items-start gap-4'>
                            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'>
                                <Check className='size-4' />
                            </div>
                            <p className='text-text-primary pt-1.5 text-sm font-medium leading-relaxed'>
                                {t(item.fix)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
