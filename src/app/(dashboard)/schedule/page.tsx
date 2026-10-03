'use client';

import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { LinkButton } from '@/components/ui/link-button';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { PageHeader } from '@/components/ui/page-header';
import { useListQuery } from '@/hooks/use-list-query';
import { withNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useUrlParam } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { getSchedule } from '@/services/api/groups';
import { listRooms } from '@/services/api/rooms';
import { listUserOptions } from '@/services/api/users';
import { can, canAny } from '@/utils/access';
import { fullName, toISODate } from '@/utils/format';
import { CalendarTime, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import {
    isISODate,
    lessonCounts,
    lessonsOn,
    monthGridDates,
} from './_components/calendar';
import { DayLessons } from './_components/day-lessons';
import { MonthCalendar } from './_components/month-calendar';

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
 * Dars jadvali: chapda oy kalendari, o'ngda tanlangan kunning darslari soat
 * bo'yicha. Darslar guruhlarning hafta kunlaridan har bir sana uchun
 * hisoblanadi — guruh boshlanishidan oldin va tugaganidan keyin ko'rinmaydi.
 *
 * Tanlangan sana manzilda (`?date=2026-10-15`): guruhni ochib "orqaga"
 * qaytilganda o'sha kun ochiq qoladi.
 */
function ScheduleView() {
    const t = useT();
    const { session } = useSession();
    const today = toISODate(new Date());
    const [rawDate, setDate] = useUrlParam('date', today);
    const date = isISODate(rawDate) ? rawDate : today;

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

    const counts = useMemo(
        () => lessonCounts(groups ?? [], monthGridDates(date)),
        [groups, date],
    );
    const dayLessons = useMemo(
        () => lessonsOn(groups ?? [], date),
        [groups, date],
    );

    // Telefonda ro'yxat kalendar ostida — kun tanlanganda unga suriladi,
    // aks holda bosilgan kunning darslari ekrandan tashqarida qolardi.
    const dayRef = useRef<HTMLDivElement>(null);
    const selectFromCalendar = (next: string) => {
        setDate(next);
        if (window.matchMedia('(max-width: 1023px)').matches) {
            dayRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    const activeCount =
        (filters.branch_id ? 1 : 0) +
        (filters.teacher_id ? 1 : 0) +
        (filters.room_id ? 1 : 0);

    // Telefonda — "Filtrlar" oynasida yorliq bilan, desktopda qatorda.
    const filterFields = (inline: boolean) => (
        <>
            {branches.length > 1 && (
                <div className={inline ? 'w-48 min-w-28 shrink' : undefined}>
                    <SelectInput
                        label={inline ? undefined : t('groups.allBranches')}
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
            <div className={inline ? 'w-52 min-w-28 shrink' : undefined}>
                <SelectInput
                    label={inline ? undefined : t('groups.allTeachers')}
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
            <div className={inline ? 'w-44 min-w-28 shrink' : undefined}>
                <SelectInput
                    label={inline ? undefined : t('groups.allRooms')}
                    options={(roomsQuery.data ?? []).map((room) => ({
                        value: room.id,
                        label: room.name,
                    }))}
                    placeholder={t('groups.allRooms')}
                    value={filters.room_id}
                    onValueChange={(room_id) => setFilter('room_id', room_id)}
                />
            </div>
        </>
    );

    return (
        <>
            <PageHeader
                title={t('schedule.title')}
                description={t('schedule.subtitle')}
            />

            <div className='flex items-center gap-3 px-4 pb-4 sm:px-5'>
                <MobileFilterSheet
                    activeCount={activeCount}
                    onClear={() =>
                        setFilters({
                            branch_id: '',
                            teacher_id: '',
                            room_id: '',
                        })
                    }
                >
                    {filterFields(false)}
                </MobileFilterSheet>
                <div className='hidden min-w-0 items-center gap-3 sm:flex'>
                    {filterFields(true)}
                </div>
            </div>

            <div className='px-4 pb-8 sm:px-5'>
                {query.isPending ? (
                    <TableSkeleton rows={6} columns={3} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.length === 0 ? (
                    <div className='border-card-border bg-card-background rounded-xl border p-8'>
                        <EmptyState
                            message={t('schedule.empty')}
                            hint={t('schedule.emptyHint')}
                            icon={<CalendarTime className='size-5' />}
                            action={
                                can(session, 'groups.create') ? (
                                    <LinkButton
                                        href={withNewParam('/groups')}
                                        appearance='fill'
                                    >
                                        <Plus />
                                        {t('groups.addFirst')}
                                    </LinkButton>
                                ) : null
                            }
                        />
                    </div>
                ) : (
                    <div className='grid items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]'>
                        {/* Uzun ro'yxatni surganda kalendar ko'z oldida qoladi. */}
                        <div className='lg:sticky lg:top-4'>
                            <MonthCalendar
                                selected={date}
                                today={today}
                                counts={counts}
                                onSelect={selectFromCalendar}
                                onNavigate={setDate}
                            />
                        </div>
                        <div ref={dayRef} className='min-w-0 scroll-mt-4'>
                            <DayLessons
                                date={date}
                                today={today}
                                lessons={dayLessons}
                                showBranch={showBranch}
                                onSelect={setDate}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
