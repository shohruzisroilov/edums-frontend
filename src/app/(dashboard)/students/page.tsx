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
import { StudentStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listEducationCenters } from '@/services/api/education-centers';
import { listGroups } from '@/services/api/groups';
import { deleteStudent, listStudents } from '@/services/api/students';
import type { Student, StudentStatus } from '@/types/api';
import { STUDENT_STATUSES } from '@/types/api';
import { ALL_ROLES, CAN_MANAGE_STUDENTS } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus, Trash1, UserMultiple1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { StudentFormModal } from './_components/student-form';

export default function StudentsPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <StudentsView />
        </RoleGuard>
    );
}

function StudentsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate } = useFormat();
    const { session } = useSession();

    // Super admin o'quvchi qo'sha olmaydi — uni filialning o'zi ro'yxatga oladi.
    const canManage = hasRole(session, ...CAN_MANAGE_STUDENTS);

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '', group_id: '', education_center_id: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState<Student | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['students', { search, ...filters, limit, offset }],
        queryFn: () =>
            listStudents({
                search: search || undefined,
                status: (filters.status || undefined) as
                    | StudentStatus
                    | undefined,
                group_id: filters.group_id || undefined,
                education_center_id: filters.education_center_id || undefined,
                limit,
                offset,
            }),
    });

    const groupsQuery = useQuery({
        queryKey: ['groups', 'options'],
        queryFn: () => listGroups({ limit: 200 }),
    });

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options'],
        queryFn: () => listEducationCenters({ limit: 200 }),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(t('students.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('students.title')}
                count={query.data?.count}
                description={
                    canManage
                        ? t('students.subtitle')
                        : t('students.superAdminHint')
                }
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
                            {t('students.new')}
                        </Button>
                    )
                }
            />

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('students.search')}
                />
                <div className='w-full sm:w-40'>
                    <SelectInput
                        options={STUDENT_STATUSES.map((status) => ({
                            value: status,
                            label: t(`studentStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
                <div className='w-full sm:w-48'>
                    <SelectInput
                        options={(groupsQuery.data?.data ?? []).map(
                            (group) => ({
                                value: group.id,
                                label: group.name,
                            }),
                        )}
                        placeholder={t('students.allGroups')}
                        value={filters.group_id}
                        onValueChange={(next) => setFilter('group_id', next)}
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
                        placeholder={t('students.allCenters')}
                        value={filters.education_center_id}
                        onValueChange={(next) =>
                            setFilter('education_center_id', next)
                        }
                    />
                </div>
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('students.empty')}
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
                                            {t('common.fullName')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.group')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.center')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.birthDate')}
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
                                    {query.data.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell primary>
                                                {fullName(student)}
                                                {student.parent_name && (
                                                    <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                        {t('students.parent')}:{' '}
                                                        {student.parent_name}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.phone_number}
                                            </TableCell>
                                            <TableCell>
                                                {student.group?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {student.education_center
                                                    ?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(student.birth_date)}
                                            </TableCell>
                                            <TableCell>
                                                <StudentStatusBadge
                                                    status={student.status}
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
                                                                    student,
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
                                                                    student,
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
                <StudentFormModal
                    student={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('students.deleteTitle')}
                message={t('students.deleteMessage', {
                    name: deleting ? fullName(deleting) : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
