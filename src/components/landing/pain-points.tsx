'use client';

import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { Check, Xmark } from '@tailgrids/icons';
import { SectionHeading } from './section-heading';

/** Har bir muammoga tizimda haqiqatan bor yechim mos keladi. */
const PAINS: { pain: TranslationKey; fix: TranslationKey }[] = [
    { pain: 'landing.pain1', fix: 'landing.fix1' },
    { pain: 'landing.pain2', fix: 'landing.fix2' },
    { pain: 'landing.pain3', fix: 'landing.fix3' },
    { pain: 'landing.pain4', fix: 'landing.fix4' },
];

export function PainPoints() {
    const t = useT();

    return (
        <section className='mx-auto max-w-6xl px-5 py-16'>
            <SectionHeading
                title={t('landing.painTitle')}
                text={t('landing.painText')}
            />
            <div className='mt-10 grid gap-4 md:grid-cols-2'>
                {PAINS.map((item) => (
                    <div
                        key={item.pain}
                        className='border-card-border bg-card-background rounded-2xl border p-6'
                    >
                        <div className='flex gap-3'>
                            <span className='bg-badge-error-background text-badge-error-icon-color flex size-7 shrink-0 items-center justify-center rounded-full'>
                                <Xmark className='size-4' />
                            </span>
                            <p className='text-text-secondary text-sm leading-6'>
                                {t(item.pain)}
                            </p>
                        </div>
                        <div className='border-card-border mt-4 flex gap-3 border-t pt-4'>
                            <span className='bg-badge-success-background text-badge-success-icon-color flex size-7 shrink-0 items-center justify-center rounded-full'>
                                <Check className='size-4' />
                            </span>
                            <p className='text-text-primary text-sm leading-6 font-medium'>
                                {t(item.fix)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
