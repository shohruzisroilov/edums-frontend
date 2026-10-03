'use client';

import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { Group } from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { useEffect, useRef, useState } from 'react';
import { hourBounds, layoutDay, minutesOf, weekdayOf } from './calendar';
import { getGroupPalette } from './palette';

/** Bir soat to'rda necha piksel. */
const HOUR_HEIGHT = 56;

/** Blok shundan past bo'lsa, faqat nomi va vaqti sig'adi. */
const DETAILS_MIN_HEIGHT = 52;

function nowMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

/** Joriy vaqt, daqiqada bir yangilanadi — "hozir" chizig'i uchun. */
function useNowMinutes(): number {
    const [now, setNow] = useState(nowMinutes);

    useEffect(() => {
        const timer = setInterval(() => setNow(nowMinutes()), 60_000);
        return () => clearInterval(timer);
    }, []);

    return now;
}

function hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Vaqt to'ri: chapda soatlar, har bir sana — ustun. Dars bloki boshlanish
 * vaqtidan tushadi va davomiyligicha cho'ziladi; vaqti kesishgan darslar
 * yonma-yon turadi. Bugungi ustunda joriy vaqt chizig'i bor.
 */
export function TimeGrid({
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
    /** Haftalik ko'rinishda sana sarlavhasi bosilsa — o'sha kun. */
    onOpenDay?: (date: string) => void;
}) {
    const t = useT();
    const now = useNowMinutes();
    const scrollRef = useRef<HTMLDivElement>(null);

    const shown = dates.flatMap((date) => lessons.get(date) ?? []);
    const { from, to } = hourBounds(shown);
    const hours = Array.from({ length: to - from }, (_, i) => from + i);
    const height = (to - from) * HOUR_HEIGHT;
    const offset = (minutes: number) =>
        ((minutes - from * 60) / 60) * HOUR_HEIGHT;

    const firstStart = shown.length
        ? Math.min(...shown.map((group) => minutesOf(group.lesson_start)))
        : null;
    const showsToday = dates.includes(today);
    const firstDate = dates[0];
    const dayCount = dates.length;

    // Ochilganda to'r kerakli joyga suriladi: bugun ko'rinsa — joriy vaqtga,
    // aks holda birinchi darsga.
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;
        const target = showsToday ? nowMinutes() - 60 : (firstStart ?? 0) - 30;
        element.scrollTop = Math.max(
            0,
            ((target - from * 60) / 60) * HOUR_HEIGHT,
        );
    }, [firstDate, dayCount, showsToday, firstStart, from]);

    const columns = `3.5rem repeat(${dayCount}, minmax(${
        dayCount > 1 ? '7.5rem' : '0'
    }, 1fr))`;

    return (
        <div
            ref={scrollRef}
            className='border-card-border bg-card-background max-h-[calc(100dvh-15rem)] min-h-96 overflow-auto rounded-xl border shadow-xs'
        >
            <div className='grid' style={{ gridTemplateColumns: columns }}>
                {/* Sarlavha qatori — to'r surilganda tepada qoladi. Bitta kunda
                    sarlavha kerak emas: sana tepadagi hafta tasmasida. */}
                {dayCount > 1 && (
                    <>
                        <div className='border-card-border bg-card-surface-area sticky top-0 left-0 z-40 border-r border-b' />
                        {dates.map((date) => {
                            const isToday = date === today;
                            const label = (
                                <>
                                    <span
                                        className={cn(
                                            'block text-[11px] font-medium uppercase',
                                            isToday
                                                ? 'text-brand-accent'
                                                : 'text-text-tertiary',
                                        )}
                                    >
                                        {t(
                                            `weekday.${weekdayOf(date)}` as TranslationKey,
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            'mx-auto mt-0.5 flex size-8 items-center justify-center rounded-full text-base font-semibold tabular-nums',
                                            isToday
                                                ? 'bg-brand-500 text-white'
                                                : 'text-text-primary',
                                        )}
                                    >
                                        {Number(date.slice(8))}
                                    </span>
                                </>
                            );

                            return (
                                <div
                                    key={date}
                                    className='border-card-border bg-card-surface-area sticky top-0 z-30 border-r border-b py-2 text-center last:border-r-0'
                                >
                                    {onOpenDay ? (
                                        <button
                                            type='button'
                                            onClick={() => onOpenDay(date)}
                                            aria-label={t(
                                                `weekdayLong.${weekdayOf(date)}` as TranslationKey,
                                            )}
                                            className='hover:bg-card-border/40 rounded-lg px-3 py-0.5 transition-colors'
                                        >
                                            {label}
                                        </button>
                                    ) : (
                                        label
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}

                {/* Soatlar ustuni */}
                <div
                    className='border-card-border bg-card-surface-area sticky left-0 z-20 border-r'
                    style={{ height }}
                    aria-hidden='true'
                >
                    {hours.map((hour, index) =>
                        index === 0 ? null : (
                            <span
                                key={hour}
                                className='text-text-tertiary absolute right-2 -translate-y-1/2 text-[11px] tabular-nums'
                                style={{ top: index * HOUR_HEIGHT }}
                            >
                                {hourLabel(hour)}
                            </span>
                        ),
                    )}
                </div>

                {dates.map((date) => {
                    const isToday = date === today;
                    const placed = layoutDay(lessons.get(date) ?? []);
                    const showNow =
                        isToday && now >= from * 60 && now <= to * 60;

                    return (
                        <div
                            key={date}
                            className={cn(
                                'border-card-border relative border-r last:border-r-0',
                                isToday && 'bg-brand-accent/5',
                            )}
                            style={{ height }}
                        >
                            {hours.map((hour, index) =>
                                index === 0 ? null : (
                                    <div
                                        key={hour}
                                        className='border-card-border/70 absolute inset-x-0 border-t'
                                        style={{ top: index * HOUR_HEIGHT }}
                                        aria-hidden='true'
                                    />
                                ),
                            )}

                            {placed.map(
                                ({ group, start, end, column, columns }) => {
                                    const palette = getGroupPalette(group.id);
                                    const top = offset(start);
                                    const blockHeight = Math.max(
                                        offset(end) - top,
                                        24,
                                    );
                                    const details = [
                                        group.room?.name,
                                        group.teacher
                                            ? fullName(group.teacher)
                                            : t('schedule.noTeacher'),
                                        showBranch && group.branch.name,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ');

                                    return (
                                        <button
                                            key={group.id}
                                            type='button'
                                            onClick={() =>
                                                onSelect(group, date)
                                            }
                                            title={`${group.name} · ${group.lesson_start}–${group.lesson_end} · ${details}`}
                                            className={cn(
                                                'absolute overflow-hidden rounded-md border py-1 pr-1.5 pl-2.5 text-left text-[11px] leading-tight transition-shadow hover:z-10 hover:shadow-md focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1',
                                                palette.bg,
                                                palette.border,
                                            )}
                                            style={{
                                                top: top + 1,
                                                height: blockHeight - 2,
                                                left: `calc(${(column / columns) * 100}% + 2px)`,
                                                width: `calc(${100 / columns}% - 4px)`,
                                            }}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute inset-y-0 left-0 w-1',
                                                    palette.accent,
                                                )}
                                                aria-hidden='true'
                                            />
                                            <span
                                                className={cn(
                                                    'block truncate font-semibold',
                                                    palette.text,
                                                )}
                                            >
                                                {group.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    'block truncate tabular-nums',
                                                    palette.subtext,
                                                )}
                                            >
                                                {group.lesson_start}–
                                                {group.lesson_end}
                                            </span>
                                            {blockHeight >=
                                                DETAILS_MIN_HEIGHT && (
                                                <span
                                                    className={cn(
                                                        'mt-0.5 block truncate',
                                                        palette.subtext,
                                                    )}
                                                >
                                                    {details}
                                                </span>
                                            )}
                                        </button>
                                    );
                                },
                            )}

                            {showNow && (
                                <div
                                    className='pointer-events-none absolute inset-x-0 z-15'
                                    style={{ top: offset(now) }}
                                    aria-hidden='true'
                                >
                                    <div className='bg-error-500 h-0.5' />
                                    <div className='bg-error-500 absolute -top-1 -left-1 size-2.5 rounded-full' />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
