'use client';

import { Button } from '@/components/tailgrids/core/button';
import { formatMonth } from '@/components/ui/month-switcher';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { WEEKDAYS } from '@/types/api';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from '@tailgrids/icons';
import { addMonths, monthGridDates, monthOf } from './calendar';

/**
 * Oy kalendari: sana bosilsa, o'sha kunning darslari yonida ochiladi. Har
 * kun ostidagi son — o'sha kungi darslar soni, darsi yo'q kunda son yo'q.
 */
export function MonthCalendar({
    selected,
    today,
    counts,
    onSelect,
    onNavigate,
}: {
    selected: string;
    today: string;
    counts: Map<string, number>;
    /** Kun bosildi. */
    onSelect: (date: string) => void;
    /** Oy strelkalari va "Bugun" — sana o'zgaradi, lekin kun tanlanmagan. */
    onNavigate: (date: string) => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const month = monthOf(selected);
    const dates = monthGridDates(selected);

    return (
        <section className='border-card-border bg-card-background rounded-xl border p-3 shadow-xs sm:p-4'>
            <div className='mb-3 flex items-center justify-between gap-2'>
                <Button
                    appearance='outline'
                    size='sm'
                    iconOnly
                    aria-label={t('common.prevMonth')}
                    onPress={() => onNavigate(addMonths(selected, -1))}
                >
                    <ChevronLeft />
                </Button>
                <h2
                    aria-live='polite'
                    className='font-display text-text-primary text-base font-semibold'
                >
                    {formatMonth(month, t)}
                </h2>
                <Button
                    appearance='outline'
                    size='sm'
                    iconOnly
                    aria-label={t('common.nextMonth')}
                    onPress={() => onNavigate(addMonths(selected, 1))}
                >
                    <ChevronRight />
                </Button>
            </div>

            <div className='grid grid-cols-7 gap-1'>
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className='text-text-tertiary pb-1 text-center text-xs font-medium uppercase'
                    >
                        {t(`weekday.${day}` as TranslationKey)}
                    </div>
                ))}

                {dates.map((date) => {
                    const count = counts.get(date) ?? 0;
                    const isSelected = date === selected;
                    const isToday = date === today;
                    const inMonth = monthOf(date) === month;

                    return (
                        <button
                            key={date}
                            type='button'
                            onClick={() => onSelect(date)}
                            aria-pressed={isSelected}
                            aria-label={`${formatDate(date)} — ${t('schedule.lessonsCount', { count })}`}
                            className={cn(
                                'flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-sm tabular-nums transition-colors',
                                isSelected
                                    ? 'bg-brand-500 text-white'
                                    : 'hover:bg-card-border/50',
                                !isSelected &&
                                    isToday &&
                                    'ring-brand-accent text-brand-accent font-semibold ring-1 ring-inset',
                                !isSelected &&
                                    !isToday &&
                                    (inMonth
                                        ? 'text-text-primary'
                                        : 'text-text-tertiary/60'),
                            )}
                        >
                            <span className='leading-none font-medium'>
                                {Number(date.slice(8))}
                            </span>
                            <span
                                className={cn(
                                    'text-xs leading-none font-semibold',
                                    isSelected
                                        ? 'text-white/85'
                                        : inMonth
                                          ? 'text-brand-accent'
                                          : 'text-text-tertiary/60',
                                    count === 0 && 'invisible',
                                )}
                                aria-hidden='true'
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className='border-card-border mt-3 flex items-center justify-between gap-2 border-t pt-3'>
                <p className='text-text-tertiary text-xs'>
                    {t('schedule.calendarHint')}
                </p>
                <Button
                    appearance='outline'
                    size='sm'
                    isDisabled={selected === today}
                    onPress={() => onNavigate(today)}
                >
                    {t('schedule.today')}
                </Button>
            </div>
        </section>
    );
}
