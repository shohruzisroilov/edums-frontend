'use client';

import { useFormat } from '@/hooks/use-format';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

/** Umumiy sonning qismlari — kartadagi ulush chizig'i shundan quriladi. */
export interface StatSegment {
    label: string;
    value: number;
    /** Tailwind fon klassi. */
    color: string;
}

/**
 * Statistika kartasi. Raqamning o'zi kam narsa aytadi, shuning uchun uning
 * ostida tarkibi bitta chiziqda ko'rsatiladi: qismlar nisbati bir qarashda
 * o'qiladi, aniq sonlar esa yonidagi ro'yxatda qoladi.
 */
export function StatCard({
    label,
    value,
    segments,
    hint,
    icon,
}: {
    label: string;
    value: number | string;
    segments?: StatSegment[];
    hint?: string;
    icon?: ReactNode;
}) {
    const { formatNumber } = useFormat();

    const total = segments?.reduce((sum, s) => sum + s.value, 0) ?? 0;
    const visible = segments?.filter((s) => s.value > 0) ?? [];

    return (
        <div className='border-card-border bg-card-background hover:border-border-secondary-alt rounded-xl border p-5 transition-colors'>
            <div className='flex items-start justify-between gap-3'>
                <p className='text-text-tertiary text-[0.8125rem] font-medium'>
                    {label}
                </p>
                {icon && (
                    <span className='text-icon-tertiary' aria-hidden='true'>
                        {icon}
                    </span>
                )}
            </div>

            {/*
                Hero raqam: interfeys shrifti (display emas) va proporsional
                raqamlar — katta o'lchamda `tabular-nums` sonni bo'shashtirib
                yuboradi.
            */}
            <p className='text-text-primary mt-3 text-[2rem] leading-none font-semibold'>
                {typeof value === 'number' ? formatNumber(value) : value}
            </p>

            {visible.length > 0 && total > 0 && (
                <>
                    <div
                        className='bg-background-gray-primary mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full'
                        aria-hidden='true'
                    >
                        {visible.map((segment) => (
                            <span
                                key={segment.label}
                                className={cn('h-full', segment.color)}
                                style={{
                                    width: `${(segment.value / total) * 100}%`,
                                }}
                            />
                        ))}
                    </div>

                    <ul className='mt-3 flex flex-wrap gap-x-4 gap-y-1'>
                        {visible.map((segment) => (
                            <li
                                key={segment.label}
                                className='text-text-tertiary flex items-center gap-1.5 text-xs'
                            >
                                <span
                                    className={cn(
                                        'size-1.5 rounded-full',
                                        segment.color,
                                    )}
                                    aria-hidden='true'
                                />
                                {segment.label}
                                <span className='text-text-secondary font-medium tabular-nums'>
                                    {formatNumber(segment.value)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {hint && !visible.length && (
                <p className='text-text-tertiary mt-3 text-xs'>{hint}</p>
            )}
        </div>
    );
}
