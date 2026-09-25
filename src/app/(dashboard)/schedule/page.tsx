'use client';

import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { getSchedule } from '@/services/api/groups';
import { listRooms } from '@/services/api/rooms';
import { listUserOptions } from '@/services/api/users';
import { WEEKDAYS, type Group } from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { CalendarTime } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function SchedulePage() {
    return (
        <AccessGuard allow={(session) => can(session, 'groups.view')}>
            <ScheduleView />
        </AccessGuard>
    );
}

function ScheduleView() {
    const t = useT();
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

    return (
        <>
            <PageHeader
                title={t('schedule.title')}
                description={t('schedule.subtitle')}
            />

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
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
                                // Xonalar filialga tegishli — filial almashsa tushadi.
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

            <div className='px-5'>
                {query.isPending ? (
                    <TableSkeleton rows={4} columns={7} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.length === 0 ? (
                    <div className='border-card-border bg-card-background rounded-xl border'>
                        <EmptyState
                            message={t('schedule.empty')}
                            icon={<CalendarTime className='size-5' />}
                        />
                    </div>
                ) : (
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7'>
                        {WEEKDAYS.map((day) => (
                            <DayColumn
                                key={day}
                                title={t(`weekdayLong.${day}`)}
                                // Backend vaqt bo'yicha tartiblab beradi.
                                groups={query.data.filter((group) =>
                                    group.lesson_days.includes(day),
                                )}
                                showBranch={
                                    branches.length > 1 && !filters.branch_id
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function DayColumn({
    title,
    groups,
    showBranch,
}: {
    title: string;
    groups: Group[];
    showBranch: boolean;
}) {
    const t = useT();

    return (
        <section className='border-card-border bg-card-background flex flex-col rounded-xl border'>
            <h2 className='text-text-primary border-card-border font-display border-b px-4 py-3 text-sm font-semibold'>
                {title}
            </h2>
            <ul className='flex flex-col gap-2 p-3'>
                {groups.length === 0 ? (
                    <li className='text-text-tertiary px-1 py-2 text-xs'>
                        {t('schedule.noLessons')}
                    </li>
                ) : (
                    groups.map((group) => (
                        <li
                            key={group.id}
                            className='border-card-border rounded-lg border px-3 py-2'
                        >
                            <p className='text-text-primary text-xs font-semibold tabular-nums'>
                                {group.lesson_start}–{group.lesson_end}
                            </p>
                            <p className='text-text-primary mt-0.5 text-sm font-medium'>
                                {group.name}
                            </p>
                            <p className='text-text-tertiary mt-0.5 text-xs'>
                                {[
                                    group.room?.name,
                                    group.teacher && fullName(group.teacher),
                                    showBranch && group.branch.name,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
}
