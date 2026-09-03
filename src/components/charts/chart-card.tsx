'use client';

import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

export interface Datum {
    key: string;
    label: string;
    value: number;
    /** CSS rang qiymati — token orqali beriladi. */
    color: string;
}

/** Chart uchun umumiy karta: sarlavha, tavsif va kontent. */
export function ChartCard({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'border-card-border bg-card-background flex flex-col rounded-xl border p-5',
                className,
            )}
        >
            <div className='mb-5'>
                <h2 className='text-text-primary font-display text-base font-semibold'>
                    {title}
                </h2>
                {description && (
                    <p className='text-text-tertiary mt-1 text-xs'>
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

/**
 * Legenda. Ikki va undan ortiq seriya uchun doim ko'rsatiladi — shunda
 * ma'noni faqat rang tashimaydi. Qiymat yonida turadi, shuning uchun
 * tooltip yagona o'qish yo'li bo'lib qolmaydi.
 */
export function ChartLegend({
    items,
    total,
    formatValue,
}: {
    items: Datum[];
    total: number;
    formatValue: (value: number) => string;
}) {
    return (
        <ul className='mt-5 flex flex-col gap-2.5'>
            {items.map((item) => (
                <li
                    key={item.key}
                    className='flex items-center justify-between gap-3 text-sm'
                >
                    <span className='text-text-secondary flex min-w-0 items-center gap-2.5'>
                        <span
                            aria-hidden='true'
                            className='size-2.5 shrink-0 rounded-[3px]'
                            style={{ backgroundColor: item.color }}
                        />
                        <span className='truncate'>{item.label}</span>
                    </span>
                    <span className='text-text-primary shrink-0 font-medium tabular-nums'>
                        {formatValue(item.value)}
                        {total > 0 && (
                            <span className='text-text-tertiary ml-2 font-normal'>
                                {Math.round((item.value / total) * 100)}%
                            </span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** Ma'lumot yo'q holati — bo'sh chart chizishdan ko'ra aniqroq. */
export function ChartEmpty({ message }: { message: string }) {
    return (
        <p className='text-text-tertiary flex flex-1 items-center justify-center py-10 text-sm'>
            {message}
        </p>
    );
}
