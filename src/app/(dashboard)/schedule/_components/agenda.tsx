'use client';

import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { Group } from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { weekdayOf } from './calendar';
import { getGroupPalette } from './palette';

/**
 * Kunlik ko'rinish tepasidagi hafta tasmasi: kunni bir bosishda almashtirish
 * uchun (telefonda ayniqsa qulay). Darsi bor kun ostida nuqta turadi.
 */
export function WeekStrip({
    dates,
    selected,
    today,
    lessons,
    onSelect,
}: {
    dates: string[];
    selected: string;
    today: string;
    lessons: Map<string, Group[]>;
    onSelect: (date: string) => void;
}) {
    const t = useT();

    return (
        <div className='border-card-border bg-card-background mb-3 grid grid-cols-7 gap-1 rounded-xl border p-1.5 shadow-xs'>
            {dates.map((date) => {
                const isSelected = date === selected;
                const isToday = date === today;
                const count = lessons.get(date)?.length ?? 0;

                return (
                    <button
                        key={date}
                        type='button'
                        onClick={() => onSelect(date)}
                        aria-pressed={isSelected}
                        aria-label={t(
                            `weekdayLong.${weekdayOf(date)}` as TranslationKey,
                        )}
                        className={cn(
                            'flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors',
                            isSelected
                                ? 'bg-brand-accent/15'
                                : 'hover:bg-card-border/40',
                        )}
                    >
                        <span
                            className={cn(
                                'text-[11px] font-medium uppercase',
                                isSelected || isToday
                                    ? 'text-brand-accent'
                                    : 'text-text-tertiary',
                            )}
                        >
                            {t(`weekday.${weekdayOf(date)}` as TranslationKey)}
                        </span>
                        <span
                            className={cn(
                                'flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                                isToday
                                    ? 'bg-brand-500 text-white'
                                    : 'text-text-primary',
                            )}
                        >
                            {Number(date.slice(8))}
                        </span>
                        <span
                            className={cn(
                                'size-1 rounded-full',
                                count > 0
                                    ? 'bg-brand-accent'
                                    : 'bg-transparent',
                            )}
                            aria-hidden='true'
                        />
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Ro'yxat ko'rinishi: haftaning har bir kuni sanasi bilan, ostida darslar
 * vaqt tartibida. Telefonda to'rdan ko'ra o'qish oson.
 */
export function AgendaList({
    dates,
    lessons,
    today,
    showBranch,
    onSelect,
    onOpenDay,
}: {
    dates: string[];
    lessons: Map<string, Group[]>;
    today: string;
    showBranch: boolean;
    onSelect: (group: Group, date: string) => void;
    onOpenDay: (date: string) => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();

    return (
        <div className='flex flex-col gap-3'>
            {dates.map((date) => {
                const list = lessons.get(date) ?? [];
                const isToday = date === today;

                return (
                    <section
                        key={date}
                        aria-label={formatDate(date)}
                        className={cn(
                            'border-card-border bg-card-background rounded-xl border shadow-xs',
                            isToday && 'border-brand-accent/40',
                        )}
                    >
                        <button
                            type='button'
                            onClick={() => onOpenDay(date)}
                            className='hover:bg-card-surface-area/60 flex w-full items-center gap-3 rounded-t-xl px-4 py-2.5 text-left transition-colors'
                        >
                            <span
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold tabular-nums',
                                    isToday
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-card-surface-area text-text-primary',
                                )}
                            >
                                {Number(date.slice(8))}
                            </span>
                            <span className='min-w-0 flex-1'>
                                <span className='text-text-primary block text-sm font-semibold'>
                                    {t(
                                        `weekdayLong.${weekdayOf(date)}` as TranslationKey,
                                    )}
                                </span>
                                <span className='text-text-tertiary block text-xs tabular-nums'>
                                    {formatDate(date)}
                                </span>
                            </span>
                            <span className='text-text-tertiary shrink-0 text-xs'>
                                {list.length > 0
                                    ? t('schedule.lessonsCount', {
                                          count: list.length,
                                      })
                                    : t('schedule.noLessons')}
                            </span>
                        </button>

                        {list.length > 0 && (
                            <ul className='divide-card-border border-card-border divide-y border-t'>
                                {list.map((group) => {
                                    const palette = getGroupPalette(group.id);
                                    return (
                                        <li key={group.id}>
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    onSelect(group, date)
                                                }
                                                className='hover:bg-card-surface-area/60 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors last:rounded-b-xl'
                                            >
                                                <span
                                                    className={cn(
                                                        'h-9 w-1 shrink-0 rounded-full',
                                                        palette.accent,
                                                    )}
                                                    aria-hidden='true'
                                                />
                                                <span className='text-text-primary w-24 shrink-0 text-xs font-semibold tabular-nums'>
                                                    {group.lesson_start}–
                                                    {group.lesson_end}
                                                </span>
                                                <span className='min-w-0 flex-1'>
                                                    <span className='text-text-primary block truncate text-sm font-medium'>
                                                        {group.name}
                                                    </span>
                                                    <span className='text-text-tertiary block truncate text-xs'>
                                                        {[
                                                            group.course.name,
                                                            group.room?.name,
                                                            group.teacher
                                                                ? fullName(
                                                                      group.teacher,
                                                                  )
                                                                : t(
                                                                      'schedule.noTeacher',
                                                                  ),
                                                            showBranch &&
                                                                group.branch
                                                                    .name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </span>
                                                </span>
                                                <span className='text-text-tertiary hidden shrink-0 text-xs sm:block'>
                                                    {t(
                                                        'schedule.studentsCount',
                                                        {
                                                            count: group.students_count,
                                                        },
                                                    )}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
