import type { ReactNode } from 'react';

/**
 * Sahifa sarlavhasi. Yozuvlar soni sarlavha yonidagi belgida turadi —
 * "nechta yozuv bor" degan savol ro'yxat sahifasida birinchi bo'lib
 * tug'iladi, uni pastdagi sahifalash qatorigacha kutish shart emas.
 */
export function PageHeader({
    title,
    description,
    count,
    actions,
}: {
    title: string;
    description?: string;
    count?: number;
    actions?: ReactNode;
}) {
    return (
        <div className='flex flex-col gap-4 px-5 pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0'>
                <div className='flex items-center gap-2.5'>
                    <h1 className='text-text-primary font-display truncate text-2xl leading-tight font-semibold tracking-[-0.015em]'>
                        {title}
                    </h1>
                    {count !== undefined && (
                        <span className='border-card-border bg-background-gray-primary text-text-tertiary shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums'>
                            {count}
                        </span>
                    )}
                </div>
                {description && (
                    <p className='text-text-tertiary mt-1.5 text-sm'>
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className='flex shrink-0 items-center gap-2'>
                    {actions}
                </div>
            )}
        </div>
    );
}
