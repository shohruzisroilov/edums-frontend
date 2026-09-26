'use client';

import { Badge } from '@/components/tailgrids/core/badge';
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
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { StudentStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useListQuery } from '@/hooks/use-list-query';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { deleteStudent, listStudents } from '@/services/api/students';
import {
    STUDENT_STATUSES,
    type Student,
    type StudentStatus,
} from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus, Trash1, UserCircle1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { StudentFormModal } from './_components/student-form';

export default function StudentsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'students.view')}>
            <StudentsView />
        </AccessGuard>
    );
}

function StudentsView() {
    const t = useT();
    const router = useRouter();
    const toastError = useApiErrorToast();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'students.create');
    const canUpdate = can(session, 'students.update');
    const canDelete = can(session, 'students.delete');

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ branch_id: '', status: 'active' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState<Student | null>(null);

    useOpenOnNewParam(() => {
        setEditing(null);
        setFormOpen(true);
    }, canCreate);

    const query = useQuery({
        queryKey: ['students', { search, ...filters, limit, offset }],
        queryFn: () =>
            listStudents({
                search: search || undefined,
                branch_id: filters.branch_id || undefined,
                status: (filters.status || undefined) as
                    | StudentStatus
                    | undefined,
                limit,
                offset,
            }),
    });

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = branchesQuery.data ?? [];

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
                description={t('students.subtitle')}
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
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('students.empty')}
                            icon={<UserCircle1 className='size-5' />}
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
                                            {t('common.fullName')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.groups')}
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
                                    {query.data.data.map((student, index) => (
                                        <TableRow key={student.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell primary>
                                                <Link
                                                    href={`/students/${student.id}`}
                                                    className='hover:text-brand-accent hover:underline'
                                                >
                                                    {fullName(student)}
                                                </Link>
                                                {branches.length > 1 && (
                                                    <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                        {student.branch.name}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <PhoneLines student={student} />
                                            </TableCell>
                                            <TableCell className='whitespace-normal'>
                                                {student.groups.length === 0 ? (
                                                    <span className='text-text-tertiary text-xs'>
                                                        {t('students.noGroups')}
                                                    </span>
                                                ) : (
                                                    <div className='flex flex-wrap gap-1'>
                                                        {student.groups.map(
                                                            (group) => (
                                                                <Badge
                                                                    key={
                                                                        group.id
                                                                    }
                                                                    size='sm'
                                                                    color='gray'
                                                                >
                                                                    {group.name}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StudentStatusBadge
                                                    status={student.status}
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
                                                                        student,
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
                                                                        student,
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
                <StudentFormModal
                    student={editing}
                    onClose={() => setFormOpen(false)}
                    onCreated={(created) =>
                        router.push(`/students/${created.id}`)
                    }
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

/** O'quvchi telefoni va ostida ota-ona telefoni — bori ko'rsatiladi. */
function PhoneLines({ student }: { student: Student }) {
    const t = useT();

    return (
        <div className='tabular-nums'>
            {student.phone_number && <p>{student.phone_number}</p>}
            {student.parent_phone && (
                <p className='text-text-tertiary text-xs'>
                    {t('students.parentPhone')}: {student.parent_phone}
                </p>
            )}
        </div>
    );
}
