'use client';

import { Button } from '@/components/tailgrids/core/button';
import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { getSchedule } from '@/services/api/groups';
import { listRooms } from '@/services/api/rooms';
import { listUserOptions } from '@/services/api/users';
import { WEEKDAYS, type Group, type Weekday } from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { CalendarTime, Eye, Layout20, UserMultiple1 } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type ViewMode = 'grid' | 'cards' | 'day';

const COLOR_PALETTES = [
    {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40',
        border: 'border-indigo-200 dark:border-indigo-800/60',
        text: 'text-indigo-900 dark:text-indigo-200',
        subtext: 'text-indigo-600 dark:text-indigo-400',
        accent: 'bg-indigo-500',
    },
    {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        text: 'text-emerald-900 dark:text-emerald-200',
        subtext: 'text-emerald-600 dark:text-emerald-400',
        accent: 'bg-emerald-500',
    },
    {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/60',
        text: 'text-amber-900 dark:text-amber-200',
        subtext: 'text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
    },
    {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800/60',
        text: 'text-purple-900 dark:text-purple-200',
        subtext: 'text-purple-600 dark:text-purple-400',
        accent: 'bg-purple-500',
    },
    {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-800/60',
        text: 'text-rose-900 dark:text-rose-200',
        subtext: 'text-rose-600 dark:text-rose-400',
        accent: 'bg-rose-500',
    },
    {
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        border: 'border-cyan-200 dark:border-cyan-800/60',
        text: 'text-cyan-900 dark:text-cyan-200',
        subtext: 'text-cyan-600 dark:text-cyan-400',
        accent: 'bg-cyan-500',
    },
];

