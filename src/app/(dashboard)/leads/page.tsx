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
import { LeadKanbanBoard } from '@/components/ui/lead-kanban-board';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PhoneLink } from '@/components/ui/phone-link';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import {
    LeadSourceBadge,
    LeadStatusBadge,
    LeadStatusDot,
} from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useUrlParam } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listCourses } from '@/services/api/courses';
import {
    deleteLead,
    getLeadStats,
    listLeads,
    updateLead,
} from '@/services/api/leads';
import {
    EDITABLE_LEAD_STATUSES,
    LEAD_SOURCES,
    LEAD_STATUSES,
    type Lead,
    type LeadPayload,
    type LeadSource,
    type LeadStatus,
} from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import {
    Column,
    Eye,
    Funnel1,
    Globe2,
    Pencil1,
    Plus,
    Table2,
    Trash1,
} from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConvertLeadModal } from './_components/convert-lead';
import { LeadBatchActionsBar } from './_components/lead-batch-actions';
import { LeadDetailDrawer } from './_components/lead-detail-drawer';
import { LeadFormModal } from './_components/lead-form';

export default function LeadsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'leads.view')}>
            <LeadsView />
        </AccessGuard>
    );
}

function leadName(lead: Pick<Lead, 'first_name' | 'last_name'>) {
    return [lead.last_name, lead.first_name].filter(Boolean).join(' ');
}

function LeadsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate, formatNumber } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'leads.create');
    const canUpdate = can(session, 'leads.update');
    const canDelete = can(session, 'leads.delete');
    const canConvert = canUpdate && can(session, 'students.create');
    const canOpenStudents = can(session, 'students.view');
    const canManageSettings = can(session, 'settings.manage');
    const router = useRouter();

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '', source: '', course_id: '', branch_id: '' });

    // View state persisted in URL
    const [view, setView] = useUrlParam('view', 'kanban');
    const viewMode: 'table' | 'kanban' = view === 'table' ? 'table' : 'kanban';
    const setViewMode = (next: 'table' | 'kanban') => setView(next);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Lead | null>(null);
    const [converting, setConverting] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState<Lead | null>(null);
    const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: listCourses,
    });

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });

    const kanban = viewMode === 'kanban';
    const query = useQuery({
        queryKey: [
            'leads',
            {
                search,
                ...filters,
                limit: kanban ? 1 : limit,
                offset: kanban ? 0 : offset,
            },
        ],
        queryFn: () =>
            listLeads({
                search: search || undefined,
                status: (filters.status || undefined) as LeadStatus | undefined,
                source: (filters.source || undefined) as LeadSource | undefined,
                course_id: filters.course_id || undefined,
                branch_id: filters.branch_id || undefined,
                limit: kanban ? 1 : limit,
                offset: kanban ? 0 : offset,
            }),
    });
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

    const statsQuery = useQuery({
        queryKey: ['lead-stats'],
        queryFn: getLeadStats,
    });

    function invalidate() {
        return Promise.all([
            queryClient.invalidateQueries({ queryKey: ['leads'] }),
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] }),
        ]);
    }

    const statusMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: NonNullable<LeadPayload['status']>;
        }) => updateLead(id, { status }),
        onSuccess: () => {
            toast.success(t('leads.updated'));
            return invalidate();
        },
        onError: (error) => toastError(error),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteLead(id),
        onSuccess: () => {
            invalidate();
            toast.success(t('leads.deleted'));
            setDeleting(null);
            if (drawerLead?.id === deleting?.id) setDrawerLead(null);
        },
        onError: (error) => toastError(error),
    });

    const filtered = Boolean(
        search ||
        filters.status ||
        filters.source ||
        filters.course_id ||
        filters.branch_id,
    );

    const leadsData = query.data?.data ?? [];
    const allCurrentPageSelected =
        leadsData.length > 0 &&
        leadsData.every((lead) => selectedIds.includes(lead.id));

    const toggleSelectAll = () => {
        if (allCurrentPageSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !leadsData.some((l) => l.id === id)),
            );
        } else {
            const currentIds = leadsData.map((l) => l.id);
            setSelectedIds((prev) =>
                Array.from(new Set([...prev, ...currentIds])),
            );
        }
    };

    const toggleSelectRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    // Calculate Conversion Rate & Stats
    const stats = statsQuery.data;
    const totalLeadsCount = stats
        ? stats.new + stats.contacted + stats.trial + stats.won + stats.lost
        : 0;
    const conversionRate =
        totalLeadsCount > 0 && stats
            ? Math.round((stats.won / totalLeadsCount) * 100)
            : 0;

    return (
        <>
            <PageHeader
                title={t('leads.title')}
                count={query.data?.count}
                description={t('leads.subtitle')}
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        <div className='border-card-border bg-background-gray-secondary/60 flex items-center rounded-xl border p-1'>
                            <button
                                type='button'
                                onClick={() => setViewMode('kanban')}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                                    viewMode === 'kanban'
                                        ? 'bg-card-surface-area text-text-primary shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                <Column className='size-3.5' />
                                {t('leads.viewKanban')}
                            </button>
                            <button
                                type='button'
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                                    viewMode === 'table'
                                        ? 'bg-card-surface-area text-text-primary shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                <Table2 className='size-3.5' />
                                {t('leads.viewTable')}
                            </button>
                        </div>
                        {canManageSettings && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => router.push('/settings')}
                            >
                                <Globe2 />
                                {t('leads.fromWebsite')}
                            </Button>
                        )}
                        {canCreate && (
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
                                {t('leads.new')}
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Funnel Overview Analytics Bar */}
            <div className='grid grid-cols-2 gap-2.5 px-4 pb-4 sm:grid-cols-3 sm:gap-3.5 sm:px-5 lg:grid-cols-6'>
                {LEAD_STATUSES.map((status) => {
                    const active = filters.status === status;
                    const count = stats ? stats[status] : 0;
                    const share =
                        totalLeadsCount > 0
                            ? Math.round((count / totalLeadsCount) * 100)
                            : 0;

                    return (
                        <button
                            key={status}
                            type='button'
                            aria-pressed={active}
                            onClick={() =>
                                setFilter('status', active ? '' : status)
                            }
                            className={cn(
                                'bg-card-background relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 sm:p-3.5',
                                active
                                    ? 'border-brand-accent ring-brand-accent/20 shadow-sm ring-2'
                                    : 'border-card-border hover:border-brand-accent/40 hover:shadow-2xs',
                            )}
                        >
                            <div className='flex items-center justify-between gap-1'>
                                <p className='text-text-tertiary flex min-w-0 items-center gap-1.5 text-xs font-semibold'>
                                    <LeadStatusDot status={status} />
                                    <span className='truncate'>
                                        {t(`leadStatus.${status}`)}
                                    </span>
                                </p>
                                <span className='text-text-tertiary text-[11px] font-medium tabular-nums'>
                                    {share}%
                                </span>
                            </div>
                            <p className='text-text-primary font-display mt-1.5 text-xl font-bold tabular-nums sm:text-2xl'>
                                {stats ? formatNumber(count) : '—'}
                            </p>
                        </button>
                    );
                })}

                {/* Conversion Rate Card */}
                <div className='from-brand-accent/10 via-card-background to-card-background border-brand-accent/30 relative overflow-hidden rounded-xl border bg-gradient-to-br p-3 text-left sm:p-3.5'>
                    <div className='flex items-center justify-between gap-1'>
                        <p className='text-brand-accent flex min-w-0 items-center gap-1.5 text-xs font-bold'>
                            ⚡ Konversiya
                        </p>
                    </div>
                    <p className='text-brand-accent font-display mt-1.5 text-xl font-bold tabular-nums sm:text-2xl'>
                        {conversionRate}%
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5 lg:flex-nowrap'>
                <div className='min-w-[220px] flex-1 lg:min-w-40'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('leads.search')}
                    />
                </div>

                <MobileFilterSheet
                    activeCount={
                        (filters.status ? 1 : 0) +
                        (filters.source ? 1 : 0) +
                        (filters.course_id ? 1 : 0) +
                        (filters.branch_id ? 1 : 0)
                    }
                    onClear={() => {
                        setFilter('status', '');
                        setFilter('source', '');
                        setFilter('course_id', '');
                        setFilter('branch_id', '');
                    }}
                >
                    <SelectInput
                        label={t('common.allStatuses')}
                        options={LEAD_STATUSES.map((status) => ({
                            value: status,
                            label: t(`leadStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                    <SelectInput
                        label={t('leads.allSources')}
                        options={LEAD_SOURCES.map((source) => ({
                            value: source,
                            label: t(`leadSource.${source}`),
                        }))}
                        placeholder={t('leads.allSources')}
                        value={filters.source}
                        onValueChange={(next) => setFilter('source', next)}
                    />
                    <SelectInput
                        label={t('groups.allCourses')}
                        options={(coursesQuery.data ?? []).map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                        placeholder={t('groups.allCourses')}
                        value={filters.course_id}
                        onValueChange={(next) => setFilter('course_id', next)}
                    />
                    {(branchesQuery.data ?? []).length > 1 && (
                        <SelectInput
                            label={t('groups.allBranches')}
                            options={(branchesQuery.data ?? []).map((b) => ({
                                value: b.id,
                                label: b.name,
                            }))}
                            placeholder={t('groups.allBranches')}
                            value={filters.branch_id}
                            onValueChange={(next) =>
                                setFilter('branch_id', next)
                            }
                        />
                    )}
                </MobileFilterSheet>

                <div className='hidden min-w-0 items-center gap-2.5 sm:flex'>
                    <div className='w-40 shrink'>
                        <SelectInput
                            options={LEAD_STATUSES.map((status) => ({
                                value: status,
                                label: t(`leadStatus.${status}`),
                            }))}
                            placeholder={t('common.allStatuses')}
                            value={filters.status}
                            onValueChange={(next) => setFilter('status', next)}
                        />
                    </div>
                    <div className='w-40 shrink'>
                        <SelectInput
                            options={LEAD_SOURCES.map((source) => ({
                                value: source,
                                label: t(`leadSource.${source}`),
                            }))}
                            placeholder={t('leads.allSources')}
                            value={filters.source}
                            onValueChange={(next) => setFilter('source', next)}
                        />
                    </div>
                    <div className='w-44 shrink'>
                        <SelectInput
                            options={(coursesQuery.data ?? []).map((c) => ({
                                value: c.id,
                                label: c.name,
                            }))}
                            placeholder={t('groups.allCourses')}
                            value={filters.course_id}
                            onValueChange={(next) =>
                                setFilter('course_id', next)
                            }
                        />
                    </div>
                    {(branchesQuery.data ?? []).length > 1 && (
                        <div className='w-40 shrink'>
                            <SelectInput
                                options={(branchesQuery.data ?? []).map(
                                    (b) => ({
                                        value: b.id,
                                        label: b.name,
                                    }),
                                )}
                                placeholder={t('groups.allBranches')}
                                value={filters.branch_id}
                                onValueChange={(next) =>
                                    setFilter('branch_id', next)
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className='px-4 sm:px-5'>
                {query.isPending ? (
                    <TableSkeleton columns={6} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.data.length === 0 ? (
                    <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                        <EmptyState
                            message={t(
                                filtered ? 'leads.empty' : 'leads.emptyFirst',
                            )}
                            hint={filtered ? undefined : t('leads.emptyHint')}
                            icon={<Funnel1 className='size-5' />}
                            action={
                                filtered ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('status', '');
                                            setFilter('source', '');
                                            setFilter('course_id', '');
                                            setFilter('branch_id', '');
                                        }}
                                    >
                                        {t('filters.reset')}
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
                                        {t('leads.addFirst')}
                                    </Button>
                                ) : null
                            }
                        />
                    </div>
                ) : viewMode === 'kanban' ? (
                    <LeadKanbanBoard
                        filters={{
                            search: search || undefined,
                            source: (filters.source || undefined) as
                                | LeadSource
                                | undefined,
                            course_id: filters.course_id || undefined,
                            branch_id: filters.branch_id || undefined,
                        }}
                        onlyStatus={
                            (filters.status || undefined) as
                                | LeadStatus
                                | undefined
                        }
                        onStatusChange={(id, status) =>
                            statusMutation.mutateAsync({ id, status })
                        }
                        onEdit={(lead) => {
                            setEditing(lead);
                            setFormOpen(true);
                        }}
                        onConvert={(lead) => setConverting(lead)}
                        onSelectLead={(lead) => setDrawerLead(lead)}
                        canUpdate={canUpdate}
                        canConvert={canConvert}
                    />
                ) : (
                    <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                        <>
                            {/* Mobile Cards (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.data.map((lead, index) => (
                                    <div
                                        key={lead.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div
                                                className='min-w-0 flex-1 cursor-pointer'
                                                onClick={() =>
                                                    setDrawerLead(lead)
                                                }
                                            >
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{offset + index + 1}
                                                    </span>
                                                    <span className='text-text-primary hover:text-brand-accent truncate text-sm font-bold'>
                                                        {leadName(lead)}
                                                    </span>
                                                </div>
                                                <div className='mt-0.5 text-xs'>
                                                    <PhoneLink
                                                        phone={
                                                            lead.phone_number
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <LeadStatusBadge
                                                status={lead.status}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <div className='flex items-center gap-2'>
                                                <LeadSourceBadge
                                                    source={lead.source}
                                                />
                                                {lead.course && (
                                                    <span className='text-text-secondary text-xs font-medium'>
                                                        {lead.course.name}
                                                    </span>
                                                )}
                                            </div>
                                            <span className='text-text-tertiary text-xs tabular-nums'>
                                                {formatDate(lead.created_at)}
                                            </span>
                                        </div>

                                        <div className='border-card-border/60 flex items-center justify-end gap-1.5 border-t pt-2.5'>
                                            <Button
                                                appearance='outline'
                                                size='sm'
                                                onPress={() =>
                                                    setDrawerLead(lead)
                                                }
                                                className='mr-auto text-xs'
                                            >
                                                <Eye className='size-3.5' />
                                                <span>Tafsilotlar</span>
                                            </Button>

                                            {lead.student &&
                                                canOpenStudents && (
                                                    <Link
                                                        href={`/students/${lead.student.id}`}
                                                        className='text-brand-accent text-xs font-semibold hover:underline'
                                                    >
                                                        {t('leads.openStudent')}
                                                    </Link>
                                                )}
                                            {canConvert &&
                                                lead.status !== 'won' && (
                                                    <Button
                                                        variant='primary'
                                                        appearance='outline'
                                                        size='sm'
                                                        onPress={() =>
                                                            setConverting(lead)
                                                        }
                                                        className='text-xs'
                                                    >
                                                        {t('leads.convert')}
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
                                                        setEditing(lead);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <Pencil1 className='size-3.5' />
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
                                                        setDeleting(lead)
                                                    }
                                                >
                                                    <Trash1 className='size-3.5' />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop / Tablet Table (>= md) */}
                            <div className='hidden md:block'>
                                <TableRoot
                                    fullBleed
                                    className='border-x-0 border-t-0'
                                >
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-10 text-center'>
                                                <input
                                                    type='checkbox'
                                                    checked={
                                                        allCurrentPageSelected
                                                    }
                                                    onChange={toggleSelectAll}
                                                    className='border-card-border text-brand-accent focus:ring-brand-accent/20 size-4 cursor-pointer rounded'
                                                />
                                            </TableHead>
                                            <RowNumberHead />
                                            <TableHead>
                                                {t('common.fullName')}
                                            </TableHead>
                                            <TableHead>
                                                {t('leads.source')}
                                            </TableHead>
                                            <TableHead>
                                                {t('leads.interest')}
                                            </TableHead>
                                            <TableHead>
                                                {t('common.status')}
                                            </TableHead>
                                            <TableHead>
                                                {t('common.createdAt')}
                                            </TableHead>
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {query.data.data.map((lead, index) => {
                                            const isSelected =
                                                selectedIds.includes(lead.id);

                                            return (
                                                <TableRow
                                                    key={lead.id}
                                                    className={cn(
                                                        isSelected &&
                                                            'bg-brand-accent/5',
                                                    )}
                                                >
                                                    <TableCell className='text-center'>
                                                        <input
                                                            type='checkbox'
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleSelectRow(
                                                                    lead.id,
                                                                )
                                                            }
                                                            className='border-card-border text-brand-accent focus:ring-brand-accent/20 size-4 cursor-pointer rounded'
                                                        />
                                                    </TableCell>
                                                    <RowNumberCell
                                                        index={index}
                                                        offset={offset}
                                                    />
                                                    <TableCell
                                                        primary
                                                        className='group cursor-pointer'
                                                        onClick={() =>
                                                            setDrawerLead(lead)
                                                        }
                                                    >
                                                        <span className='group-hover:text-brand-accent font-bold transition-colors'>
                                                            {leadName(lead)}
                                                        </span>
                                                        <div
                                                            className='mt-0.5 text-xs font-normal'
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <PhoneLink
                                                                phone={
                                                                    lead.phone_number
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <LeadSourceBadge
                                                            source={lead.source}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {lead.course?.name ??
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {canUpdate &&
                                                        lead.status !==
                                                            'won' ? (
                                                            <div className='flex w-44 items-center gap-2'>
                                                                <LeadStatusDot
                                                                    status={
                                                                        lead.status
                                                                    }
                                                                />
                                                                <SelectInput
                                                                    options={EDITABLE_LEAD_STATUSES.map(
                                                                        (
                                                                            status,
                                                                        ) => ({
                                                                            value: status,
                                                                            label: t(
                                                                                `leadStatus.${status}`,
                                                                            ),
                                                                        }),
                                                                    )}
                                                                    value={
                                                                        lead.status
                                                                    }
                                                                    disabled={
                                                                        statusMutation.isPending
                                                                    }
                                                                    onValueChange={(
                                                                        status,
                                                                    ) =>
                                                                        statusMutation.mutate(
                                                                            {
                                                                                id: lead.id,
                                                                                status: status as NonNullable<
                                                                                    LeadPayload['status']
                                                                                >,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <LeadStatusBadge
                                                                status={
                                                                    lead.status
                                                                }
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            lead.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex justify-end gap-1.5'>
                                                            <Button
                                                                appearance='outline'
                                                                size='md'
                                                                iconOnly
                                                                aria-label='Tafsilotlar'
                                                                onPress={() =>
                                                                    setDrawerLead(
                                                                        lead,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className='size-4' />
                                                            </Button>
                                                            {lead.student &&
                                                                canOpenStudents && (
                                                                    <Link
                                                                        href={`/students/${lead.student.id}`}
                                                                        className='text-brand-accent self-center px-1 text-sm font-semibold hover:underline'
                                                                    >
                                                                        {t(
                                                                            'leads.openStudent',
                                                                        )}
                                                                    </Link>
                                                                )}
                                                            {canConvert &&
                                                                lead.status !==
                                                                    'won' && (
                                                                    <Button
                                                                        variant='primary'
                                                                        appearance='outline'
                                                                        size='md'
                                                                        onPress={() =>
                                                                            setConverting(
                                                                                lead,
                                                                            )
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'leads.convert',
                                                                        )}
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
                                                                            lead,
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
                                                                            lead,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash1 />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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
                    </div>
                )}
            </div>

            {/* Modals & Drawers */}
            {formOpen && (
                <LeadFormModal
                    lead={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {converting && (
                <ConvertLeadModal
                    lead={converting}
                    onClose={() => setConverting(null)}
                />
            )}

            {drawerLead && (
                <LeadDetailDrawer
                    lead={drawerLead}
                    onClose={() => setDrawerLead(null)}
                    onEdit={(lead) => {
                        setDrawerLead(null);
                        setEditing(lead);
                        setFormOpen(true);
                    }}
                    onConvert={(lead) => {
                        setDrawerLead(null);
                        setConverting(lead);
                    }}
                    onDelete={(lead) => {
                        setDrawerLead(null);
                        setDeleting(lead);
                    }}
                />
            )}

            <LeadBatchActionsBar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
                canUpdate={canUpdate}
                canDelete={canDelete}
            />

            <ConfirmDialog
                open={deleting !== null}
                title={t('leads.deleteTitle')}
                message={t('leads.deleteMessage', {
                    name: deleting ? leadName(deleting) : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
