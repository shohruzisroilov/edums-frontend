'use client';

import { Button } from '@/components/tailgrids/core/button';
import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { LinkButton } from '@/components/ui/link-button';
import { ClearFiltersButton } from '@/components/ui/mobile-filter-sheet';
import { Modal } from '@/components/ui/modal';
import { formatMonth } from '@/components/ui/month-switcher';
import { PageHeader } from '@/components/ui/page-header';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useUrlParams } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { listBranches } from '@/services/api/branches';
import { getSchedule } from '@/services/api/groups';
import { listRooms } from '@/services/api/rooms';
import { listUserOptions } from '@/services/api/users';
import type { Group } from '@/types/api';
import { canAny } from '@/utils/access';
import { cn } from '@/utils/cn';
import { fullName, toISODate } from '@/utils/format';
import {
    Calendar,
    CalendarTime,
    ChevronLeft,
    ChevronRight,
    Eye,
    Layout20,
    MenuHamburger1,
} from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';
import { AgendaList, WeekStrip } from './_components/agenda';
import {
    CALENDAR_VIEWS,
    isISODate,
    lessonsByDate,
    monthGridDates,
    monthOf,
    shiftDate,
    weekDates,
    weekdayOf,
    type CalendarView,
} from './_components/calendar';
import { MonthGrid } from './_components/month-grid';
import { TimeGrid } from './_components/time-grid';

const VIEW_ICONS: Record<CalendarView, ReactNode> = {
    day: <CalendarTime className='size-3.5' />,
    week: <Layout20 className='size-3.5' />,
    month: <Calendar className='size-3.5' />,
    list: <MenuHamburger1 className='size-3.5' />,
};

const VIEW_LABELS: Record<CalendarView, TranslationKey> = {
    day: 'schedule.viewDay',
    week: 'schedule.viewWeek',
    month: 'schedule.viewMonth',
    list: 'schedule.viewList',
};

export default function SchedulePage() {
    return (
        <AccessGuard
            allow={(session) =>
                canAny(session, 'groups.view', 'groups.view_own')
            }
        >
            <ScheduleView />
        </AccessGuard>
    );
}

/**
 * Dars jadvali kalendar ko'rinishida: kun, hafta, oy va ro'yxat. Darslar
 * guruhlarning hafta kunlaridan har bir sana uchun hisoblanadi — guruh
 * boshlanishidan oldin va tugaganidan keyin dars ko'rsatilmaydi.
 *
 * Ko'rinish va sana manzilda (`?view=month&date=2026-10-03`): guruhni ochib
 * "orqaga" qaytilganda kalendar o'sha joyda qoladi.
 */
