'use client';

import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { WEEKDAYS, type Group } from '@/types/api';
import { cn } from '@/utils/cn';
import { monthOf } from './calendar';
import { getGroupPalette } from './palette';

/** Katakda ko'rinadigan darslar soni; qolgani "+N ta". */
const VISIBLE_LESSONS = 3;

/**
 * Oy kalendari: olti hafta, har katakda shu kungi darslar. Sana bosilsa —
 * o'sha kunning to'liq jadvali, dars bosilsa — uning tafsiloti.
 */
export function MonthGrid({
    dates,
    month,
    lessons,
    today,
    onOpenDay,
    onSelect,
}: {
    dates: string[];
    /** `YYYY-MM` — qo'shni oylar kunlari xiraroq ko'rinadi. */
    month: string;
    lessons: Map<string, Group[]>;
    today: string;
    onOpenDay: (date: string) => void;
    onSelect: (group: Group, date: string) => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();

    return (
        <div className='border-card-border bg-card-background overflow-hidden rounded-xl border shadow-xs'>
            <div className='border-card-border bg-card-surface-area grid grid-cols-7 border-b'>
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className='text-text-tertiary py-2 text-center text-[11px] font-medium uppercase'
                    >
                        {t(`weekday.${day}` as TranslationKey)}
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-7'>
                {dates.map((date, index) => {
                    const list = lessons.get(date) ?? [];
                    const inMonth = monthOf(date) === month;
                    const isToday = date === today;
                    const hidden = list.length - VISIBLE_LESSONS;

                    return (
                        <div
                            key={date}
                            className={cn(
                                'border-card-border flex min-h-20 min-w-0 flex-col gap-1 border-b p-1 sm:min-h-28 sm:p-1.5',
                                index % 7 !== 6 && 'border-r',
                                index >= 35 && 'border-b-0',
                                !inMonth && 'bg-card-surface-area/60',
                            )}
                        >
                            <button
                                type='button'
                                onClick={() => onOpenDay(date)}
                                aria-label={`${formatDate(date)} — ${t('schedule.lessonsCount', { count: list.length })}`}
                                className={cn(
                                    'hover:bg-card-border/50 mx-auto flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors sm:mx-0',
                                    isToday
                                        ? 'bg-brand-500 hover:bg-brand-500 text-white'
                                        : inMonth
                                          ? 'text-text-primary'
                                          : 'text-text-tertiary',
                                )}
                            >
                                {Number(date.slice(8))}
                            </button>

                            {/* Telefonda katak tor — darslar rangli nuqta bo'lib ko'rinadi. */}
                            {list.length > 0 && (
                                <button
                                    type='button'
                                    onClick={() => onOpenDay(date)}
                                    tabIndex={-1}
                                    aria-hidden='true'
                                    className='flex flex-wrap justify-center gap-0.5 sm:hidden'
                                >
                                    {list.slice(0, 4).map((group) => (
                                        <span
                                            key={group.id}
                                            className={cn(
                                                'size-1.5 rounded-full',
                                                getGroupPalette(group.id)
                                                    .accent,
                                            )}
                                        />
                                    ))}
                                </button>
                            )}

                            <ul className='hidden min-w-0 flex-col gap-0.5 sm:flex'>
                                {list.slice(0, VISIBLE_LESSONS).map((group) => {
                                    const palette = getGroupPalette(group.id);
                                    return (
                                        <li key={group.id} className='min-w-0'>
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    onSelect(group, date)
                                                }
                                                className={cn(
                                                    'flex w-full min-w-0 items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] transition-colors hover:brightness-95',
                                                    palette.bg,
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'size-1.5 shrink-0 rounded-full',
                                                        palette.accent,
                                                    )}
                                                    aria-hidden='true'
                                                />
                                                <span
                                                    className={cn(
                                                        'shrink-0 tabular-nums',
                                                        palette.subtext,
                                                    )}
                                                >
                                                    {group.lesson_start}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'truncate font-medium',
                                                        palette.text,
                                                    )}
                                                >
                                                    {group.name}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                                {hidden > 0 && (
                                    <li>
                                        <button
                                            type='button'
                                            onClick={() => onOpenDay(date)}
                                            className='text-text-secondary hover:text-text-primary px-1 text-[11px] font-medium'
                                        >
                                            {t('schedule.more', {
                                                count: hidden,
                                            })}
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
