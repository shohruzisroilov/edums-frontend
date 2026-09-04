'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RoleGuard } from '@/components/ui/role-guard';
import { SearchInput } from '@/components/ui/search-input';
import { GroupStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useListQuery } from '@/hooks/use-list-query';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listCourses } from '@/services/api/courses';
import { listCenterStaff } from '@/services/api/education-centers';
import { listEducationCenters } from '@/services/api/education-centers';
import { deleteGroup, listGroups } from '@/services/api/groups';
import type { Group, GroupStatus, Weekday } from '@/types/api';
import { GROUP_STATUSES, WEEKDAYS } from '@/types/api';
import { ALL_ROLES, CAN_MANAGE_GROUPS } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus, Trash1, UserMultiple4 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { GroupFormModal } from './_components/group-form';

export default function GroupsPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <GroupsView />
        </RoleGuard>
    );
}

function GroupsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { session } = useSession();

    const canManage = hasRole(session, ...CAN_MANAGE_GROUPS);

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({
        status: '',
        course_id: '',
        weekday: '',
        education_center_id: '',
        teacher_id: '',
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Group | null>(null);
    const [deleting, setDeleting] = useState<Group | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['groups', { search, ...filters, limit, offset }],
        queryFn: () =>
            listGroups({
                search: search || undefined,
                status: (filters.status || undefined) as
                    | GroupStatus
                    | undefined,
                course_id: filters.course_id || undefined,
                weekday: (filters.weekday || undefined) as Weekday | undefined,
                education_center_id: filters.education_center_id || undefined,
                teacher_id: filters.teacher_id || undefined,
                limit,
                offset,
            }),
    });

    const coursesQuery = useQuery({
        queryKey: ['courses', 'options'],
        queryFn: () => listCourses({ limit: 200 }),
    });

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options'],
        queryFn: () => listEducationCenters({ limit: 200 }),
    });

    /*
     * O'qituvchilar ro'yxati filialga bog'langan: GET /staff faqat owner va
     * manager uchun ochiq, filial xodimlari esa har bir rolga ko'rinadi.
     * Shuning uchun o'qituvchi filtri filial tanlangandagina ishlaydi.
     */
    const centerStaffQuery = useQuery({
        queryKey: ['center-staff', filters.education_center_id],
        queryFn: () => listCenterStaff(filters.education_center_id),
        enabled: filters.education_center_id !== '',
    });

    const teachers = (centerStaffQuery.data ?? []).filter(
        (member) => member.role === 'teacher',
    );

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success(t('groups.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('groups.title')}
                count={query.data?.count}
                description={t('groups.subtitle')}
                actions={
                    canManage && (
                        <Button
                            variant='primary'
                            appearance='fill'
                            size='md'
                            onPress={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        >
                            <Plus />
                            {t('groups.new')}
                        </Button>
                    )
                }
            />

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('groups.search')}
                />
                <div className='w-full sm:w-40'>
                    <SelectInput
                        options={GROUP_STATUSES.map((status) => ({
                            value: status,
                            label: t(`groupStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
                <div className='w-full sm:w-48'>
                    <SelectInput
                        options={(coursesQuery.data?.data ?? []).map(
                            (course) => ({
                                value: course.id,
                                label: course.name,
                            }),
                        )}
                        placeholder={t('groups.allCourses')}
                        value={filters.course_id}
                        onValueChange={(next) => setFilter('course_id', next)}
                    />
                </div>
                <div className='w-full sm:w-40'>
                    <SelectInput
                        options={WEEKDAYS.map((day) => ({
                            value: day,
                            label: t(`weekday.${day}`),
                        }))}
                        placeholder={t('groups.allWeekdays')}
                        value={filters.weekday}
                        onValueChange={(next) => setFilter('weekday', next)}
                    />
                </div>
                <div className='w-full sm:w-48'>
                    <SelectInput
                        options={(centersQuery.data?.data ?? []).map(
                            (center) => ({
                                value: center.id,
                                label: center.name,
                            }),
                        )}
                        placeholder={t('groups.allCenters')}
                        value={filters.education_center_id}
                        onValueChange={(next) => {
                            setFilter('education_center_id', next);
                            // Filial almashsa o'qituvchi ro'yxati ham boshqa bo'ladi.
                            setFilter('teacher_id', '');
                        }}
                    />
                </div>
                {filters.education_center_id !== '' && (
                    <div className='w-full sm:w-48'>
                        <SelectInput
                            options={teachers.map((teacher) => ({
                                value: teacher.id,
                                label: fullName(teacher),
                            }))}
                            placeholder={t('groups.allTeachers')}
                            value={filters.teacher_id}
                            onValueChange={(next) =>
                                setFilter('teacher_id', next)
                            }
                        />
                    </div>
                )}
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('groups.empty')}
                            icon={<UserMultiple4 className='size-5' />}
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('common.name')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.course')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.schedule')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.teacher')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.center')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        {canManage && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((group) => (
                                        <TableRow key={group.id}>
                                            <TableCell primary>
                                                {group.name}
                                                {group.room && (
                                                    <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                        {t('groups.room')}:{' '}
                                                        {group.room}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {group.course?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className='whitespace-normal'>
                                                <span className='tabular-nums'>
                                                    {t('groups.timeRange', {
                                                        from: group.start_time,
                                                        to: group.end_time,
                                                    })}
                                                </span>
                                                <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                    {group.weekdays
                                                        .map((day) =>
                                                            t(
                                                                `weekdayShort.${day}`,
                                                            ),
                                                        )
                                                        .join(', ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {group.teacher
                                                    ? fullName(group.teacher)
                                                    : t('groups.noTeacher')}
                                            </TableCell>
                                            <TableCell>
                                                {group.education_center?.name ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <GroupStatusBadge
                                                    status={group.status}
                                                />
                                            </TableCell>
                                            {canManage && (
                                                <TableCell>
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.edit',
                                                            )}
                                                            onPress={() => {
                                                                setEditing(
                                                                    group,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil1 />
                                                        </Button>
                                                        <Button
                                                            variant='danger'
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.delete',
                                                            )}
                                                            onPress={() =>
                                                                setDeleting(
                                                                    group,
                                                                )
                                                            }
                                                        >
                                                            <Trash1 />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableRoot>

                            <PaginationBar
                                count={query.data.count}
                                limit={limit}
                                offset={offset}
                                onLimitChange={setLimit}
                                onOffsetChange={setOffset}
                            />
                        </>
                    )}
                </div>
            </div>

            {formOpen && (
                <GroupFormModal
                    group={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('groups.deleteTitle')}
                message={t('groups.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