function ScheduleView() {
    const t = useT();
    const { formatDate } = useFormat();
    const today = toISODate(new Date());

    // Telefonda haftalik to'r tor — kun ko'rinishi bilan ochiladi.
    const [defaultView] = useState<CalendarView>(() =>
        typeof window !== 'undefined' && window.innerWidth < 768
            ? 'day'
            : 'week',
    );
    // Ko'rinish va sana bitta `update` bilan yoziladi: "kunni ochish" ikkalasini
    // birga o'zgartiradi, ikki alohida yozuv esa bir-birini bosib ketardi.
    const { params, update } = useUrlParams();
    const rawView = params.get('view') ?? defaultView;
    const rawDate = params.get('date') ?? today;
    const view = CALENDAR_VIEWS.includes(rawView as CalendarView)
        ? (rawView as CalendarView)
        : defaultView;
    const date = isISODate(rawDate) ? rawDate : today;

    const navigate = (next: { view?: CalendarView; date?: string }) =>
        update({
            ...(next.view !== undefined && {
                view: next.view === defaultView ? null : next.view,
            }),
            ...(next.date !== undefined && {
                date: next.date === today ? null : next.date,
            }),
        });
    const setDate = (next: string) => navigate({ date: next });
    const setView = (next: CalendarView) => navigate({ view: next });

    const [selected, setSelected] = useState<{
        group: Group;
        date: string;
    } | null>(null);

    // Filtrlar manzilda: guruhni ochib "orqaga" qaytganda saqlanadi.
    const { filters, setFilter, setFilters } = useListQuery({
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
    const groups = query.data;
    const showBranch = branches.length > 1 && !filters.branch_id;

    const week = useMemo(() => weekDates(date), [date]);
    const visibleDates = useMemo(
        () =>
            view === 'day'
                ? [date]
                : view === 'month'
                  ? monthGridDates(date)
                  : week,
        [view, date, week],
    );
    // Kun ko'rinishidagi hafta tasmasi ham nuqtalar uchun haftaning darslarini so'raydi.
    const lessons = useMemo(
        () => lessonsByDate(groups ?? [], view === 'day' ? week : visibleDates),
        [groups, view, week, visibleDates],
    );

    const periodLabel =
        view === 'day'
            ? `${t(`weekdayLong.${weekdayOf(date)}` as TranslationKey)}, ${formatDate(date)}`
            : view === 'month'
              ? formatMonth(monthOf(date), t)
              : `${formatDate(week[0])} – ${formatDate(week[6])}`;

    const openDay = (day: string) => navigate({ view: 'day', date: day });
    const select = (group: Group, day: string) =>
        setSelected({ group, date: day });

    const dayLessons = lessons.get(date) ?? [];

    return (
        <>
            <PageHeader
                title={t('schedule.title')}
                description={t('schedule.subtitle')}
                actions={
                    <div
                        role='group'
                        aria-label={t('schedule.title')}
                        className='border-card-border bg-card-surface-area flex max-w-full items-center overflow-x-auto rounded-lg border p-1 shadow-xs'
                    >
                        {CALENDAR_VIEWS.map((mode) => (
                            <button
                                key={mode}
                                type='button'
                                onClick={() => setView(mode)}
                                aria-pressed={view === mode}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                    view === mode
                                        ? 'bg-brand-accent text-white shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                {VIEW_ICONS[mode]}
                                {t(VIEW_LABELS[mode])}
                            </button>
                        ))}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center justify-between gap-3 px-4 pb-4 sm:px-5 lg:flex-nowrap'>
                <div className='flex min-w-0 shrink-0 items-center gap-2'>
                    <Button
                        appearance='outline'
                        size='sm'
                        isDisabled={date === today}
                        onPress={() => setDate(today)}
                    >
                        {t('schedule.today')}
                    </Button>
                    <Button
                        appearance='outline'
                        size='sm'
                        iconOnly
                        aria-label={t('schedule.previous')}
                        onPress={() => setDate(shiftDate(view, date, -1))}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        appearance='outline'
                        size='sm'
                        iconOnly
                        aria-label={t('schedule.next')}
                        onPress={() => setDate(shiftDate(view, date, 1))}
                    >
                        <ChevronRight />
                    </Button>
                    <h2
                        aria-live='polite'
                        className='font-display text-text-primary truncate text-sm font-semibold tabular-nums sm:text-base'
                    >
                        {periodLabel}
                    </h2>
                </div>

                <div className='flex w-full min-w-0 flex-wrap justify-end gap-3 sm:w-auto lg:flex-nowrap'>
                    {branches.length > 1 && (
                        <div className='w-full min-w-28 shrink sm:w-48'>
                            <SelectInput
                                options={branches.map((branch) => ({
                                    value: branch.id,
                                    label: branch.name,
                                }))}
                                placeholder={t('groups.allBranches')}
                                value={filters.branch_id}
                                onValueChange={(branch_id) =>
                                    // Xona filialga tegishli — filial o'zgarsa tushadi.
                                    setFilters({ branch_id, room_id: '' })
                                }
                            />
                        </div>
                    )}
                    <div className='w-full min-w-28 shrink sm:w-52'>
                        <SelectInput
                            options={(teachersQuery.data ?? []).map((user) => ({
                                value: user.id,
                                label: fullName(user),
                            }))}
                            placeholder={t('groups.allTeachers')}
                            value={filters.teacher_id}
                            onValueChange={(teacher_id) =>
                                setFilter('teacher_id', teacher_id)
                            }
                        />
                    </div>
                    <div className='w-full min-w-28 shrink sm:w-44'>
                        <SelectInput
                            options={(roomsQuery.data ?? []).map((room) => ({
                                value: room.id,
                                label: room.name,
                            }))}
                            placeholder={t('groups.allRooms')}
                            value={filters.room_id}
                            onValueChange={(room_id) =>
                                setFilter('room_id', room_id)
                            }
                        />
                    </div>
                    <ClearFiltersButton
                        activeCount={
                            (filters.branch_id ? 1 : 0) +
                            (filters.teacher_id ? 1 : 0) +
                            (filters.room_id ? 1 : 0)
                        }
                        onClear={() =>
                            setFilters({
                                branch_id: '',
                                teacher_id: '',
                                room_id: '',
                            })
                        }
                    />
                </div>
            </div>

            <div className='px-4 pb-8 sm:px-5'>
                {query.isPending ? (
                    <TableSkeleton rows={6} columns={7} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.length === 0 ? (
                    <div className='border-card-border bg-card-background rounded-xl border p-8'>
                        <EmptyState
                            message={t('schedule.empty')}
                            icon={<CalendarTime className='size-5' />}
                        />
                    </div>
                ) : view === 'month' ? (
                    <MonthGrid
                        dates={visibleDates}
                        month={monthOf(date)}
                        lessons={lessons}
                        today={today}
                        onOpenDay={openDay}
                        onSelect={select}
                    />
                ) : view === 'list' ? (
                    <AgendaList
                        dates={week}
                        lessons={lessons}
                        today={today}
                        showBranch={showBranch}
                        onSelect={select}
                        onOpenDay={openDay}
                    />
                ) : (
                    <>
                        {view === 'day' && (
                            <WeekStrip
                                dates={week}
                                selected={date}
                                today={today}
                                lessons={lessons}
                                onSelect={setDate}
                            />
                        )}
                        {view === 'day' && dayLessons.length === 0 && (
                            <p className='text-text-tertiary mb-3 text-center text-sm'>
                                {t('schedule.noLessonsDay')}
                            </p>
                        )}
                        <TimeGrid
                            dates={visibleDates}
                            lessons={lessons}
                            today={today}
                            showBranch={showBranch}
                            onSelect={select}
                            onOpenDay={view === 'week' ? openDay : undefined}
                        />
                    </>
                )}
            </div>

            {selected && (
                <Modal
                    open
                    onClose={() => setSelected(null)}
                    title={selected.group.name}
                    description={`${selected.group.course.name} · ${t(
                        `weekdayLong.${weekdayOf(selected.date)}` as TranslationKey,
                    )}, ${formatDate(selected.date)}`}
                    size='md'
                >
                    <div className='flex flex-col gap-4 py-2'>
                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <Fact label={t('schedule.lessonTime')}>
                                <span className='tabular-nums'>
                                    {selected.group.lesson_start} –{' '}
                                    {selected.group.lesson_end}
                                </span>
                            </Fact>
                            <Fact label={t('groups.room')}>
                                {selected.group.room?.name ?? '—'}
                            </Fact>
                            <Fact label={t('groups.teacher')}>
                                {selected.group.teacher
                                    ? fullName(selected.group.teacher)
                                    : '—'}
                            </Fact>
                            <Fact label={t('groups.students')}>
                                <span className='tabular-nums'>
                                    {selected.group.students_count}
                                </span>
                            </Fact>
                        </div>

                        <div className='mt-2 flex items-center justify-end gap-2'>
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => setSelected(null)}
                            >
                                {t('common.close')}
                            </Button>
                            <LinkButton
                                href={`/groups/${selected.group.id}`}
                                appearance='fill'
                            >
                                <Eye />
                                {t('schedule.openGroup')}
                            </LinkButton>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className='border-card-border bg-card-surface-area rounded-lg border p-3'>
            <p className='text-text-tertiary text-xs font-medium'>{label}</p>
            <p className='text-text-primary mt-1 font-semibold'>{children}</p>
        </div>
    );
}
