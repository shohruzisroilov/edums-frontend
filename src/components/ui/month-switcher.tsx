'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT, type Translate } from '@/i18n/provider';
import { ChevronLeft, ChevronRight } from '@tailgrids/icons';

/** Joriy oy `YYYY-MM` ko'rinishida (brauzer vaqti bo'yicha). */
export function currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** `YYYY-MM` ni `delta` oyga siljitadi. */
export function shiftMonth(month: string, delta: number): string {
    const [year, index] = month.split('-').map(Number);
    const date = new Date(year, index - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** "Oktabr 2026" — oy nomi joriy tilda. */
export function formatMonth(month: string, t: Translate): string {
    const [year, index] = month.split('-').map(Number);
    return `${t(`month.${index}` as Parameters<Translate>[0])} ${year}`;
}

/** Oldingi/keyingi oy tugmalari va o'rtada oy nomi. */
export function MonthSwitcher({
    month,
    onChange,
}: {
    month: string;
    onChange: (month: string) => void;
}) {
    const t = useT();

    return (
        <div className='flex items-center gap-2'>
            <Button
                appearance='outline'
                size='sm'
                iconOnly
                aria-label={t('common.prevMonth')}
                onPress={() => onChange(shiftMonth(month, -1))}
            >
                <ChevronLeft />
            </Button>
            <span className='text-text-primary min-w-32 text-center text-sm font-medium tabular-nums'>
                {formatMonth(month, t)}
            </span>
            <Button
                appearance='outline'
                size='sm'
                iconOnly
                aria-label={t('common.nextMonth')}
                onPress={() => onChange(shiftMonth(month, 1))}
            >
                <ChevronRight />
            </Button>
        </div>
    );
}
