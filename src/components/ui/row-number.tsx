'use client';

import { TableCell, TableHead } from '@/components/tailgrids/core/table';
import { useT } from '@/i18n/provider';

/** Jadvalning birinchi ustuni — tartib raqami (№). */
export function RowNumberHead() {
    const t = useT();

    return <TableHead className='w-px pr-1'>{t('common.rowNumber')}</TableHead>;
}

/**
 * Sahifalangan ro'yxatda `offset` beriladi — ikkinchi sahifa 21 dan
 * boshlanadi, 1 dan emas.
 */
export function RowNumberCell({
    index,
    offset = 0,
}: {
    index: number;
    offset?: number;
}) {
    return (
        <TableCell className='text-text-tertiary w-px pr-1 tabular-nums'>
            {offset + index + 1}
        </TableCell>
    );
}
