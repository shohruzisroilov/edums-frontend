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
    /** Matn yoki qisqa qator (masalan, filial · holat belgisi). */
    description?: ReactNode;
    count?: number;
    actions?: ReactNode;
}) {
    return (
        <div className='flex flex-col gap-3 px-4 pt-4 pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:pt-6 sm:pb-5'>
            <div className='min-w-0'>
                <div className='flex items-center gap-2.5'>
                    <h1 className='text-text-primary font-display truncate text-xl leading-tight font-semibold tracking-[-0.015em] sm:text-2xl'>
                        {title}
                    </h1>
                    {count !== undefined && (
                        <span className='border-card-border bg-background-gray-primary text-text-tertiary shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums'>
                            {count}
                        </span>
                    )}
                </div>
                {description && (
                    <div className='text-text-tertiary mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm'>
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className='flex shrink-0 flex-wrap items-center gap-2'>
                    {actions}
                </div>
            )}
        </div>
    );
}
