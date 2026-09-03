'use client';

import { useT } from '@/i18n/provider';
import Link from 'next/link';

export default function NotFound() {
    const t = useT();

    return (
        <div className='bg-background-gray-secondary_alt_2 flex h-full items-center justify-center p-4'>
            <div className='border-card-border bg-card-surface-area w-full max-w-md rounded-2xl border p-8 text-center'>
                <p className='text-brand-accent font-display text-5xl font-semibold tabular-nums'>
                    404
                </p>
                <h1 className='text-text-primary font-display mt-4 text-xl font-semibold'>
                    {t('notFound.title')}
                </h1>
                <p className='text-text-tertiary mt-2 text-sm'>
                    {t('notFound.message')}
                </p>
                <Link
                    href='/'
                    className='bg-brand-500 mt-6 inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90'
                >
                    {t('notFound.back')}
                </Link>
            </div>
        </div>
    );
}
