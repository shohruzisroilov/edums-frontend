'use client';

import { useT } from '@/i18n/provider';
import Link from 'next/link';

export function EyeIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
            aria-hidden='true'
        >
            <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
            <circle cx='12' cy='12' r='3' />
        </svg>
    );
}

/** Amallar ustunida boshqa tugmalar bilan bir xil ko'rinishdagi "ochish" tugmasi */
export function EyeLinkButton({
    href,
    label,
}: {
    href: string;
    /** Bo'lmasa — joriy tildagi "Ochish". */
    label?: string;
}) {
    const t = useT();
    const text = label ?? t('common.open');

    return (
        <Link
            href={href}
            aria-label={text}
            title={text}
            className='border-button-primary-outline-stroke bg-button-primary-outline-background text-button-primary-outline-text hover:bg-button-primary-outline-hover-background hover:text-button-primary-outline-hover-text focus-visible:ring-button-outline-focus-ring inline-flex size-9 items-center justify-center rounded-lg border transition outline-none focus-visible:ring-4'
        >
            <EyeIcon className='size-5' />
        </Link>
    );
}
