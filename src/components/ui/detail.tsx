import { ArrowLeft } from '@tailgrids/icons';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Batafsil sahifa tepasidagi "ro'yxatga qaytish" havolasi. */
export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <div className='px-5 pt-6'>
            <Link
                href={href}
                className='text-text-tertiary hover:text-text-primary inline-flex items-center gap-1.5 text-sm transition-colors'
            >
                <ArrowLeft className='size-4' />
                {label}
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
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className='mt-8 px-5'>
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
