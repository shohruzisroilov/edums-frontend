'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/shadcn/select';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { useId } from 'react';

const PAGE_SIZES = [10, 20, 50, 100];

/**
 * Backend limit/offset bilan ishlaydi, shuning uchun sahifa raqami emas,
 * aynan shu ikki qiymat boshqariladi.
 */
export function PaginationBar({
    count,
    limit,
    offset,
    onOffsetChange,
    onLimitChange,
}: {
    count: number;
    limit: number;
    offset: number;
    onOffsetChange: (offset: number) => void;
    onLimitChange: (limit: number) => void;
}) {
    const t = useT();
    const { formatNumber } = useFormat();
    const perPageId = useId();

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(count / limit));
    const from = count === 0 ? 0 : offset + 1;
    const to = Math.min(offset + limit, count);

    return (
        <div className='border-card-border flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
            <p className='text-text-tertiary text-center text-xs tabular-nums sm:text-left sm:text-sm'>
                {t('pagination.summary', {
                    count: formatNumber(count),
                    from: formatNumber(from),
                    to: formatNumber(to),
                })}
            </p>

            <div className='flex items-center justify-between gap-3 sm:justify-end'>
                <div className='text-text-tertiary flex items-center gap-1.5 text-xs sm:text-sm'>
                    <span id={perPageId} className='hidden sm:inline'>
                        {t('pagination.perPage')}
                    </span>
                    <Select
                        value={String(limit)}
                        onValueChange={(next) => {
                            onLimitChange(Number(next));
                            onOffsetChange(0);
                        }}
                    >
                        <SelectTrigger
                            aria-labelledby={perPageId}
                            className='h-8.5 w-auto gap-1 px-2.5 text-xs tabular-nums sm:h-9.5 sm:text-sm'
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='min-w-0'>
                            {PAGE_SIZES.map((size) => (
                                <SelectItem
                                    key={size}
                                    value={String(size)}
                                    className='text-xs tabular-nums sm:text-sm'
                                >
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex items-center gap-1.5'>
                    <Button
                        appearance='outline'
                        size='sm'
                        isDisabled={offset === 0}
                        onPress={() =>
                            onOffsetChange(Math.max(0, offset - limit))
                        }
                    >
                        {t('pagination.prev')}
                    </Button>
                    <span className='text-text-tertiary px-1 text-xs font-medium whitespace-nowrap tabular-nums sm:text-sm'>
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        appearance='outline'
                        size='sm'
                        isDisabled={offset + limit >= count}
                        onPress={() => onOffsetChange(offset + limit)}
                    >
                        {t('pagination.next')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
