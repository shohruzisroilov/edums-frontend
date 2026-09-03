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
        <div className='flex flex-col items-center px-5 py-14 text-center'>
            {icon && (
                <span
                    aria-hidden='true'
                    className='border-card-border bg-background-gray-primary text-icon-tertiary mb-4 flex size-12 items-center justify-center rounded-full border'
                >
                    {icon}
                </span>
            )}
            <p className='text-text-primary text-sm font-medium'>{message}</p>
            {hint && (
                <p className='text-text-tertiary mt-1 max-w-sm text-sm'>
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
            className='mx-5 my-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
        >
            {message}
        </div>
    );
}
