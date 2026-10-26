'use client';

import { TableHead } from '@/components/tailgrids/core/table';
import { cn } from '@/utils/cn';
import { ChevronBothDirection, ChevronDown, ChevronUp } from '@tailgrids/icons';
import type { ComponentProps, ReactNode } from 'react';

export interface SortableHeadProps extends Omit<
    ComponentProps<'th'>,
    'children'
> {
    field: string;
    currentSort?: string | null;
    currentOrder?: 'asc' | 'desc' | null;
    onSort: (field: string, defaultOrder?: 'asc' | 'desc') => void;
    defaultOrder?: 'asc' | 'desc';
    numeric?: boolean;
    children: ReactNode;
}

export function SortableHead({
    field,
    currentSort,
    currentOrder,
    onSort,
    defaultOrder = 'asc',
    numeric,
    children,
    className,
    ...props
}: SortableHeadProps) {
    const isActive = currentSort === field;
    const isAsc = isActive && currentOrder === 'asc';
    const isDesc = isActive && currentOrder === 'desc';

    const ariaSort = !isActive ? 'none' : isAsc ? 'ascending' : 'descending';

    return (
        <TableHead
            numeric={numeric}
            aria-sort={ariaSort}
            className={cn('group/th p-0 select-none', className)}
            {...props}
        >
            <button
                type='button'
                onClick={() => onSort(field, defaultOrder)}
                className={cn(
                    'flex w-full items-center gap-1.5 px-3 py-2.5 text-xs font-semibold tracking-[0.06em] uppercase transition-colors sm:px-5 sm:py-3.5',
                    numeric ? 'justify-end' : 'justify-start',
                    isActive
                        ? 'text-primary font-bold'
                        : 'text-text-tertiary hover:text-text-primary',
                )}
            >
                <span>{children}</span>
                <span
                    className={cn(
                        'inline-flex shrink-0 items-center transition-all',
                        isActive
                            ? 'text-primary scale-110 opacity-100'
                            : 'text-text-tertiary/40 group-hover/th:text-text-secondary opacity-0 group-hover/th:opacity-100',
                    )}
                >
                    {isAsc ? (
                        <ChevronUp className='size-3.5 stroke-[2.5]' />
                    ) : isDesc ? (
                        <ChevronDown className='size-3.5 stroke-[2.5]' />
                    ) : (
                        <ChevronBothDirection className='size-3.5 stroke-[1.5]' />
                    )}
                </span>
            </button>
        </TableHead>
    );
}
