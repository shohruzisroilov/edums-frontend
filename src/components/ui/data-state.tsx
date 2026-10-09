'use client';

import { Skeleton } from '@/components/tailgrids/core/skeleton';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import type { ReactNode } from 'react';

export function TableSkeleton({
    rows = 5,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <div className='flex flex-col gap-3 p-5'>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className='flex gap-4'>
                    {Array.from({ length: columns }).map((_, cellIndex) => (
                        <Skeleton key={cellIndex} className='h-5 flex-1' />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Mobil qurilmalar uchun kartochka shaklidagi skeleton.
 */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className='divide-card-border divide-y'>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className='space-y-3 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 space-y-1.5'>
                            <Skeleton className='h-4 w-3/5 rounded-md' />
                            <Skeleton className='h-3 w-2/5 rounded-md' />
                        </div>
                        <Skeleton className='h-5 w-16 rounded-full' />
                    </div>
                    <div className='flex items-center justify-between pt-1'>
                        <Skeleton className='h-3.5 w-28 rounded-md' />
                        <Skeleton className='h-3.5 w-20 rounded-md' />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Avtomatik adaptiv skeleton: mobilda CardList, desktopda TableSkeleton.
 */
export function DataListSkeleton({
    rows = 5,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <>
            <div className='md:hidden'>
                <CardListSkeleton count={rows} />
            </div>
            <div className='hidden md:block'>
                <TableSkeleton rows={rows} columns={columns} />
            </div>
        </>
    );
}

/**
 * Bo'sh ro'yxat — bu ham holat, shuning uchun kulrang matn bilan
 * cheklanmaymiz: nima yo'qligi aytiladi va keyingi qadam taklif qilinadi.
 */
export function EmptyState({
    message,
    hint,
    icon,
    action,
}: {
    message: string;
    hint?: string;
    icon?: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className='flex flex-col items-center justify-center px-5 py-14 text-center'>
            {icon && (
                <div
                    aria-hidden='true'
                    className='border-card-border bg-background-gray-secondary/80 text-icon-secondary mb-4 flex size-14 items-center justify-center rounded-2xl border shadow-xs transition-transform duration-200 hover:scale-105 [&>svg]:size-6'
                >
                    {icon}
                </div>
            )}
            <p className='text-text-primary text-base font-semibold tracking-[-0.01em]'>
                {message}
            </p>
            {hint && (
                <p className='text-text-tertiary mt-1.5 max-w-sm text-xs leading-relaxed sm:text-sm'>
                    {hint}
                </p>
            )}
            {action && <div className='mt-5'>{action}</div>}
        </div>
    );
}

export function ErrorState({ error }: { error: unknown }) {
    const t = useT();
    const message = apiErrorMessage(error, t);

    return (
        <div
            role='alert'
            className='border-alert-danger-border bg-alert-danger-background text-alert-danger-title mx-5 my-6 rounded-lg border px-4 py-3 text-sm'
        >
            {message}
        </div>
    );
}