function getGroupPalette(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % COLOR_PALETTES.length;
    return COLOR_PALETTES[index];
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

export default function SchedulePage() {
    return (
        <AccessGuard allow={(session) => can(session, 'groups.view')}>
            <ScheduleView />
        </AccessGuard>
    );
}

function ScheduleView() {
    const t = useT();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedDay, setSelectedDay] = useState<Weekday>(1);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const [filters, setFilters] = useState({
        branch_id: '',
        teacher_id: '',
        room_id: '',
    });

    const query = useQuery({
        queryKey: ['schedule', filters],
        queryFn: () =>
            getSchedule({
                branch_id: filters.branch_id || undefined,
                teacher_id: filters.teacher_id || undefined,
                room_id: filters.room_id || undefined,
            }),
    });

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const teachersQuery = useQuery({
        queryKey: ['user-options'],
        queryFn: listUserOptions,
    });
    const roomsQuery = useQuery({
        queryKey: ['rooms', filters.branch_id],
        queryFn: () => listRooms({ branch_id: filters.branch_id || undefined }),
    });

    const branches = branchesQuery.data ?? [];
    const scheduleData = query.data ?? [];

    return (
        <>
            <PageHeader
                title={t('schedule.title')}
                description={t('schedule.subtitle')}
                actions={
                    <div className='border-card-border bg-card-surface-area max-w-full overflow-x-auto flex items-center rounded-lg border p-1 shadow-xs'>
                        <button
                            type='button'
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-brand-accent text-white shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <Layout20 className='size-3.5' />
                            Vaqt jadvali
                        </button>
                        <button
                            type='button'
                            onClick={() => setViewMode('cards')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                viewMode === 'cards'
                                    ? 'bg-brand-accent text-white shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <CalendarTime className='size-3.5' />
                            Haftalik ro'yxat
                        </button>
                        <button
                            type='button'
                            onClick={() => setViewMode('day')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                viewMode === 'day'
                                    ? 'bg-brand-accent text-white shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            Kunlik
                        </button>
                    </div>
                }
            />

            <div className='flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 pb-4'>
                <div className='flex flex-wrap gap-3'>
                    {branches.length > 1 && (
                        <div className='w-full sm:w-48'>
                            <SelectInput
                                options={branches.map((branch) => ({
                                    value: branch.id,
                                    label: branch.name,
                                }))}
                                placeholder={t('groups.allBranches')}
                                value={filters.branch_id}
                                onValueChange={(branch_id) =>
                                    setFilters({
                                        ...filters,
                                        branch_id,
                                        room_id: '',
                                    })
                                }
                            />
                        </div>
                    )}
                    <div className='w-full sm:w-52'>
                        <SelectInput
                            options={(teachersQuery.data ?? []).map((user) => ({
                                value: user.id,
                                label: fullName(user),
                            }))}
                            placeholder={t('groups.allTeachers')}
                            value={filters.teacher_id}
                            onValueChange={(teacher_id) =>
                                setFilters({ ...filters, teacher_id })
                            }
                        />
                    </div>
                    <div className='w-full sm:w-44'>
                        <SelectInput
                            options={(roomsQuery.data ?? []).map((room) => ({
                                value: room.id,
                                label: room.name,
                            }))}
                            placeholder={t('groups.allRooms')}
                            value={filters.room_id}
                            onValueChange={(room_id) =>
                                setFilters({ ...filters, room_id })
                            }
                        />
                    </div>
                </div>

                {viewMode === 'day' && (
                    <div className='flex items-center gap-1 overflow-x-auto rounded-lg border border-card-border bg-card-surface-area p-1'>
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day}
                                type='button'
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                    selectedDay === day
                                        ? 'bg-brand-accent/15 text-brand-accent font-semibold'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                {t(`weekday.${day}` as any)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className='px-4 sm:px-5 pb-8'>
                {query.isPending ? (
                    <TableSkeleton rows={6} columns={7} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : scheduleData.length === 0 ? (
                    <div className='rounded-xl border border-card-border bg-card-background p-8'>
                        <EmptyState
                            message={t('schedule.empty')}
                            icon={<CalendarTime className='size-5' />}
                        />
                    </div>
                ) : viewMode === 'grid' ? (
                    <TimetableGrid
                        groups={scheduleData}
                        onSelectGroup={setSelectedGroup}
                        showBranch={branches.length > 1 && !filters.branch_id}
                    />
                ) : viewMode === 'day' ? (
                    <DayView
                        day={selectedDay}
                        groups={scheduleData.filter((g) =>
                            g.lesson_days.includes(selectedDay as Weekday),
                        )}
                        onSelectGroup={setSelectedGroup}
                        showBranch={branches.length > 1 && !filters.branch_id}
                    />
                ) : (
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7'>
                        {WEEKDAYS.map((day) => (
                            <DayColumn
                                key={day}
                                title={t(`weekdayLong.${day}` as any)}
                                groups={scheduleData.filter((group) =>
                                    group.lesson_days.includes(day),
                                )}
                                onSelectGroup={setSelectedGroup}
                                showBranch={
                                    branches.length > 1 && !filters.branch_id
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedGroup && (
                <Modal
                    open
                    onClose={() => setSelectedGroup(null)}
                    title={selectedGroup.name}
                    description={selectedGroup.course.name}
                    size='md'
                >
                    <div className='flex flex-col gap-4 py-2'>
                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div className='rounded-lg border border-card-border bg-card-surface-area p-3'>
                                <p className='text-xs font-medium text-text-tertiary'>
                                    Dars vaqti
                                </p>
                                <p className='mt-1 font-semibold text-text-primary tabular-nums'>
                                    {selectedGroup.lesson_start} – {selectedGroup.lesson_end}
                                </p>
                            </div>
                            <div className='rounded-lg border border-card-border bg-card-surface-area p-3'>
                                <p className='text-xs font-medium text-text-tertiary'>
                                    Xona
                                </p>
                                <p className='mt-1 font-semibold text-text-primary'>
                                    {selectedGroup.room?.name ?? '—'}
                                </p>
                            </div>
                            <div className='rounded-lg border border-card-border bg-card-surface-area p-3'>
                                <p className='text-xs font-medium text-text-tertiary'>
                                    O'qituvchi
                                </p>
                                <p className='mt-1 font-semibold text-text-primary'>
                                    {selectedGroup.teacher ? fullName(selectedGroup.teacher) : '—'}
                                </p>
                            </div>
                            <div className='rounded-lg border border-card-border bg-card-surface-area p-3'>
                                <p className='text-xs font-medium text-text-tertiary'>
                                    O'quvchilar soni
                                </p>
                                <p className='mt-1 font-semibold text-text-primary'>
                                    {selectedGroup.students_count} ta
                                </p>
                            </div>
                        </div>

                        <div className='mt-2 flex items-center justify-end gap-2'>
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => setSelectedGroup(null)}
                            >
                                Yopish
                            </Button>
                            <Link href={`/groups/${selectedGroup.id}`}>
                                <Button variant='primary' appearance='fill' size='md'>
                                    <Eye className='size-4' />
                                    Guruhga o'tish
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

/** 2D Vaqt Jadvali (Timetable Grid View) */
function TimetableGrid({
    groups,
    onSelectGroup,
    showBranch,
}: {
    groups: Group[];
    onSelectGroup: (g: Group) => void;
    showBranch: boolean;
}) {
    const t = useT();

    // Group lessons mapped by hour and day
    const lessonsByCell = useMemo(() => {
        const map = new Map<string, Group[]>();
        for (const group of groups) {
            const startHour = parseInt(group.lesson_start.split(':')[0], 10);
            for (const day of group.lesson_days) {
                const key = `${day}-${startHour}`;
                const list = map.get(key) ?? [];
                list.push(group);
                map.set(key, list);
            }
        }
        return map;
    }, [groups]);

    return (
        <div className='overflow-x-auto rounded-xl border border-card-border bg-card-background shadow-xs'>
            <table className='w-full border-collapse text-left'>
                <thead>
                    <tr className='border-b border-card-border bg-card-surface-area text-xs font-semibold text-text-primary'>
                        <th className='w-20 border-r border-card-border p-3 text-center'>
                            Vaqt
                        </th>
                        {WEEKDAYS.map((day) => (
                            <th key={day} className='min-w-[150px] border-r border-card-border p-3 text-center last:border-r-0'>
                                {t(`weekdayLong.${day}`)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='divide-y divide-card-border text-xs'>
                    {HOURS.map((hour) => {
                        const hourFormatted = `${String(hour).padStart(2, '0')}:00`;
                        return (
                            <tr key={hour} className='group hover:bg-card-surface-area/40'>
                                <td className='border-r border-card-border bg-card-surface-area/30 p-2.5 text-center font-medium tabular-nums text-text-tertiary'>
                                    {hourFormatted}
                                </td>
                                {WEEKDAYS.map((day) => {
                                    const key = `${day}-${hour}`;
                                    const cellGroups = lessonsByCell.get(key) ?? [];
                                    return (
                                        <td
                                            key={day}
                                            className='min-w-[150px] border-r border-card-border p-1.5 vertical-top last:border-r-0'
                                        >
                                            <div className='flex flex-col gap-1.5'>
                                                {cellGroups.map((group) => {
                                                    const palette = getGroupPalette(group.id);
                                                    return (
                                                        <button
                                                            key={group.id}
                                                            type='button'
                                                            onClick={() => onSelectGroup(group)}
                                                            className={cn(
                                                                'w-full text-left rounded-lg border p-2 transition-all hover:scale-[1.02] hover:shadow-xs',
                                                                palette.bg,
                                                                palette.border,
                                                            )}
                                                        >
                                                            <div className='flex items-center justify-between gap-1'>
                                                                <span
                                                                    className={cn(
                                                                        'text-[11px] font-bold tabular-nums',
                                                                        palette.text,
                                                                    )}
                                                                >
                                                                    {group.lesson_start}–{group.lesson_end}
                                                                </span>
                                                                {group.room && (
                                                                    <span
                                                                        className={cn(
                                                                            'rounded px-1 py-0.2 text-[10px] font-medium border',
                                                                            palette.border,
                                                                            palette.subtext,
                                                                        )}
                                                                    >
                                                                        {group.room.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p
                                                                className={cn(
                                                                    'mt-1 font-semibold text-xs leading-tight line-clamp-1',
                                                                    palette.text,
                                                                )}
                                                            >
                                                                {group.name}
                                                            </p>
                                                            <div className='mt-1 flex items-center justify-between text-[11px]'>
                                                                <span className={cn('line-clamp-1', palette.subtext)}>
                                                                    {group.teacher
                                                                        ? fullName(group.teacher)
                                                                        : 'O\'qituvchi yo\'q'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/** Kunlik Ko'rinish (Day View Timeline) */
function DayView({
    day,
    groups,
    onSelectGroup,
    showBranch,
}: {
    day: Weekday;
    groups: Group[];
    onSelectGroup: (g: Group) => void;
    showBranch: boolean;
}) {
    const t = useT();

    return (
        <div className='rounded-xl border border-card-border bg-card-background shadow-xs p-6'>
            <h2 className='font-display text-base font-semibold text-text-primary mb-4'>
                {t(`weekdayLong.${day}` as any)} darslari ({groups.length} ta guruh)
            </h2>

            {groups.length === 0 ? (
                <p className='text-sm text-text-tertiary py-6 text-center'>
                    Ushbu kunda darslar yo'q
                </p>
            ) : (
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {groups.map((group) => {
                        const palette = getGroupPalette(group.id);
                        return (
                            <div
                                key={group.id}
                                onClick={() => onSelectGroup(group)}
                                className={cn(
                                    'cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.01] hover:shadow-sm',
                                    palette.bg,
                                    palette.border,
                                )}
                            >
                                <div className='flex items-center justify-between gap-2 mb-2'>
                                    <span
                                        className={cn(
                                            'rounded-md px-2 py-0.5 text-xs font-bold tabular-nums border',
                                            palette.border,
                                            palette.text,
                                        )}
                                    >
                                        {group.lesson_start} – {group.lesson_end}
                                    </span>
                                    {group.room && (
                                        <span className={cn('text-xs font-medium', palette.subtext)}>
                                            📍 {group.room.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className={cn('font-semibold text-base mb-1', palette.text)}>
                                    {group.name}
                                </h3>
                                <p className={cn('text-xs mb-3', palette.subtext)}>
                                    {group.course.name}
                                </p>
                                <div className='flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 text-xs'>
                                    <span className={palette.subtext}>
                                        👤 {group.teacher ? fullName(group.teacher) : 'O\'qituvchi tayinlanmagan'}
                                    </span>
                                    <span className={cn('font-medium', palette.text)}>
                                        {group.students_count} ta o'quvchi
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DayColumn({
    title,
    groups,
    onSelectGroup,
    showBranch,
}: {
    title: string;
    groups: Group[];
    onSelectGroup: (g: Group) => void;
    showBranch: boolean;
}) {
    const t = useT();

    return (
        <section className='border-card-border bg-card-background flex flex-col rounded-xl border shadow-xs'>
            <h2 className='text-text-primary border-card-border font-display border-b px-4 py-3 text-sm font-semibold'>
                {title}
            </h2>
            <ul className='flex flex-col gap-2 p-3'>
                {groups.length === 0 ? (
                    <li className='text-text-tertiary px-1 py-2 text-xs'>
                        {t('schedule.noLessons')}
                    </li>
                ) : (
                    groups.map((group) => {
                        const palette = getGroupPalette(group.id);
                        return (
                            <li key={group.id}>
                                <button
                                    type='button'
                                    onClick={() => onSelectGroup(group)}
                                    className={cn(
                                        'w-full text-left rounded-lg border p-2.5 transition-all hover:scale-[1.02]',
                                        palette.bg,
                                        palette.border,
                                    )}
                                >
                                    <p className={cn('text-xs font-semibold tabular-nums', palette.text)}>
                                        {group.lesson_start}–{group.lesson_end}
                                    </p>
                                    <p className={cn('mt-0.5 text-sm font-medium', palette.text)}>
                                        {group.name}
                                    </p>
                                    <p className={cn('mt-0.5 text-xs', palette.subtext)}>
                                        {[
                                            group.room?.name,
                                            group.teacher && fullName(group.teacher),
                                            showBranch && group.branch.name,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </button>
                            </li>
                        );
                    })
                )}
            </ul>
        </section>
    );
}

