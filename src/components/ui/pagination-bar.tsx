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
        <div className='border-card-border flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-text-tertiary text-sm tabular-nums'>
                {t('pagination.summary', {
                    count: formatNumber(count),
                    from: formatNumber(from),
                    to: formatNumber(to),
                })}
            </p>

            <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                <div className='text-text-tertiary flex items-center gap-2 text-sm'>
                    <span id={perPageId}>{t('pagination.perPage')}</span>
                    <Select
                        value={String(limit)}
                        onValueChange={(next) => {
                            onLimitChange(Number(next));
                            onOffsetChange(0);
                        }}
                    >
                        <SelectTrigger
                            aria-labelledby={perPageId}
                            className='h-9.5 w-auto gap-1.5 px-3 tabular-nums'
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='min-w-0'>
                            {PAGE_SIZES.map((size) => (
                                <SelectItem
                                    key={size}
                                    value={String(size)}
                                    className='tabular-nums'
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
                        size='md'
                        isDisabled={offset === 0}
                        onPress={() =>
                            onOffsetChange(Math.max(0, offset - limit))
                        }
                    >
                        {t('pagination.prev')}
                    </Button>
                    <span className='text-text-tertiary px-2 text-sm whitespace-nowrap tabular-nums'>
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        appearance='outline'
                        size='md'
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
