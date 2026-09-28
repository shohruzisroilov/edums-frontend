'use client';

import { ArrowLeft } from '@tailgrids/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Batafsil sahifa tepasidagi "ro'yxatga qaytish" havolasi. */
export function BackLink({ href, label }: { href: string; label: string }) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (typeof window !== 'undefined' && window.history.length > 1) {
            e.preventDefault();
            router.back();
        }
    };

    return (
        <div className='px-4 pt-4 sm:px-5 sm:pt-6'>
            <Link
                href={href}
                onClick={handleClick}
                className='text-text-tertiary hover:text-text-primary group inline-flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors'
            >
                <span className='border-card-border bg-card-background group-hover:border-brand-accent/50 group-hover:text-brand-accent group-hover:bg-brand-accent/5 flex size-8 items-center justify-center rounded-xl border shadow-2xs transition-all'>
                    <ArrowLeft className='size-4' />
                </span>
                <span>{label}</span>
            </Link>
        </div>
    );
}

/** Bitta qiymatli kichik karta: yorliq va uning ostida qiymat. */
export function InfoCard({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-4'>
            <p className='text-text-tertiary text-xs'>{label}</p>
            <div className='text-text-primary mt-1.5 text-sm font-medium tabular-nums'>
                {value}
            </div>
        </div>
    );
}

/** Sarlavha, izoh va o'ng tomonda amal tugmasi bo'lgan jadval bo'limi. */
export function DetailSection({
    id,
    title,
    description,
    action,
    children,
}: {
    /** Sahifa ichidagi havola uchun (`#finance`). */
    id?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section id={id} className='mt-6 scroll-mt-4 px-4 sm:mt-8 sm:px-5'>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <div>
                    <h2 className='text-text-primary font-display text-base font-semibold'>
                        {title}
                    </h2>
                    {description && (
                        <p className='text-text-tertiary mt-1 text-sm'>
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                {children}
            </div>
        </section>
    );
}
