'use client';

import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import { LeadSourceBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { listLeads } from '@/services/api/leads';
import type {
    EditableLeadStatus,
    Lead,
    LeadSource,
    LeadStatus,
} from '@/types/api';
import { LEAD_STATUSES } from '@/types/api';
import { cn } from '@/utils/cn';
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DropResult,
} from '@hello-pangea/dnd';
import {
    ArrowRight,
    CalendarTime,
    Check,
    CheckCircle1,
    ClockThree,
    Envelope1,
    ErrorCircle1,
    Eye,
    Message1,
    Pencil1,
    Plus,
    Reload,
    Send1,
    Target3,
    Telephone1,
    Trash1,
    User2,
    XmarkCircle,
} from '@tailgrids/icons';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );
}

/** Ustunga bir martada yuklanadigan lidlar soni. */
const COLUMN_PAGE = 30;

export interface KanbanFilters {
    search?: string;
    source?: LeadSource;
    course_id?: string;
    branch_id?: string;
}

export type QuickFilterType = 'all' | 'today' | 'overdue' | 'with_notes';
export type KanbanDensity = 'comfortable' | 'compact';

const STATUS_CONFIG: Record<
    LeadStatus,
    {
        titleKey: string;
        topBorder: string;
        accentBg: string;
        accentText: string;
        Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
    }
> = {
    new: {
        titleKey: 'leadStatus.new',
        topBorder: 'border-t-sky-500',
        accentBg: 'bg-sky-50 dark:bg-sky-950/20',
        accentText: 'text-sky-600 dark:text-sky-400',
        Icon: Envelope1,
    },
    contacted: {
        titleKey: 'leadStatus.contacted',
        topBorder: 'border-t-amber-500',
        accentBg: 'bg-amber-50 dark:bg-amber-950/20',
        accentText: 'text-amber-600 dark:text-amber-400',
        Icon: Telephone1,
    },
    trial: {
        titleKey: 'leadStatus.trial',
        topBorder: 'border-t-indigo-500',
        accentBg: 'bg-indigo-50 dark:bg-indigo-950/20',
        accentText: 'text-indigo-600 dark:text-indigo-400',
        Icon: Target3,
    },
    won: {
        titleKey: 'leadStatus.won',
        topBorder: 'border-t-emerald-500',
        accentBg: 'bg-emerald-50 dark:bg-emerald-950/20',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        Icon: CheckCircle1,
    },
    lost: {
        titleKey: 'leadStatus.lost',
        topBorder: 'border-t-rose-500',
        accentBg: 'bg-rose-50 dark:bg-rose-950/20',
        accentText: 'text-rose-600 dark:text-rose-400',
        Icon: XmarkCircle,
    },
};

/**
 * Bitta ustun — o'z holatidagi lidlar, sahifalab. Har ustun alohida so'raladi.
 */
function useLeadColumn(
    status: LeadStatus,
    filters: KanbanFilters,
    enabled: boolean,
) {
    const query = useInfiniteQuery({
        queryKey: ['leads', 'kanban', status, filters],
        queryFn: ({ pageParam }) =>
            listLeads({
                ...filters,
                status,
                limit: COLUMN_PAGE,
                offset: pageParam,
            }),
        initialPageParam: 0,
        getNextPageParam: (last, pages) => {
            const loaded = pages.reduce(
                (sum, page) => sum + page.data.length,
                0,
            );
            return loaded < last.count ? loaded : undefined;
        },
        enabled,
    });

    return {
        leads: query.data?.pages.flatMap((page) => page.data) ?? [],
        count: query.data?.pages[0]?.count ?? 0,
        isPending: enabled && query.isPending,
        hasMore: query.hasNextPage,
        loadingMore: query.isFetchingNextPage,
        loadMore: () => void query.fetchNextPage(),
    };
}

