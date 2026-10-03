'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { Button } from '@/components/tailgrids/core/button';
import { EmptyState } from '@/components/ui/data-state';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { Group } from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { CalendarTime, ChevronLeft, ChevronRight } from '@tailgrids/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays, minutesOf, weekdayOf } from './calendar';

function nowMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

/** Joriy vaqt, daqiqada bir yangilanadi — "Hozir" belgisi uchun. */
function useNowMinutes(): number {
    const [now, setNow] = useState(nowMinutes);

    useEffect(() => {
        const timer = setInterval(() => setNow(nowMinutes()), 60_000);
        return () => clearInterval(timer);
    }, []);

    return now;
}

/**
 * Tanlangan kunning darslari soat tartibida: vaqt, guruhning to'liq nomi,
 * kurs, xona, o'qituvchi. Bugun uchun ketayotgan dars "Hozir" bilan
 * ajraladi, tugaganlari xiralashadi. Qator bosilsa — guruh sahifasi.
 */
export function DayLessons({
    date,
    today,
    lessons,
    showBranch,
    onSelect,
}: {
    date: string;
    today: string;
    lessons: Group[];
    showBranch: boolean;
    onSelect: (date: string) => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const now = useNowMinutes();
    const isToday = date === today;

    return (
        <section className='border-card-border bg-card-background min-w-0 rounded-xl border shadow-xs'>
            <header className='border-card-border flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5'>
                <div className='min-w-0'>
                    <h2 className='font-display text-text-primary text-base font-semibold'>
                        {t(`weekdayLong.${weekdayOf(date)}` as TranslationKey)}
                        <span className='text-text-tertiary ml-2 text-sm font-medium tabular-nums'>
                            {formatDate(date)}
                        </span>
                    </h2>
                    <p className='text-text-tertiary text-xs'>
                        {t('schedule.lessonsCount', { count: lessons.length })}
                    </p>
                </div>
                <div className='flex shrink-0 items-center gap-1.5'>
                    <Button
                        appearance='outline'
                        size='sm'
                        iconOnly
                        aria-label={t('schedule.previousDay')}
                        onPress={() => onSelect(addDays(date, -1))}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        appearance='outline'
                        size='sm'
                        iconOnly
                        aria-label={t('schedule.nextDay')}
                        onPress={() => onSelect(addDays(date, 1))}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </header>

            {lessons.length === 0 ? (
                <div className='p-6'>
                    <EmptyState
                        message={t('schedule.noLessonsDay')}
                        icon={<CalendarTime className='size-5' />}
                    />
                </div>
            ) : (
                <ul className='divide-card-border divide-y'>
                    {lessons.map((group) => {
                        const start = minutesOf(group.lesson_start);
                        const end = minutesOf(group.lesson_end);
                        const live = isToday && now >= start && now < end;
                        const ended = isToday && now >= end;

                        return (
                            <li key={group.id}>
                                <Link
                                    href={`/groups/${group.id}`}
                                    className={cn(
                                        'hover:bg-card-surface-area/70 flex gap-4 px-4 py-3.5 transition-colors sm:px-5',
                                        live && 'bg-brand-accent/5',
                                        ended && 'opacity-60',
                                    )}
                                >
                                    <div className='w-14 shrink-0 tabular-nums'>
                                        <p className='text-text-primary text-sm font-semibold'>
                                            {group.lesson_start}
                                        </p>
                                        <p className='text-text-tertiary text-xs'>
                                            {group.lesson_end}
                                        </p>
                                    </div>

                                    <span
                                        className={cn(
                                            'w-1 shrink-0 self-stretch rounded-full',
                                            live
                                                ? 'bg-brand-accent'
                                                : 'bg-card-border',
                                        )}
                                        aria-hidden='true'
                                    />

                                    <div className='min-w-0 flex-1'>
                                        <p className='text-text-primary flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold'>
                                            <span className='break-words'>
                                                {group.name}
                                            </span>
                                            {live && (
                                                <Badge
                                                    size='sm'
                                                    color='success'
                                                >
                                                    {t('schedule.now')}
                                                </Badge>
                                            )}
                                            {ended && (
                                                <Badge size='sm' color='gray'>
                                                    {t('schedule.ended')}
                                                </Badge>
                                            )}
                                        </p>
                                        <p className='text-text-secondary mt-0.5 text-xs'>
                                            {[
                                                group.course.name,
                                                group.room?.name,
                                                showBranch && group.branch.name,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                        <p className='text-text-tertiary mt-0.5 text-xs'>
                                            {group.teacher
                                                ? fullName(group.teacher)
                                                : t('schedule.noTeacher')}
                                            <span className='sm:hidden'>
                                                {' · '}
                                                {t('schedule.studentsCount', {
                                                    count: group.students_count,
                                                })}
                                            </span>
                                        </p>
                                    </div>

                                    <p className='text-text-tertiary hidden shrink-0 self-center text-xs tabular-nums sm:block'>
                                        {t('schedule.studentsCount', {
                                            count: group.students_count,
                                        })}
                                    </p>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
