'use client';

import { useT } from '@/i18n/provider';
import { SUPPORT_TELEGRAM } from './landing-footer';

function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
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
        <section className='mx-auto max-w-5xl px-5 py-20'>
            <div className='bg-brand-500 relative overflow-hidden rounded-3xl px-8 py-16 text-white sm:px-16'>
                {/* Orqa fon bezaklari */}
                <div aria-hidden='true' className='absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-3xl' />
                <div aria-hidden='true' className='absolute -bottom-28 -left-20 size-80 rounded-full bg-white/10 blur-3xl' />
                <div aria-hidden='true' className='absolute top-0 left-1/2 -translate-x-1/2 size-full bg-gradient-to-b from-white/5 to-transparent' />

                {/* Grid nuqtalari */}
                <div
                    aria-hidden='true'
                    className='absolute inset-0 opacity-10'
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />

                <div className='relative text-center'>
                    <h2 className='font-display text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl'>
                        {t('landing.ctaTitle')}
                    </h2>
                    <p className='mx-auto mt-5 max-w-xl text-lg text-white/80 leading-relaxed'>
                        {t('landing.ctaText', { days: trialDays })}
                    </p>

                    {/* Buttons */}
                    <div className='mt-9 flex flex-wrap justify-center gap-3'>
                        <button
                            type='button'
                            onClick={onStart}
                            className='text-brand-500 rounded-2xl bg-white px-8 py-4 text-sm font-bold shadow-xl transition hover:bg-white/95 hover:shadow-2xl active:scale-[0.98]'
                        >
                            {t('landing.startFree')} →
                        </button>
                        <a
                            href={SUPPORT_TELEGRAM}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20'
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
