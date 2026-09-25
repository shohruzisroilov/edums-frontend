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
import { AccessGuard } from '@/components/ui/access-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { LessonSchedule } from '@/components/ui/lesson-schedule';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { SearchInput } from '@/components/ui/search-input';
import { GroupStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listCourses } from '@/services/api/courses';
import { deleteGroup, listGroups } from '@/services/api/groups';
import { listUserOptions } from '@/services/api/users';
import { GROUP_STATUSES, type Group, type GroupStatus } from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus, Trash1, UserMultiple1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { GroupFormModal } from './_components/group-form';

export default function GroupsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'groups.view')}>
            <GroupsView />
        </AccessGuard>
    );
}

function GroupsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatPrice } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'groups.create');
    const canUpdate = can(session, 'groups.update');
    const canDelete = can(session, 'groups.delete');

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
        branch_id: '',
        course_id: '',
        teacher_id: '',
        status: 'active',
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Group | null>(null);
    const [deleting, setDeleting] = useState<Group | null>(null);

    const query = useQuery({
        queryKey: ['groups', { search, ...filters, limit, offset }],
        queryFn: () =>
            listGroups({
                search: search || undefined,
                branch_id: filters.branch_id || undefined,
                course_id: filters.course_id || undefined,
                teacher_id: filters.teacher_id || undefined,
                status: (filters.status || undefined) as
                    | GroupStatus
                    | undefined,
                limit,
                offset,
            }),
    });

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: listCourses,
    });
    const teachersQuery = useQuery({
        queryKey: ['user-options'],
        queryFn: listUserOptions,
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            toast.success(t('groups.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    const branches = branchesQuery.data ?? [];

    return (
        <>
            <PageHeader
                title={t('groups.title')}
                count={query.data?.count}
                description={t('groups.subtitle')}
                actions={
                    canCreate && (
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
                {branches.length > 1 && (
                    <div className='w-full sm:w-48'>
                        <SelectInput
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            placeholder={t('groups.allBranches')}
                            value={filters.branch_id}
                            onValueChange={(next) =>
                                setFilter('branch_id', next)
                            }
                        />
                    </div>
                )}
                <div className='w-full sm:w-52'>
                    <SelectInput
                        options={(coursesQuery.data ?? []).map((course) => ({
                            value: course.id,
                            label: course.name,
                        }))}
                        placeholder={t('groups.allCourses')}
                        value={filters.course_id}
                        onValueChange={(next) => setFilter('course_id', next)}
                    />
                </div>
                <div className='w-full sm:w-52'>
                    <SelectInput
                        options={(teachersQuery.data ?? []).map((user) => ({
                            value: user.id,
                            label: fullName(user),
                        }))}
                        placeholder={t('groups.allTeachers')}
                        value={filters.teacher_id}
                        onValueChange={(next) => setFilter('teacher_id', next)}
                    />
                </div>
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
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={7} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('groups.empty')}
                            icon={<UserMultiple1 className='size-5' />}
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
                                            {t('groups.teacher')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.lessons')}
                                        </TableHead>
                                        <TableHead>
                                            {t('groups.room')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('groups.price')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        {(canUpdate || canDelete) && (
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
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                    {group.course.name}
                                                    {branches.length > 1 &&
                                                        ` · ${group.branch.name}`}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {group.teacher
                                                    ? fullName(group.teacher)
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <LessonSchedule group={group} />
                                            </TableCell>
                                            <TableCell>
                                                {group.room?.name ?? '—'}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    group.price,
                                                    t('common.som'),
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <GroupStatusBadge
                                                    status={group.status}
                                                />
                                            </TableCell>
                                            {(canUpdate || canDelete) && (
                                                <TableCell>
                                                    <div className='flex justify-end gap-2'>
                                                        {canUpdate && (
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
                                                        )}
                                                        {canDelete && (
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
                                                        )}
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
