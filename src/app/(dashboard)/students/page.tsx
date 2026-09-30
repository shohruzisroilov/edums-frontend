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
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PaymentModal } from '@/components/ui/payment-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { StudentStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
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
import { cn } from '@/utils/cn';
import { formatPhone, fullName } from '@/utils/format';
import { balanceTone } from '@/utils/tone';
import { exportToCsv } from '@/utils/export';
import { StudentImportModal } from '@/components/ui/student-import-modal';
import {
    Download1,
    Pencil1,
    Plus,
    Trash1,
    UploadCloud,
    UserCircle1,
    Wallet2,
} from '@tailgrids/icons';
import { EyeLinkButton } from '@/components/ui/eye-icon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { StudentFormModal } from './_components/student-form';

import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';

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
    const { formatPrice } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'students.create');
    const canUpdate = can(session, 'students.update');
    const canDelete = can(session, 'students.delete');
    const canViewPayments = can(session, 'payments.view');
    const canPay = can(session, 'payments.create');
    const canViewGroups = can(session, 'groups.view');
    // Har doim ko'zcha (ochish) tugmasi ko'rinishi uchun hasActions barcha uchun true
    const hasActions = true;

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
    const [importOpen, setImportOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState<Student | null>(null);
    const [paying, setPaying] = useState<Student | null>(null);

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

    const activeBranch = branches.find((b) => b.id === filters.branch_id);
    const activeStatus =
        filters.status && filters.status !== 'active' ? filters.status : null;
    const activeCount = (filters.branch_id ? 1 : 0) + (activeStatus ? 1 : 0);

    const activeChips = [
        ...(activeBranch
            ? [
                  {
                      key: 'branch',
                      label: `Filial: ${activeBranch.name}`,
                      onRemove: () => setFilter('branch_id', ''),
                  },
              ]
            : []),
        ...(activeStatus
            ? [
                  {
                      key: 'status',
                      label: `Holat: ${t(`studentStatus.${activeStatus as StudentStatus}`)}`,
                      onRemove: () => setFilter('status', 'active'),
                  },
              ]
            : []),
    ];

    return (
        <>
            <PageHeader
                title={t('students.title')}
                count={query.data?.count}
                description={t('students.subtitle')}
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {query.data?.data && query.data.data.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => {
                                    exportToCsv(
                                        'Oquvchilar',
                                        [
                                            'F.I.Sh.',
                                            'Telefon',
                                            'Balans (som)',
                                            'Holati',
                                        ],
                                        query.data.data.map((s) => [
                                            fullName(s),
                                            formatPhone(s.phone_number),
                                            s.balance ?? 0,
                                            s.status,
                                        ]),
                                    );
                                }}
                            >
                                <Download1 />
                                Eksport (Excel)
                            </Button>
                        )}
                        {canCreate && (
                            <>
                                <Button
                                    appearance='outline'
                                    size='md'
                                    onPress={() => setImportOpen(true)}
                                >
                                    <UploadCloud />
                                    Import (Excel)
                                </Button>
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
                            </>
                        )}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-5'>
                <div className='min-w-[200px] flex-1'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('students.search')}
                    />
                </div>

                <MobileFilterSheet
                    activeCount={activeCount}
                    onClear={() => {
                        setFilter('branch_id', '');
                        setFilter('status', 'active');
                    }}
                    activeChips={activeChips}
                >
                    {branches.length > 1 && (
                        <SelectInput
                            label={t('groups.allBranches')}
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
                    )}
                    <SelectInput
                        label={t('common.allStatuses')}
                        options={STUDENT_STATUSES.map((status) => ({
                            value: status,
                            label: t(`studentStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </MobileFilterSheet>

                <div className='hidden items-center gap-3 sm:flex'>
                    {branches.length > 1 && (
                        <div className='w-48'>
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
                    <div className='w-40'>
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
            </div>

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('students.empty')}
                            icon={<UserCircle1 className='size-5' />}
                            action={
                                Boolean(
                                    search ||
                                    filters.branch_id ||
                                    (filters.status &&
                                        filters.status !== 'active'),
                                ) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('branch_id', '');
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
                                        <Plus className='size-4' />
                                        Birinchi o'quvchini qo'shish
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.data.map((student, index) => (
                                    <div
                                        key={student.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{offset + index + 1}
                                                    </span>
                                                    <Link
                                                        href={`/students/${student.id}`}
                                                        className='text-text-primary hover:text-brand-accent truncate text-sm font-semibold hover:underline'
                                                    >
                                                        {fullName(student)}
                                                    </Link>
                                                </div>
                                                {branches.length > 1 && (
                                                    <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                        {student.branch.name}
                                                    </p>
                                                )}
                                            </div>
                                            <StudentStatusBadge
                                                status={student.status}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <PhoneLines student={student} />

                                            {canViewPayments && (
                                                <div className='text-right'>
                                                    <span className='text-text-tertiary block text-[11px]'>
                                                        {t('balance.title')}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-xs font-semibold tabular-nums sm:text-sm',
                                                            balanceTone(
                                                                student.balance ??
                                                                    0,
                                                            ) ??
                                                                'text-text-tertiary',
                                                        )}
                                                    >
                                                        {formatPrice(
                                                            student.balance ??
                                                                0,
                                                            t('common.som'),
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {student.groups.length > 0 && (
                                            <div className='flex flex-wrap gap-1.5 pt-0.5'>
                                                {student.groups.map((group) => {
                                                    const match =
                                                        /^(.*?)\s*\((.+)\)$/.exec(
                                                            group.name.trim(),
                                                        );
                                                    const title = match
                                                        ? match[1].trim()
                                                        : group.name;
                                                    const schedule = match
                                                        ? match[2].trim()
                                                        : null;

                                                    const content = (
                                                        <>
                                                            <span className='text-text-primary text-xs font-medium'>
                                                                {title}
                                                            </span>
                                                            {schedule && (
                                                                <span className='text-text-tertiary ml-1.5 text-[10px]'>
                                                                    {schedule}
                                                                </span>
                                                            )}
                                                        </>
                                                    );

                                                    return canViewGroups ? (
                                                        <Link
                                                            key={group.id}
                                                            href={`/groups/${group.id}`}
                                                            className='border-card-border bg-background-gray-secondary/60 hover:bg-background-gray-secondary flex items-center rounded-md border px-2 py-1 transition-colors'
                                                        >
                                                            {content}
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            key={group.id}
                                                            className='border-card-border bg-background-gray-secondary/60 flex items-center rounded-md border px-2 py-1'
                                                        >
                                                            {content}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {hasActions && (
                                            <div className='border-card-border/60 flex items-center justify-end gap-1.5 border-t pt-2.5'>
                                                <EyeLinkButton
                                                    href={`/students/${student.id}`}
                                                />
                                                {canPay && (
                                                    <Button
                                                        appearance='outline'
                                                        size='sm'
                                                        onPress={() =>
                                                            setPaying(student)
                                                        }
                                                        className='gap-1.5 text-xs'
                                                    >
                                                        <Wallet2 className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                                                        <span>
                                                            {t(
                                                                'header.quickPayment',
                                                            )}
                                                        </span>
                                                    </Button>
                                                )}
                                                {canUpdate && (
                                                    <Button
                                                        appearance='outline'
                                                        size='sm'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.edit',
                                                        )}
                                                        onPress={() => {
                                                            setEditing(student);
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil1 />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='sm'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.delete',
                                                        )}
                                                        onPress={() =>
                                                            setDeleting(student)
                                                        }
                                                    >
                                                        <Trash1 />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop / Tablet jadval (>= md) */}
                            <div className='hidden md:block'>
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
                                            <TableHead className='min-w-[190px]'>
                                                {t('students.groups')}
                                            </TableHead>
                                            <TableHead>
                                                {t('common.status')}
                                            </TableHead>
                                            {canViewPayments && (
                                                <TableHead numeric>
                                                    {t('balance.title')}
                                                </TableHead>
                                            )}
                                            {hasActions && (
                                                <TableHead className='text-right'>
                                                    {t('common.actions')}
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {query.data.data.map(
                                            (student, index) => (
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
                                                        {branches.length >
                                                            1 && (
                                                            <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                                {
                                                                    student
                                                                        .branch
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <PhoneLines
                                                            student={student}
                                                        />
                                                    </TableCell>
                                                    <TableCell className='max-w-[280px] min-w-[190px] whitespace-normal'>
                                                        {student.groups
                                                            .length === 0 ? (
                                                            <span className='text-text-tertiary text-xs'>
                                                                {t(
                                                                    'students.noGroups',
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <div className='flex flex-col gap-1.5 py-0.5'>
                                                                {student.groups.map(
                                                                    (group) => {
                                                                        const match =
                                                                            /^(.*?)\s*\((.+)\)$/.exec(
                                                                                group.name.trim(),
                                                                            );
                                                                        const title =
                                                                            match
                                                                                ? match[1].trim()
                                                                                : group.name;
                                                                        const schedule =
                                                                            match
                                                                                ? match[2].trim()
                                                                                : null;

                                                                        const content =
                                                                            (
                                                                                <>
                                                                                    <span className='text-text-primary group-hover/item:text-brand-accent text-xs leading-snug font-semibold transition-colors'>
                                                                                        {
                                                                                            title
                                                                                        }
                                                                                    </span>
                                                                                    {schedule && (
                                                                                        <span className='text-text-tertiary text-[11px] leading-tight font-normal'>
                                                                                            {
                                                                                                schedule
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </>
                                                                            );

                                                                        return canViewGroups ? (
                                                                            <Link
                                                                                key={
                                                                                    group.id
                                                                                }
                                                                                href={`/groups/${group.id}`}
                                                                                className='group/item border-card-border bg-background-gray-secondary/60 hover:bg-background-gray-secondary hover:border-brand-accent/40 flex flex-col gap-0.5 rounded-lg border px-2.5 py-1.5 transition-all'
                                                                            >
                                                                                {
                                                                                    content
                                                                                }
                                                                            </Link>
                                                                        ) : (
                                                                            <div
                                                                                key={
                                                                                    group.id
                                                                                }
                                                                                className='border-card-border bg-background-gray-secondary/60 flex flex-col gap-0.5 rounded-lg border px-2.5 py-1.5'
                                                                            >
                                                                                {
                                                                                    content
                                                                                }
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StudentStatusBadge
                                                            status={
                                                                student.status
                                                            }
                                                        />
                                                    </TableCell>
                                                    {canViewPayments && (
                                                        <TableCell
                                                            numeric
                                                            className={cn(
                                                                'font-medium',
                                                                balanceTone(
                                                                    student.balance ??
                                                                        0,
                                                                ) ??
                                                                    'text-text-tertiary',
                                                            )}
                                                        >
                                                            {formatPrice(
                                                                student.balance ??
                                                                    0,
                                                                t('common.som'),
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {hasActions && (
                                                        <TableCell>
                                                            <div className='flex justify-end gap-2'>
                                                                <EyeLinkButton
                                                                    href={`/students/${student.id}`}
                                                                />
                                                                {canPay && (
                                                                    <Button
                                                                        appearance='outline'
                                                                        size='md'
                                                                        iconOnly
                                                                        aria-label={t(
                                                                            'cashbox.new',
                                                                        )}
                                                                        onPress={() =>
                                                                            setPaying(
                                                                                student,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Wallet2 />
                                                                    </Button>
                                                                )}
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
                                            ),
                                        )}
                                    </TableBody>
                                </TableRoot>
                            </div>

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

            {importOpen && (
                <StudentImportModal
                    open={importOpen}
                    onClose={() => setImportOpen(false)}
                />
            )}

            {paying && (
                <PaymentModal
                    student={paying}
                    onClose={() => setPaying(null)}
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

import { PhoneLink } from '@/components/ui/phone-link';

/** O'quvchi telefoni va ostida ota-ona telefoni — bori ko'rsatiladi. */
function PhoneLines({ student }: { student: Student }) {
    const t = useT();

    return (
        <div className='tabular-nums'>
            {student.phone_number && (
                <p>
                    <PhoneLink phone={student.phone_number} />
                </p>
            )}
            {student.parent_phone && (
                <p className='text-text-tertiary text-xs'>
                    {t('students.parentPhone')}:{' '}
                    <PhoneLink phone={student.parent_phone} />
                </p>
            )}
        </div>
    );
}
