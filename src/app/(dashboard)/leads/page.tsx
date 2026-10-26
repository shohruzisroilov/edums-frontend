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
import {
    LeadKanbanBoard,
    type KanbanDensity,
    type QuickFilterType,
} from '@/components/ui/lead-kanban-board';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PhoneLink } from '@/components/ui/phone-link';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SortableHead } from '@/components/ui/sortable-head';
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
import { deleteLead, listLeads, updateLead } from '@/services/api/leads';
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
import { exportToExcel } from '@/utils/export';
import { formatPhone } from '@/utils/format';
import {
    Close,
    Column,
    Download1,
    Eye,
    Funnel1,
    Globe2,
    Layout5,
    Layout6,
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
    const { formatDate } = useFormat();
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
        sortBy,
        sortOrder,
        toggleSort,
    } = useListQuery({
        status: '',
        source: '',
        course_id: '',
        branch_id: '',
        call_filter: '',
    });

    // View state persisted in URL
    const [view, setView] = useUrlParam('view', 'kanban');
    const viewMode: 'table' | 'kanban' = view === 'table' ? 'table' : 'kanban';
    const setViewMode = (next: 'table' | 'kanban') => setView(next);

    const [density, setDensity] = useState<KanbanDensity>(() => {
        if (typeof window === 'undefined') return 'compact';
        try {
            const stored = localStorage.getItem('edums_kanban_density');
            if (stored === 'comfortable' || stored === 'compact') return stored;
        } catch {}
        return 'compact';
    });

    const handleDensityChange = (newDensity: KanbanDensity) => {
        setDensity(newDensity);
        try {
            localStorage.setItem('edums_kanban_density', newDensity);
        } catch {}
    };

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
                sortBy,
                sortOrder,
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
                sort_by: sortBy || undefined,
                order: sortOrder || undefined,
            }),
    });
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

    function invalidate() {
        return queryClient.invalidateQueries({ queryKey: ['leads'] });
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
        filters.branch_id ||
        filters.call_filter,
    );

    const todayStr = new Date().toISOString().slice(0, 10);
    const rawLeads = query.data?.data ?? [];
    const leadsData = rawLeads.filter((l) => {
        if (filters.call_filter === 'today') {
            return (
                l.next_call_date &&
                l.next_call_date.slice(0, 10) === todayStr &&
                l.status !== 'won'
            );
        }
        if (filters.call_filter === 'overdue') {
            return (
                l.next_call_date &&
                l.next_call_date.slice(0, 10) < todayStr &&
                l.status !== 'won'
            );
        }
        if (filters.call_filter === 'with_notes') {
            return Boolean(l.note?.trim());
        }
        return true;
    });

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

    const [exporting, setExporting] = useState(false);

    const handleExportExcel = async (onlySelected = false) => {
        try {
            setExporting(true);
            let list = onlySelected
                ? leadsData.filter((l) => selectedIds.includes(l.id))
                : leadsData;
            const total = query.data?.count ?? 0;
            if (!onlySelected && total > leadsData.length) {
                const res = await listLeads({
                    search: search || undefined,
                    status: (filters.status || undefined) as
                        | LeadStatus
                        | undefined,
                    source: (filters.source || undefined) as
                        | LeadSource
                        | undefined,
                    course_id: filters.course_id || undefined,
                    branch_id: filters.branch_id || undefined,
                    limit: Math.min(total, 200),
                    offset: 0,
                    sort_by: sortBy || undefined,
                    order: sortOrder || undefined,
                });
                let fetched = res.data;
                if (filters.call_filter === 'today') {
                    fetched = fetched.filter(
                        (l) =>
                            l.next_call_date &&
                            l.next_call_date.slice(0, 10) === todayStr &&
                            l.status !== 'won',
                    );
                } else if (filters.call_filter === 'overdue') {
                    fetched = fetched.filter(
                        (l) =>
                            l.next_call_date &&
                            l.next_call_date.slice(0, 10) < todayStr &&
                            l.status !== 'won',
                    );
                } else if (filters.call_filter === 'with_notes') {
                    fetched = fetched.filter((l) => Boolean(l.note?.trim()));
                }
                list = fetched;
            }
            if (list.length === 0) return;

            await exportToExcel(
                t('leads.title'),
                'Leads',
                [
                    t('common.fullName'),
                    t('common.phone'),
                    t('common.status'),
                    t('leads.source'),
                    t('courses.title'),
                    t('branches.title'),
                    t('common.createdAt'),
                    t('common.description'),
                ],
                list.map((l) => [
                    leadName(l),
                    l.phone_number ? formatPhone(l.phone_number) : '',
                    t(`leadStatus.${l.status}`),
                    l.source ? t(`leadSource.${l.source}`) : '',
                    l.course?.name || '',
                    l.branch?.name || '',
                    formatDate(l.created_at),
                    l.note || '',
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
                title={t('leads.title')}
                count={query.data?.count}
                description={t('leads.subtitle')}
                breakpoint='xl'
                actions={
                    <div className='flex w-full flex-wrap items-center justify-between gap-2.5 sm:gap-3 xl:w-auto xl:justify-end'>
                        {/* Switchers Group */}
                        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                            <div className='border-card-border bg-background-gray-secondary/60 flex items-center rounded-xl border p-0.5 sm:p-1'>
                                <button
                                    type='button'
                                    onClick={() => setViewMode('kanban')}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors sm:px-2.5',
                                        viewMode === 'kanban'
                                            ? 'bg-card-surface-area text-text-primary shadow-xs'
                                            : 'text-text-tertiary hover:text-text-primary',
                                    )}
                                >
                                    <Column className='size-3.5' />
                                    <span>{t('leads.viewKanban')}</span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setViewMode('table')}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors sm:px-2.5',
                                        viewMode === 'table'
                                            ? 'bg-card-surface-area text-text-primary shadow-xs'
                                            : 'text-text-tertiary hover:text-text-primary',
                                    )}
                                >
                                    <Table2 className='size-3.5' />
                                    <span>{t('leads.viewTable')}</span>
                                </button>
                            </div>

                            {viewMode === 'kanban' && (
                                <div className='border-card-border bg-background-gray-secondary/60 flex items-center rounded-xl border p-0.5 sm:p-1'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            handleDensityChange('compact')
                                        }
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors sm:px-2.5',
                                            density === 'compact'
                                                ? 'bg-card-surface-area text-text-primary shadow-xs'
                                                : 'text-text-tertiary hover:text-text-primary',
                                        )}
                                        title={t('leads.densityCompact')}
                                    >
                                        <Layout6 className='size-3.5' />
                                        <span>{t('leads.densityCompact')}</span>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            handleDensityChange('comfortable')
                                        }
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors sm:px-2.5',
                                            density === 'comfortable'
                                                ? 'bg-card-surface-area text-text-primary shadow-xs'
                                                : 'text-text-tertiary hover:text-text-primary',
                                        )}
                                        title={t('leads.densityComfortable')}
                                    >
                                        <Layout5 className='size-3.5' />
                                        <span>
                                            {t('leads.densityComfortable')}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions Group */}
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            {leadsData.length > 0 && (
                                <Button
                                    appearance='outline'
                                    size='sm'
                                    className='sm:h-9'
                                    isPending={exporting}
                                    onPress={() =>
                                        void handleExportExcel(false)
                                    }
                                >
                                    <Download1 className='size-3.5 sm:size-4' />
                                    <span className='xs:inline hidden sm:inline'>
                                        {t('common.export')}
                                    </span>
                                </Button>
                            )}
                            {canManageSettings && (
                                <Button
                                    appearance='outline'
                                    size='sm'
                                    className='sm:h-9'
                                    onPress={() => router.push('/settings')}
                                >
                                    <Globe2 className='size-3.5 sm:size-4' />
                                    <span className='xs:inline hidden sm:inline'>
                                        {t('leads.fromWebsite')}
                                    </span>
                                </Button>
                            )}
                            {canCreate && (
                                <Button
                                    variant='primary'
                                    appearance='fill'
                                    size='sm'
                                    className='sm:h-9'
                                    onPress={() => {
                                        setEditing(null);
                                        setFormOpen(true);
                                    }}
                                >
                                    <Plus className='size-3.5 sm:size-4' />
                                    <span>{t('leads.new')}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5'>
                <div className='min-w-0 flex-1 sm:min-w-[220px]'>
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
                        (filters.branch_id ? 1 : 0) +
                        (filters.call_filter ? 1 : 0)
                    }
                    onClear={() => {
                        setFilter('status', '');
                        setFilter('source', '');
                        setFilter('course_id', '');
                        setFilter('branch_id', '');
                        setFilter('call_filter', '');
                    }}
                >
                    <SelectInput
                        label={t('leads.callFilter')}
                        options={[
                            { value: '', label: t('leads.allCalls') },
                            {
                                value: 'today',
                                label: t('leads.todayCalls'),
                            },
                            {
                                value: 'overdue',
                                label: t('leads.overdueCalls'),
                            },
                            {
                                value: 'with_notes',
                                label: t('leads.withNotes'),
                            },
                        ]}
                        placeholder={t('leads.callFilter')}
                        value={filters.call_filter}
                        onValueChange={(next) => setFilter('call_filter', next)}
                    />
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
                {filtered && (
                    <button
                        type='button'
                        onClick={() => {
                            setSearch('');
                            setFilter('status', '');
                            setFilter('source', '');
                            setFilter('course_id', '');
                            setFilter('branch_id', '');
                            setFilter('call_filter', '');
                        }}
                        className='text-brand-accent hover:bg-brand-accent/10 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors sm:hidden'
                    >
                        <Close className='size-3' />
                        <span>{t('filters.clear')}</span>
                    </button>
                )}

                <div className='hidden w-44 shrink sm:block'>
                    <SelectInput
                        options={[
                            { value: '', label: t('leads.allCalls') },
                            {
                                value: 'today',
                                label: t('leads.todayCalls'),
                            },
                            {
                                value: 'overdue',
                                label: t('leads.overdueCalls'),
                            },
                            {
                                value: 'with_notes',
                                label: t('leads.withNotes'),
                            },
                        ]}
                        placeholder={t('leads.callFilter')}
                        value={filters.call_filter}
                        onValueChange={(next) => setFilter('call_filter', next)}
                    />
                </div>
                <div className='hidden w-40 shrink sm:block'>
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
                <div className='hidden w-40 shrink sm:block'>
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
                <div className='hidden w-44 shrink sm:block'>
                    <SelectInput
                        options={(coursesQuery.data ?? []).map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                        placeholder={t('groups.allCourses')}
                        value={filters.course_id}
                        onValueChange={(next) => setFilter('course_id', next)}
                    />
                </div>
                {(branchesQuery.data ?? []).length > 1 && (
                    <div className='hidden w-40 shrink sm:block'>
                        <SelectInput
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
                    </div>
                )}
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
                                            setFilter('call_filter', '');
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
                        density={density}
                        filters={{
                            search: search || undefined,
                            source: (filters.source || undefined) as
                                | LeadSource
                                | undefined,
                            course_id: filters.course_id || undefined,
                            branch_id: filters.branch_id || undefined,
                        }}
                        quickFilter={
                            (filters.call_filter as QuickFilterType) || 'all'
                        }
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
                        onDelete={(lead) => setDeleting(lead)}
                        onSelectLead={(lead) => setDrawerLead(lead)}
                        canCreate={canCreate}
                        canUpdate={canUpdate}
                        canConvert={canConvert}
                        canDelete={canDelete}
                        defaultBranchId={
                            filters.branch_id || branchesQuery.data?.[0]?.id
                        }
                        onOpenFullForm={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    />
                ) : (
                    <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                        <>
                            {/* Mobile Select All Header (< md) */}
                            {leadsData.length > 0 && (
                                <div className='border-card-border bg-background-gray-secondary/40 flex items-center justify-between border-b px-4 py-2.5 md:hidden'>
                                    <label className='text-text-secondary flex cursor-pointer items-center gap-2 text-xs font-semibold select-none'>
                                        <input
                                            type='checkbox'
                                            checked={allCurrentPageSelected}
                                            onChange={toggleSelectAll}
                                            className='border-card-border text-brand-accent focus:ring-brand-accent/20 size-4 cursor-pointer rounded'
                                        />
                                        <span>
                                            {allCurrentPageSelected
                                                ? t('filters.clear')
                                                : 'Barchasini tanlash'}
                                        </span>
                                    </label>
                                    {selectedIds.length > 0 && (
                                        <span className='bg-brand-accent/10 text-brand-accent rounded-md px-2 py-0.5 text-xs font-bold tabular-nums'>
                                            {selectedIds.length} ta tanlandi
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Mobile Cards (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {leadsData.map((lead, index) => (
                                    <div
                                        key={lead.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedIds.includes(
                                                        lead.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectRow(lead.id)
                                                    }
                                                    className='border-card-border text-brand-accent focus:ring-brand-accent/20 mt-1 size-4 shrink-0 cursor-pointer rounded'
                                                    aria-label={`${leadName(lead)} tanlash`}
                                                />
                                                <div
                                                    className='min-w-0 flex-1 cursor-pointer'
                                                    onClick={() =>
                                                        setDrawerLead(lead)
                                                    }
                                                >
                                                    <div className='flex items-start gap-2'>
                                                        <span className='text-text-tertiary mt-0.5 shrink-0 text-xs font-semibold tabular-nums'>
                                                            #
                                                            {offset + index + 1}
                                                        </span>
                                                        <span className='text-text-primary hover:text-brand-accent text-sm font-bold break-words'>
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
                                            <SortableHead
                                                field='name'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.fullName')}
                                            </SortableHead>
                                            <TableHead>
                                                {t('leads.source')}
                                            </TableHead>
                                            <TableHead>
                                                {t('leads.interest')}
                                            </TableHead>
                                            <SortableHead
                                                field='status'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.status')}
                                            </SortableHead>
                                            <SortableHead
                                                field='created_at'
                                                defaultOrder='desc'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.createdAt')}
                                            </SortableHead>
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leadsData.map((lead, index) => {
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
                onExport={() => handleExportExcel(true)}
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
