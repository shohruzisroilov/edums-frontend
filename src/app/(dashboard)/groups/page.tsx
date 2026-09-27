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
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { GroupStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listCourses } from '@/services/api/courses';
import { deleteGroup, listGroups } from '@/services/api/groups';
import { listUserOptions } from '@/services/api/users';
import { GROUP_STATUSES, type Group, type GroupStatus } from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { TONE_TEXT } from '@/utils/tone';
import { Pencil1, Plus, Trash1, UserMultiple1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { GroupFormModal } from './_components/group-form';
import { EyeLinkButton } from '@/components/ui/eye-icon';

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

    useOpenOnNewParam(() => {
        setEditing(null);
        setFormOpen(true);
    }, canCreate);

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

            <div className='flex flex-wrap gap-3 px-4 sm:px-5 pb-4'>
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
                {session?.kind === 'user' && (
                    <Button
                        appearance={filters.teacher_id === session.id ? 'fill' : 'outline'}
                        variant={filters.teacher_id === session.id ? 'primary' : undefined}
                        size='md'
                        onPress={() =>
                            setFilter(
                                'teacher_id',
                                filters.teacher_id === session.id ? '' : session.id,
                            )
                        }
                    >
                        Mening guruhlarim
                    </Button>
                )}
            </div>

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={8} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('groups.empty')}
                            icon={<UserMultiple1 className='size-5' />}
                            action={
                                Boolean(
                                    search ||
                                        filters.branch_id ||
                                        filters.course_id ||
                                        filters.teacher_id ||
                                        (filters.status && filters.status !== 'active'),
                                ) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('branch_id', '');
                                            setFilter('course_id', '');
                                            setFilter('teacher_id', '');
                                            setFilter('status', 'active');
                                        }}
                                    >
                                        Filtrni tozalash
                                    </Button>
                                ) : canCreate ? (
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
                                        Yangi guruh ochish
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
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
                                            {t('groups.students')}
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
                                    {query.data.data.map((group, index) => (
                                        <TableRow key={group.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell primary>
                                                <Link
                                                    href={`/groups/${group.id}`}
                                                    className='hover:text-brand-accent hover:underline'
                                                >
                                                    {group.name}
                                                </Link>
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
                                                <StudentsCount group={group} />
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
                                                        <EyeLinkButton href={`/groups/${group.id}`} />
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

/**
 * O'quvchilar soni; xona sig'imi ma'lum bo'lsa "12 / 14" ko'rinishida.
 * To'lgan guruh ajralib turadi — unga yangi o'quvchi qo'shishdan oldin
 * boshqa guruh qarash kerak.
 */
function StudentsCount({ group }: { group: Group }) {
    const t = useT();
    const capacity = group.room?.capacity;

    if (!capacity) return <>{group.students_count}</>;

    const full = group.students_count >= capacity;

    return (
        <span
            title={full ? t('groups.full') : undefined}
            className={cn(full && ['font-semibold', TONE_TEXT.warning])}
        >
            {group.students_count} / {capacity}
        </span>
    );
}
