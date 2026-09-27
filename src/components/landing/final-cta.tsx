'use client';

import { useT } from '@/i18n/provider';
import { SUPPORT_TELEGRAM } from './landing-footer';

function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
        </svg>
    );
}

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
                            <TelegramIcon className='size-4' />
                            {t('landing.askTelegram')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
