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
    DataListSkeleton,
    EmptyState,
    ErrorState,
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
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
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
import { can, canAny } from '@/utils/access';
import { cn } from '@/utils/cn';
import { formatPhone, fullName } from '@/utils/format';
import { balanceTone } from '@/utils/tone';
import { exportToExcel } from '@/utils/export';
import { StudentImportModal } from '@/components/ui/student-import-modal';
import { BulkActionBar } from '@/components/ui/bulk-action-bar';
import {
    Download1,
    Pencil1,
    Plus,
    Trash1,
    UploadCloud,
    UserCircle1,
    Wallet2,
} from '@tailgrids/icons';
import { EyeIcon } from '@/components/ui/eye-icon';
import {
    RowActionsMenu,
    type RowAction,
} from '@/components/ui/row-actions-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { StudentFormModal } from './_components/student-form';

import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';

export default function StudentsPage() {
    return (
        <AccessGuard
            allow={(session) =>
                canAny(session, 'students.view', 'students.view_own')
            }
        >
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
    const canViewGroups = canAny(session, 'groups.view', 'groups.view_own');
    // "⋯" menyuda "Batafsil" har doim bor, shuning uchun amallar ustuni ham doim.
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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [prevListKey, setPrevListKey] = useState(
        () =>
            `${offset}-${limit}-${search}-${filters.branch_id}-${filters.status}`,
    );

    // Sahifa, qidiruv yoki filtr o'zgarganda tanlovni darhol tozalaymiz
    const currentListKey = `${offset}-${limit}-${search}-${filters.branch_id}-${filters.status}`;
    if (prevListKey !== currentListKey) {
        setPrevListKey(currentListKey);
        setSelectedIds(new Set());
    }

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
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

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

    const activeStatus =
        filters.status && filters.status !== 'active' ? filters.status : null;
    const activeCount = (filters.branch_id ? 1 : 0) + (activeStatus ? 1 : 0);

    // Qatordagi kam ishlatiladigan amallar "⋯" menyuda; asosiy amal — to'lov.
    const rowActions = (student: Student): RowAction[] => [
        {
            label: t('common.details'),
            icon: <EyeIcon />,
            href: `/students/${student.id}`,
        },
        ...(canUpdate
            ? [
                  {
                      label: t('common.edit'),
                      icon: <Pencil1 />,
                      onAction: () => {
                          setEditing(student);
                          setFormOpen(true);
                      },
                  },
              ]
            : []),
        ...(canDelete
            ? [
                  {
                      label: t('common.delete'),
                      icon: <Trash1 />,
                      onAction: () => setDeleting(student),
                      danger: true,
                  },
              ]
            : []),
    ];

    // Holat bo'yicha filtrlanganda har qatorda bir xil badge turardi —
    // ustun faqat "barchasi" tanlanganda chiqadi (jadval noutbukka sig'sin).
    const showStatusColumn = !filters.status;

    // Filtr qo'llanmagan bo'sh ro'yxat — yangi markaz: nima ekani tushuntiriladi.
    const filtered = Boolean(
        search ||
        filters.branch_id ||
        (filters.status && filters.status !== 'active'),
    );

    const allIds = query.data?.data.map((s) => s.id) ?? [];
    const isAllSelected =
        allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allIds));
        }
    };

    const [exporting, setExporting] = useState(false);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleExportExcel = async (onlySelected = false) => {
        try {
            setExporting(true);
            let list = onlySelected
                ? (query.data?.data.filter((s) => selectedIds.has(s.id)) ?? [])
                : (query.data?.data ?? []);
            const total = query.data?.count ?? 0;
            if (!onlySelected && total > list.length) {
                const res = await listStudents({
                    search: search || undefined,
                    branch_id: filters.branch_id || undefined,
                    status: (filters.status || undefined) as
                        | StudentStatus
                        | undefined,
                    limit: Math.min(total, 200),
                    offset: 0,
                });
                list = res.data;
            }
            if (list.length === 0) return;

            await exportToExcel(
                t('students.title'),
                'Students',
                [
                    t('common.fullName'),
                    t('common.phone'),
                    t('students.parentPhone'),
                    ...(canViewPayments
                        ? [`${t('balance.title')} (${t('common.som')})`]
                        : []),
                    t('common.status'),
                ],
                list.map((s) => [
                    fullName(s),
                    s.phone_number ? formatPhone(s.phone_number) : '',
                    s.parent_phone ? formatPhone(s.parent_phone) : '',
                    ...(canViewPayments ? [s.balance ?? 0] : []),
                    t(`studentStatus.${s.status}`),
                ]),
            );
        } catch (err) {
            toastError(err);
        } finally {
            setExporting(false);
        }
    };

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
                                isPending={exporting}
                                onPress={() => void handleExportExcel(false)}
                            >
                                <Download1 />
                                {/* Telefonda faqat ikonka — asosiy amal bir qatorda qolsin. */}
                                <span className='sr-only sm:not-sr-only'>
                                    {t('common.export')}
                                </span>
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
                                    <span className='sr-only sm:not-sr-only'>
                                        {t('students.import')}
                                    </span>
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
                <div className='min-w-0 flex-1 sm:min-w-[200px]'>
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

                <div className='hidden min-w-0 flex-wrap items-center gap-3 sm:flex'>
                    {branches.length > 1 && (
                        <div className='w-48 shrink-0'>
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
                    <div className='w-40 shrink-0'>
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
                        <DataListSkeleton columns={showStatusColumn ? 7 : 6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t(
                                filtered
                                    ? 'students.empty'
                                    : 'students.emptyFirst',
                            )}
                            hint={
                                filtered ? undefined : t('students.emptyHint')
                            }
                            icon={<UserCircle1 className='size-5' />}
                            action={
                                filtered ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('branch_id', '');
                                            setFilter('status', 'active');
                                        }}
                                    >
                                        {t('filters.reset')}
                                    </Button>
                                ) : canCreate ? (
                                    <div className='flex flex-wrap justify-center gap-2'>
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
                                            {t('students.addFirst')}
                                        </Button>
                                        <Button
                                            appearance='outline'
                                            size='md'
                                            onPress={() => setImportOpen(true)}
                                        >
                                            <UploadCloud />
                                            {t('students.import')}
                                        </Button>
                                    </div>
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
                                            <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedIds.has(
                                                        student.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(student.id)
                                                    }
                                                    aria-label={fullName(
                                                        student,
                                                    )}
                                                    className='border-card-border text-brand-accent focus:ring-brand-accent accent-brand-accent mt-1 size-4 cursor-pointer rounded'
                                                />
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex items-start gap-2'>
                                                        <span className='text-text-tertiary mt-0.5 shrink-0 text-xs font-semibold tabular-nums'>
                                                            #
                                                            {offset + index + 1}
                                                        </span>
                                                        <Link
                                                            href={`/students/${student.id}`}
                                                            className='text-text-primary hover:text-brand-accent text-sm font-semibold break-words hover:underline'
                                                        >
                                                            {fullName(student)}
                                                        </Link>
                                                    </div>
                                                    {branches.length > 1 && (
                                                        <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                            {
                                                                student.branch
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <StudentStatusBadge
                                                status={student.status}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <PhoneLines student={student} />

                                            {canViewPayments && (
                                                <div className='text-right'>
                                                    <span className='text-text-tertiary block text-xs'>
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
                                                                <span className='text-text-tertiary ml-1.5 text-xs'>
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
                                            <div className='border-card-border/60 flex items-center justify-end gap-2 border-t pt-2.5'>
                                                {canPay && (
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        onPress={() =>
                                                            setPaying(student)
                                                        }
                                                        className='gap-1.5 px-3 [&>svg]:size-4'
                                                    >
                                                        <Wallet2 />
                                                        {t(
                                                            'header.quickPayment',
                                                        )}
                                                    </Button>
                                                )}
                                                <RowActionsMenu
                                                    label={fullName(student)}
                                                    actions={rowActions(
                                                        student,
                                                    )}
                                                />
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
                                            <TableHead className='w-10 px-3 text-center'>
                                                <input
                                                    type='checkbox'
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                    aria-label={t('common.all')}
                                                    className='border-card-border text-brand-accent focus:ring-brand-accent accent-brand-accent size-4 cursor-pointer rounded'
                                                />
                                            </TableHead>
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
                                            {showStatusColumn && (
                                                <TableHead>
                                                    {t('common.status')}
                                                </TableHead>
                                            )}
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
                                                <TableRow
                                                    key={student.id}
                                                    className={cn(
                                                        selectedIds.has(
                                                            student.id,
                                                        ) &&
                                                            'bg-brand-accent/5 hover:bg-brand-accent/10',
                                                    )}
                                                >
                                                    <TableCell className='w-10 px-3 text-center'>
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedIds.has(
                                                                student.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleSelect(
                                                                    student.id,
                                                                )
                                                            }
                                                            aria-label={fullName(
                                                                student,
                                                            )}
                                                            className='border-card-border text-brand-accent focus:ring-brand-accent accent-brand-accent size-4 cursor-pointer rounded'
                                                        />
                                                    </TableCell>
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
                                                    <TableCell className='min-w-40 whitespace-normal'>
                                                        <PhoneLines
                                                            student={student}
                                                        />
                                                    </TableCell>
                                                    <TableCell className='max-w-60 min-w-36 whitespace-normal'>
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
                                                                                        <span className='text-text-tertiary text-xs leading-tight font-normal'>
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
                                                    {showStatusColumn && (
                                                        <TableCell>
                                                            <StudentStatusBadge
                                                                status={
                                                                    student.status
                                                                }
                                                            />
                                                        </TableCell>
                                                    )}
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
                                                            <div className='flex items-center justify-end gap-2'>
                                                                {canPay && (
                                                                    <Button
                                                                        appearance='outline'
                                                                        size='md'
                                                                        onPress={() =>
                                                                            setPaying(
                                                                                student,
                                                                            )
                                                                        }
                                                                        className='gap-1.5 px-3 [&>svg]:size-4'
                                                                    >
                                                                        <Wallet2 />
                                                                        {t(
                                                                            'header.quickPayment',
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                <RowActionsMenu
                                                                    label={fullName(
                                                                        student,
                                                                    )}
                                                                    actions={rowActions(
                                                                        student,
                                                                    )}
                                                                />
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

            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
            >
                <Button
                    appearance='outline'
                    size='sm'
                    onPress={() => handleExportExcel(true)}
                    className='gap-1.5'
                >
                    <Download1 className='size-3.5' />
                    {t('common.export')}
                </Button>
            </BulkActionBar>
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
