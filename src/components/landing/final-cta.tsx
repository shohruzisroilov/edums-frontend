'use client';

import { useT } from '@/i18n/provider';
import { Send1 } from '@tailgrids/icons';
import { SUPPORT_TELEGRAM } from './landing-footer';

export function FinalCta({
    trialDays,
    onStart,
}: {
    trialDays: number;
    onStart: () => void;
}) {
    const t = useT();

    return (
        <section className='mx-auto max-w-5xl px-5 py-16'>
            <div className='bg-brand-500 relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16'>
                {/* Burchaklardagi yorug' doiralar — faqat bezak. */}
                <div
                    aria-hidden='true'
                    className='absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl'
                />
                <div
                    aria-hidden='true'
                    className='absolute -bottom-28 -left-20 size-72 rounded-full bg-white/10 blur-2xl'
                />
                <div className='relative'>
                    <h2 className='font-display text-3xl leading-tight font-semibold sm:text-4xl'>
                        {t('landing.ctaTitle')}
                    </h2>
                    <p className='mx-auto mt-4 max-w-xl text-lg text-white/85'>
                        {t('landing.ctaText', { days: trialDays })}
                    </p>
                    <div className='mt-8 flex flex-wrap justify-center gap-3'>
                        <button
                            type='button'
                            onClick={onStart}
                            className='text-brand-500 rounded-lg bg-white px-6 py-3 text-sm font-semibold transition hover:bg-white/90'
                        >
                            {t('landing.startFree')}
                        </button>
                        <a
                            href={SUPPORT_TELEGRAM}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold transition hover:bg-white/10'
                        >
                            <Send1 className='size-4' />
                            {t('landing.askTelegram')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