export function LeadKanbanBoard({
    filters,
    quickFilter = 'all',
    density = 'compact',
    onlyStatus,
    onStatusChange,
    onEdit,
    onConvert,
    onDelete,
    onSelectLead,
    canCreate = true,
    canUpdate,
    canConvert,
    canDelete = false,
    defaultBranchId: _defaultBranchId,
    onOpenFullForm,
}: {
    filters: KanbanFilters;
    quickFilter?: QuickFilterType;
    density?: KanbanDensity;
    /** Holat filtri tanlangan bo'lsa — faqat shu ustun. */
    onlyStatus?: LeadStatus;
    /**
     * "O'quvchi bo'ldi" bu yerga kelmaydi — u faqat onConvert orqali.
     */
    onStatusChange: (
        leadId: string,
        status: EditableLeadStatus,
    ) => Promise<unknown>;
    onEdit: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    onDelete?: (lead: Lead) => void;
    onSelectLead?: (lead: Lead) => void;
    canCreate?: boolean;
    canUpdate: boolean;
    canConvert: boolean;
    canDelete?: boolean;
    defaultBranchId?: string;
    onOpenFullForm?: (status?: LeadStatus) => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const queryClient = useQueryClient();
    const _toastError = useApiErrorToast();

    // Client-side hydration guard for smooth DnD mounting
    const isMounted = useIsClient();

    const shown = (status: LeadStatus) => !onlyStatus || onlyStatus === status;
    const columns: Record<LeadStatus, ReturnType<typeof useLeadColumn>> = {
        new: useLeadColumn('new', filters, shown('new')),
        contacted: useLeadColumn('contacted', filters, shown('contacted')),
        trial: useLeadColumn('trial', filters, shown('trial')),
        won: useLeadColumn('won', filters, shown('won')),
        lost: useLeadColumn('lost', filters, shown('lost')),
    };
    const statuses = LEAD_STATUSES.filter(shown);
    const allQueryLeads = statuses.flatMap((status) => columns[status].leads);

    const [tab, setActiveTab] = useState<LeadStatus>('new');
    const activeTab = onlyStatus ?? tab;

    // Instant optimistic status map (0ms lag on drag & drop or advance)
    const [optimisticStatusMap, setOptimisticStatusMap] = useState<
        Record<string, LeadStatus>
    >({});

    // Column custom order map — preserves user's exact drop positions across columns and within columns
    const [columnOrderMap, setColumnOrderMap] = useState<
        Record<LeadStatus, string[]>
    >(() => {
        if (typeof window === 'undefined') {
            return { new: [], contacted: [], trial: [], won: [], lost: [] };
        }
        try {
            const stored = localStorage.getItem('edums_kanban_col_order');
            if (stored) return JSON.parse(stored);
        } catch {}
        return { new: [], contacted: [], trial: [], won: [], lost: [] };
    });

    const saveColumnOrder = (newOrder: Record<LeadStatus, string[]>) => {
        setColumnOrderMap(newOrder);
        try {
            localStorage.setItem(
                'edums_kanban_col_order',
                JSON.stringify(newOrder),
            );
        } catch {}
    };

    const totalLeadsCount = Object.values(columns).reduce(
        (sum, col) => sum + col.count,
        0,
    );

    const todayStr = new Date().toISOString().slice(0, 10);

    function advanceLeadStatus(
        lead: Lead,
        targetStatus: EditableLeadStatus,
        targetIndex = 0,
    ) {
        const currentStatus = optimisticStatusMap[lead.id] ?? lead.status;
        const prevOrder = { ...columnOrderMap };

        const nextSource = (
            columnOrderMap[currentStatus] ??
            getColumnLeads(currentStatus).leads.map((l) => l.id)
        ).filter((id) => id !== lead.id);

        const baseTarget = (
            columnOrderMap[targetStatus] ??
            getColumnLeads(targetStatus).leads.map((l) => l.id)
        ).filter((id) => id !== lead.id);

        const nextTarget = [...baseTarget];
        nextTarget.splice(targetIndex, 0, lead.id);

        saveColumnOrder({
            ...columnOrderMap,
            [currentStatus]: nextSource,
            [targetStatus]: nextTarget,
        });

        void queryClient.cancelQueries({ queryKey: ['leads'] });
        setOptimisticStatusMap((prev) => ({
            ...prev,
            [lead.id]: targetStatus,
        }));

        onStatusChange(lead.id, targetStatus)
            .catch(() => {
                saveColumnOrder(prevOrder);
            })
            .finally(() =>
                setOptimisticStatusMap((prev) => {
                    const next = { ...prev };
                    delete next[lead.id];
                    return next;
                }),
            );
    }

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const sourceStatus = source.droppableId as LeadStatus;
        const targetStatus = destination.droppableId as LeadStatus;

        // Aniq ustundagi joriy ko'rinayotgan lidlar ro'yxati
        const sourceLeads = getColumnLeads(sourceStatus).leads;
        const targetLeads =
            sourceStatus === targetStatus
                ? sourceLeads
                : getColumnLeads(targetStatus).leads;

        const draggedLead =
            sourceLeads[source.index] ??
            allQueryLeads.find((l) => l.id === draggableId);
        if (!draggedLead) return;

        // 1-HOLAT: Bitta ustunning o'zida surish (tepaga yoki pastga tartiblash)
        if (sourceStatus === targetStatus) {
            const nextIds = sourceLeads.map((l) => l.id);
            const [movedId] = nextIds.splice(source.index, 1);
            if (!movedId) return;
            nextIds.splice(destination.index, 0, movedId);

            saveColumnOrder({
                ...columnOrderMap,
                [sourceStatus]: nextIds,
            });
            return;
        }

        // 2-HOLAT: Boshqa ustunga (boshqa statusga) ko'chirish
        if (targetStatus === 'won') {
            if (canConvert) {
                onConvert(draggedLead);
            }
            return;
        }

        if (!canUpdate) return;

        const nextSourceIds = sourceLeads.map((l) => l.id);
        const nextTargetIds = targetLeads.map((l) => l.id);

        nextSourceIds.splice(source.index, 1);
        nextTargetIds.splice(destination.index, 0, draggableId);

        const prevOrder = { ...columnOrderMap };
        saveColumnOrder({
            ...columnOrderMap,
            [sourceStatus]: nextSourceIds,
            [targetStatus]: nextTargetIds,
        });

        void queryClient.cancelQueries({ queryKey: ['leads'] });
        setOptimisticStatusMap((prev) => ({
            ...prev,
            [draggedLead.id]: targetStatus,
        }));

        onStatusChange(draggedLead.id, targetStatus as EditableLeadStatus)
            .catch(() => {
                saveColumnOrder(prevOrder);
            })
            .finally(() => {
                setOptimisticStatusMap((prev) => {
                    const next = { ...prev };
                    delete next[draggedLead.id];
                    return next;
                });
            });
    };

    function getColumnLeads(status: LeadStatus): {
        leads: Lead[];
        count: number;
    } {
        const queryCol = columns[status];
        const rawLeads = queryCol.leads;

        // Shu statusga tegishli barcha lidlarni to'plash
        const candidatesMap = new Map<string, Lead>();

        for (const lead of rawLeads) {
            const eff = optimisticStatusMap[lead.id] ?? lead.status;
            if (eff === status) {
                candidatesMap.set(lead.id, lead);
            }
        }

        for (const lead of allQueryLeads) {
            const eff = optimisticStatusMap[lead.id] ?? lead.status;
            if (eff === status && !candidatesMap.has(lead.id)) {
                candidatesMap.set(lead.id, lead);
            }
        }

        const candidates = Array.from(candidatesMap.values());

        // columnOrderMap bo'yicha aniq tartiblash
        const customOrder = columnOrderMap[status] ?? [];
        const orderIndexMap = new Map<string, number>();
        customOrder.forEach((id, idx) => orderIndexMap.set(id, idx));

        const sortedLeads = candidates.sort((a, b) => {
            const idxA = orderIndexMap.has(a.id)
                ? orderIndexMap.get(a.id)!
                : -1;
            const idxB = orderIndexMap.has(b.id)
                ? orderIndexMap.get(b.id)!
                : -1;

            if (idxA !== -1 && idxB !== -1) {
                return idxA - idxB;
            }
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;

            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });

        // Quick filter qo'llash
        let filtered = sortedLeads;
        if (quickFilter === 'today') {
            filtered = filtered.filter(
                (l) =>
                    l.next_call_date &&
                    l.next_call_date.slice(0, 10) === todayStr &&
                    (optimisticStatusMap[l.id] ?? l.status) !== 'won',
            );
        } else if (quickFilter === 'overdue') {
            filtered = filtered.filter(
                (l) =>
                    l.next_call_date &&
                    l.next_call_date.slice(0, 10) < todayStr &&
                    (optimisticStatusMap[l.id] ?? l.status) !== 'won',
            );
        } else if (quickFilter === 'with_notes') {
            filtered = filtered.filter((l) => Boolean(l.note?.trim()));
        }

        const delta = candidates.length - rawLeads.length;
        const count = Math.max(0, queryCol.count + delta);

        return { leads: filtered, count };
    }

    const renderBoardContent = () => (
        <div className='block w-full pt-1 pb-4 sm:flex sm:scrollbar-thin sm:items-start sm:gap-3.5 sm:overflow-x-auto sm:pb-6'>
            {statuses.map((status) => {
                const column = columns[status];
                const { leads: columnLeads, count: columnCount } =
                    getColumnLeads(status);
                const cfg = STATUS_CONFIG[status];

                const percentage =
                    totalLeadsCount > 0
                        ? Math.round((columnCount / totalLeadsCount) * 100)
                        : 0;

                return (
                    <div
                        key={status}
                        className={cn(
                            'border-card-border bg-background-gray-secondary/35 flex min-h-[360px] w-full shrink-0 flex-col rounded-2xl border p-2.5 shadow-2xs transition-all duration-200 ease-out sm:min-h-[560px] sm:w-[280px] lg:w-[290px] xl:w-[305px]',
                            cfg.topBorder,
                            'border-t-4',
                            status !== activeTab && 'hidden sm:flex',
                        )}
                    >
                        {/* Column Header */}
                        <div className='border-card-border mb-2.5 flex items-center justify-between border-b px-1 pb-2'>
                            <div className='flex min-w-0 items-center gap-1.5'>
                                <span
                                    className={cn(
                                        'size-4 shrink-0',
                                        cfg.accentText,
                                    )}
                                >
                                    <cfg.Icon className='size-4' />
                                </span>
                                <h4 className='text-text-primary truncate text-xs font-bold sm:text-sm'>
                                    {t(
                                        cfg.titleKey as import('@/i18n/dictionaries/uz').TranslationKey,
                                    )}
                                </h4>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                {totalLeadsCount > 0 && (
                                    <span className='text-text-tertiary text-[11px] font-medium tabular-nums'>
                                        {percentage}%
                                    </span>
                                )}
                                <span className='border-card-border bg-card-surface-area text-text-secondary shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-bold tabular-nums shadow-2xs'>
                                    {columnCount}
                                </span>
                                {canCreate &&
                                    status !== 'won' &&
                                    onOpenFullForm && (
                                        <button
                                            type='button'
                                            onClick={() =>
                                                onOpenFullForm(status)
                                            }
                                            title={t('leads.new')}
                                            className='text-text-tertiary hover:text-brand-accent hover:bg-card-surface-area rounded-md p-1 transition-colors'
                                        >
                                            <Plus className='size-3.5' />
                                        </button>
                                    )}
                            </div>
                        </div>

                        {/* Column Droppable Area */}
                        {isMounted ? (
                            <Droppable droppableId={status}>
                                {(droppableProvided, droppableSnapshot) => (
                                    <div
                                        ref={droppableProvided.innerRef}
                                        {...droppableProvided.droppableProps}
                                        className={cn(
                                            'flex min-h-[300px] flex-1 flex-col space-y-2 pr-0.5 transition-colors duration-150 sm:max-h-[calc(100vh-250px)] sm:min-h-[420px] sm:scrollbar-thin sm:overflow-y-auto',
                                            droppableSnapshot.isDraggingOver &&
                                                'bg-brand-accent/5 ring-brand-accent/20 rounded-xl ring-2',
                                        )}
                                    >
                                        {column.isPending ? (
                                            <div className='bg-background-gray-secondary/80 h-28 animate-pulse rounded-xl' />
                                        ) : columnLeads.length === 0 ? (
                                            <div className='text-text-tertiary border-card-border/70 flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs font-medium transition-all duration-200'>
                                                <span>
                                                    {t('leads.columnEmpty')}
                                                </span>
                                                {canCreate &&
                                                    status !== 'won' &&
                                                    onOpenFullForm && (
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                onOpenFullForm(
                                                                    status,
                                                                )
                                                            }
                                                            className='text-brand-accent inline-flex items-center gap-1 text-[11px] font-semibold hover:underline'
                                                        >
                                                            <Plus className='size-3 shrink-0' />
                                                            <span>
                                                                {t('leads.new')}
                                                            </span>
                                                        </button>
                                                    )}
                                            </div>
                                        ) : (
                                            columnLeads.map((lead, index) => {
                                                const effectiveStatus =
                                                    optimisticStatusMap[
                                                        lead.id
                                                    ] ?? lead.status;
                                                const isDragDisabled =
                                                    !canUpdate ||
                                                    effectiveStatus === 'won';

                                                const callDateStr =
                                                    lead.next_call_date?.slice(
                                                        0,
                                                        10,
                                                    );
                                                const isOverdue =
                                                    callDateStr &&
                                                    callDateStr < todayStr &&
                                                    effectiveStatus !== 'won';
                                                const isToday =
                                                    callDateStr &&
                                                    callDateStr === todayStr &&
                                                    effectiveStatus !== 'won';

                                                const overdueDays =
                                                    isOverdue && callDateStr
                                                        ? Math.max(
                                                              1,
                                                              Math.round(
                                                                  (new Date(
                                                                      todayStr,
                                                                  ).getTime() -
                                                                      new Date(
                                                                          callDateStr,
                                                                      ).getTime()) /
                                                                      (1000 *
                                                                          60 *
                                                                          60 *
                                                                          24),
                                                              ),
                                                          )
                                                        : 0;

                                                const cleanDigits =
                                                    lead.phone_number.replace(
                                                        /[^\d]/g,
                                                        '',
                                                    );

                                                return (
                                                    <Draggable
                                                        key={lead.id}
                                                        draggableId={lead.id}
                                                        index={index}
                                                        isDragDisabled={
                                                            isDragDisabled
                                                        }
                                                    >
                                                        {(
                                                            draggableProvided,
                                                            draggableSnapshot,
                                                        ) => (
                                                            <div
                                                                ref={
                                                                    draggableProvided.innerRef
                                                                }
                                                                {...draggableProvided.draggableProps}
                                                                onClick={() =>
                                                                    onSelectLead?.(
                                                                        lead,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'group border-card-border bg-card-surface-area hover:border-brand-accent/50 relative flex cursor-pointer flex-col justify-between rounded-xl border shadow-2xs transition-all duration-150 select-none hover:shadow-sm',
                                                                    density ===
                                                                        'compact'
                                                                        ? 'gap-1.5 p-2.5'
                                                                        : 'gap-2 p-3',
                                                                    draggableSnapshot.isDragging &&
                                                                        'border-brand-accent bg-card-surface-area ring-brand-accent/30 z-50 scale-[1.02] shadow-xl ring-2',
                                                                    isOverdue &&
                                                                        'border-l-[3.5px] border-l-red-500 bg-red-500/5',
                                                                    isToday &&
                                                                        'border-l-[3.5px] border-l-amber-500 bg-amber-500/5',
                                                                )}
                                                            >
                                                                {/* 1-Qator: Gripper + Ism + (Izoh belgisi) + 3-nuqta */}
                                                                <div className='flex items-center justify-between gap-1'>
                                                                    <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                                                                        {!isDragDisabled && (
                                                                            <span
                                                                                {...draggableProvided.dragHandleProps}
                                                                                className='text-text-tertiary hover:text-text-primary shrink-0 cursor-grab p-0.5 text-xs opacity-40 transition-opacity select-none group-hover:opacity-100 active:cursor-grabbing'
                                                                                title="Ko'chirish uchun suring"
                                                                            >
                                                                                ⋮⋮
                                                                            </span>
                                                                        )}
                                                                        <h5
                                                                            className={cn(
                                                                                'text-text-primary hover:text-brand-accent truncate font-bold transition-colors',
                                                                                density ===
                                                                                    'compact'
                                                                                    ? 'text-xs'
                                                                                    : 'text-sm',
                                                                            )}
                                                                            title={`${lead.first_name} ${lead.last_name || ''}`}
                                                                        >
                                                                            {
                                                                                lead.first_name
                                                                            }{' '}
                                                                            {lead.last_name ||
                                                                                ''}
                                                                        </h5>
                                                                        {lead.note &&
                                                                            density ===
                                                                                'compact' && (
                                                                                <span
                                                                                    className='text-text-tertiary hover:text-brand-accent inline-flex shrink-0 cursor-help'
                                                                                    title={
                                                                                        lead.note
                                                                                    }
                                                                                >
                                                                                    <Message1 className='size-3' />
                                                                                </span>
                                                                            )}
                                                                    </div>

                                                                    <div
                                                                        className='flex shrink-0 items-center gap-0.5'
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <RowActionsMenu
                                                                            label={`${lead.first_name} ${lead.last_name || ''}`}
                                                                            triggerClassName='size-6.5 rounded-md border-0 bg-transparent text-text-tertiary hover:bg-background-gray-secondary hover:text-text-primary'
                                                                            actions={[
                                                                                ...(onSelectLead
                                                                                    ? [
                                                                                          {
                                                                                              label: t(
                                                                                                  'common.details',
                                                                                              ),
                                                                                              icon: (
                                                                                                  <Eye className='size-3.5' />
                                                                                              ),
                                                                                              onAction:
                                                                                                  () =>
                                                                                                      onSelectLead(
                                                                                                          lead,
                                                                                                      ),
                                                                                          },
                                                                                      ]
                                                                                    : []),
                                                                                ...(canUpdate
                                                                                    ? [
                                                                                          {
                                                                                              label: t(
                                                                                                  'common.edit',
                                                                                              ),
                                                                                              icon: (
                                                                                                  <Pencil1 className='size-3.5' />
                                                                                              ),
                                                                                              onAction:
                                                                                                  () =>
                                                                                                      onEdit(
                                                                                                          lead,
                                                                                                      ),
                                                                                          },
                                                                                      ]
                                                                                    : []),
                                                                                ...(canConvert &&
                                                                                effectiveStatus !==
                                                                                    'won'
                                                                                    ? [
                                                                                          {
                                                                                              label: t(
                                                                                                  'leads.convert',
                                                                                              ),
                                                                                              icon: (
                                                                                                  <User2 className='size-3.5' />
                                                                                              ),
                                                                                              onAction:
                                                                                                  () =>
                                                                                                      onConvert(
                                                                                                          lead,
                                                                                                      ),
                                                                                          },
                                                                                      ]
                                                                                    : []),
                                                                                ...(canDelete &&
                                                                                onDelete
                                                                                    ? [
                                                                                          {
                                                                                              label: t(
                                                                                                  'common.delete',
                                                                                              ),
                                                                                              icon: (
                                                                                                  <Trash1 className='size-3.5' />
                                                                                              ),
                                                                                              danger: true,
                                                                                              onAction:
                                                                                                  () =>
                                                                                                      onDelete(
                                                                                                          lead,
                                                                                                      ),
                                                                                          },
                                                                                      ]
                                                                                    : []),
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* 2-Qator: Aloqa (Telefon + Telegram) + Kurs */}
                                                                <div className='flex items-center justify-between gap-1 text-[11px]'>
                                                                    <div
                                                                        className='flex min-w-0 items-center gap-1.5'
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <a
                                                                            href={`tel:${lead.phone_number.replace(/\s+/g, '')}`}
                                                                            title={t(
                                                                                'leads.callLead',
                                                                            )}
                                                                            className='text-text-secondary hover:text-brand-accent inline-flex items-center gap-1 font-semibold tabular-nums transition-colors'
                                                                        >
                                                                            <Telephone1 className='size-2.5 shrink-0 opacity-70' />
                                                                            <span className='truncate'>
                                                                                {
                                                                                    lead.phone_number
                                                                                }
                                                                            </span>
                                                                        </a>
                                                                        {cleanDigits.length >=
                                                                            9 && (
                                                                            <a
                                                                                href={`https://t.me/+${cleanDigits}`}
                                                                                target='_blank'
                                                                                rel='noreferrer'
                                                                                title={t(
                                                                                    'leads.writeTelegram',
                                                                                )}
                                                                                className='rounded p-0.5 text-sky-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40'
                                                                            >
                                                                                <Send1 className='size-3' />
                                                                            </a>
                                                                        )}
                                                                    </div>

                                                                    {lead.course && (
                                                                        <span
                                                                            className='bg-background-gray-secondary/90 text-text-secondary max-w-[110px] truncate rounded px-1.5 py-0.5 text-[10px] font-medium'
                                                                            title={
                                                                                lead
                                                                                    .course
                                                                                    .name
                                                                            }
                                                                        >
                                                                            {
                                                                                lead
                                                                                    .course
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Standart ko'rinishda: Izoh qisqartmasi (1 qator) */}
                                                                {density ===
                                                                    'comfortable' &&
                                                                    lead.note && (
                                                                        <p
                                                                            className='text-text-tertiary bg-background-gray-secondary/60 line-clamp-1 rounded px-1.5 py-0.5 text-[11px] italic'
                                                                            title={
                                                                                lead.note
                                                                            }
                                                                        >
                                                                            &ldquo;
                                                                            {
                                                                                lead.note
                                                                            }
                                                                            &rdquo;
                                                                        </p>
                                                                    )}

                                                                {/* 3-Qator (Footer): Manba + Keyingi qo'ng'iroq + Tezkor o'tkazish */}
                                                                <div
                                                                    className='flex items-center justify-between gap-1.5 pt-0.5'
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <div className='flex min-w-0 flex-wrap items-center gap-1'>
                                                                        <LeadSourceBadge
                                                                            source={
                                                                                lead.source
                                                                            }
                                                                        />

                                                                        {lead.next_call_date &&
                                                                            effectiveStatus !==
                                                                                'won' && (
                                                                                <span
                                                                                    className={cn(
                                                                                        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors',
                                                                                        isOverdue
                                                                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                                                            : isToday
                                                                                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                                              : 'bg-background-gray-secondary text-text-tertiary',
                                                                                    )}
                                                                                    title={formatDate(
                                                                                        lead.next_call_date,
                                                                                    )}
                                                                                >
                                                                                    {isOverdue ? (
                                                                                        <span className='inline-flex items-center gap-0.5'>
                                                                                            <ErrorCircle1 className='size-2.5 shrink-0' />
                                                                                            <span>
                                                                                                {
                                                                                                    overdueDays
                                                                                                }{' '}
                                                                                                k
                                                                                            </span>
                                                                                        </span>
                                                                                    ) : isToday ? (
                                                                                        <span className='inline-flex items-center gap-0.5'>
                                                                                            <ClockThree className='size-2.5 shrink-0' />
                                                                                            <span>
                                                                                                Bugun
                                                                                            </span>
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className='inline-flex items-center gap-0.5'>
                                                                                            <CalendarTime className='size-2.5 shrink-0' />
                                                                                            <span>
                                                                                                {formatDate(
                                                                                                    lead.next_call_date,
                                                                                                ).slice(
                                                                                                    0,
                                                                                                    6,
                                                                                                )}
                                                                                            </span>
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                    </div>

                                                                    {/* 1-Bosishda oldinga siljitish tugmasi */}
                                                                    {canUpdate &&
                                                                        effectiveStatus ===
                                                                            'new' && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    advanceLeadStatus(
                                                                                        lead,
                                                                                        'contacted',
                                                                                    )
                                                                                }
                                                                                title={t(
                                                                                    'leadStatus.contacted',
                                                                                )}
                                                                                className='text-text-secondary hover:text-brand-accent bg-background-gray-secondary hover:bg-brand-accent/10 flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-all'
                                                                            >
                                                                                <ArrowRight className='size-2.5 shrink-0' />
                                                                                <span>
                                                                                    {t(
                                                                                        'leadStatus.contacted',
                                                                                    )}
                                                                                </span>
                                                                            </button>
                                                                        )}

                                                                    {canUpdate &&
                                                                        effectiveStatus ===
                                                                            'contacted' && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    advanceLeadStatus(
                                                                                        lead,
                                                                                        'trial',
                                                                                    )
                                                                                }
                                                                                title={t(
                                                                                    'leadStatus.trial',
                                                                                )}
                                                                                className='flex shrink-0 items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 transition-all hover:bg-indigo-500/20 dark:text-indigo-300'
                                                                            >
                                                                                <ArrowRight className='size-2.5 shrink-0' />
                                                                                <span>
                                                                                    {t(
                                                                                        'leadStatus.trial',
                                                                                    )}
                                                                                </span>
                                                                            </button>
                                                                        )}

                                                                    {canConvert &&
                                                                        effectiveStatus ===
                                                                            'trial' && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    onConvert(
                                                                                        lead,
                                                                                    )
                                                                                }
                                                                                title={t(
                                                                                    'leads.convert',
                                                                                )}
                                                                                className='flex shrink-0 items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-2xs transition-all hover:bg-emerald-700'
                                                                            >
                                                                                <User2 className='size-2.5 shrink-0' />
                                                                                <span>
                                                                                    {t(
                                                                                        'leads.convert',
                                                                                    )}
                                                                                </span>
                                                                            </button>
                                                                        )}

                                                                    {canUpdate &&
                                                                        effectiveStatus ===
                                                                            'lost' && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    advanceLeadStatus(
                                                                                        lead,
                                                                                        'new',
                                                                                    )
                                                                                }
                                                                                title={t(
                                                                                    'leads.reopen',
                                                                                )}
                                                                                className='flex shrink-0 items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700 transition-all hover:bg-rose-500/20 dark:text-rose-300'
                                                                            >
                                                                                <Reload className='size-2.5 shrink-0' />
                                                                                <span>
                                                                                    {t(
                                                                                        'leads.reopen',
                                                                                    )}
                                                                                </span>
                                                                            </button>
                                                                        )}

                                                                    {effectiveStatus ===
                                                                        'won' && (
                                                                        <div className='flex shrink-0 items-center gap-1 text-[10px]'>
                                                                            {lead.student ? (
                                                                                <Link
                                                                                    href={`/students/${lead.student.id}`}
                                                                                    className='text-brand-accent inline-flex items-center gap-0.5 font-semibold hover:underline'
                                                                                >
                                                                                    <span>
                                                                                        {t(
                                                                                            'leads.openStudent',
                                                                                        )}
                                                                                    </span>
                                                                                    <ArrowRight className='size-2.5 shrink-0' />
                                                                                </Link>
                                                                            ) : (
                                                                                <Check className='size-3 shrink-0 text-emerald-600' />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })
                                        )}
                                        {droppableProvided.placeholder}

                                        {column.hasMore && (
                                            <button
                                                type='button'
                                                disabled={column.loadingMore}
                                                onClick={column.loadMore}
                                                className='text-text-secondary hover:text-text-primary hover:bg-card-surface-area border-card-border flex w-full justify-center rounded-xl border p-1.5 text-xs font-medium transition-colors disabled:opacity-50'
                                            >
                                                {t('leads.loadMore', {
                                                    shown: columnLeads.length,
                                                    total: column.count,
                                                })}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        ) : (
                            <div className='min-h-[420px] flex-1' />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className='flex flex-col gap-3'>
            {/* Mobile Column Tabs (< sm) — Sticky top navigation with smooth scroll & clear active indicators */}
            <div className='border-card-border/70 bg-card-surface-area/95 sticky top-0 z-20 -mx-4 -mt-1 flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b px-4 py-2 backdrop-blur-md sm:hidden'>
                {statuses.map((status) => {
                    const count = columns[status].count;
                    const isActive = activeTab === status;
                    const cfg = STATUS_CONFIG[status];

                    return (
                        <button
                            key={status}
                            type='button'
                            onClick={(e) => {
                                setActiveTab(status);
                                e.currentTarget.scrollIntoView({
                                    behavior: 'smooth',
                                    inline: 'center',
                                    block: 'nearest',
                                });
                            }}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95',
                                isActive
                                    ? 'border-brand-accent bg-brand-accent text-white shadow-xs'
                                    : 'border-card-border bg-background-gray-secondary/60 text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary',
                            )}
                        >
                            <cfg.Icon className='size-3.5 shrink-0' />
                            <span className='whitespace-nowrap'>
                                {t(
                                    cfg.titleKey as import('@/i18n/dictionaries/uz').TranslationKey,
                                )}
                            </span>
                            <span
                                className={cn(
                                    'rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-card-surface-area text-text-tertiary border-card-border/60 border',
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Desktop & Tablet Comfortable Horizontal Canvas */}
            {isMounted ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    {renderBoardContent()}
                </DragDropContext>
            ) : (
                renderBoardContent()
            )}
        </div>
    );
}
