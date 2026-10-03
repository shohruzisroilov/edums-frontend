'use client';

import { SelectInput } from '@/components/ui/form-field';
import { PhoneLink } from '@/components/ui/phone-link';
import {
    LeadSourceBadge,
    LeadStatusBadge,
    LeadStatusDot,
} from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { listLeads } from '@/services/api/leads';
import type {
    EditableLeadStatus,
    Lead,
    LeadSource,
    LeadStatus,
} from '@/types/api';
import { EDITABLE_LEAD_STATUSES, LEAD_STATUSES } from '@/types/api';
import { cn } from '@/utils/cn';
import { Calendar, Pencil1, User2 } from '@tailgrids/icons';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRef, useState, type DragEvent } from 'react';

/** Ustunga bir martada yuklanadigan lidlar soni. */
const COLUMN_PAGE = 30;

interface KanbanFilters {
    search?: string;
    source?: LeadSource;
}

/**
 * Bitta ustun — o'z holatidagi lidlar, sahifalab. Har ustun alohida
 * so'raladi.
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
    onlyStatus,
    onStatusChange,
    onEdit,
    onConvert,
    canUpdate,
    canConvert,
}: {
    filters: KanbanFilters;
    /** Holat filtri tanlangan bo'lsa — faqat shu ustun. */
    onlyStatus?: LeadStatus;
    /** "O'quvchi bo'ldi" bu yerga kelmaydi — u faqat onConvert orqali. */
    onStatusChange: (leadId: string, status: EditableLeadStatus) => void;
    onEdit: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    canUpdate: boolean;
    canConvert: boolean;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const queryClient = useQueryClient();

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

    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(
        null,
    );
    const dragOverColumnRef = useRef<LeadStatus | null>(null);

    const [tab, setActiveTab] = useState<LeadStatus>('new');
    const activeTab = onlyStatus ?? tab;

    // Instant optimistic status map (0ms lag on drag & drop)
    const [optimisticStatusMap, setOptimisticStatusMap] = useState<
        Record<string, LeadStatus>
    >({});

    function handleDragStart(e: DragEvent<HTMLDivElement>, leadId: string) {
        e.dataTransfer.setData('text/plain', leadId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedLeadId(leadId);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>, status: LeadStatus) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumnRef.current !== status) {
            dragOverColumnRef.current = status;
            setDragOverColumn(status);
        }
    }

    function handleDragLeave(e: DragEvent<HTMLDivElement>) {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            dragOverColumnRef.current = null;
            setDragOverColumn(null);
        }
    }

    function canDropOn(status: LeadStatus) {
        return status === 'won' ? canConvert : canUpdate;
    }

    function handleDrop(
        e: DragEvent<HTMLDivElement>,
        targetStatus: LeadStatus,
    ) {
        e.preventDefault();
        dragOverColumnRef.current = null;
        setDragOverColumn(null);

        const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
        setDraggedLeadId(null);
        if (!leadId) return;

        const lead = allQueryLeads.find((item) => item.id === leadId);
        if (!lead) return;

        const currentStatus = optimisticStatusMap[lead.id] ?? lead.status;
        if (currentStatus === targetStatus || currentStatus === 'won') return;

        if (targetStatus === 'won') {
            onConvert(lead);
        } else {
            // Instant optimistic update & cancel in-flight refetches
            void queryClient.cancelQueries({ queryKey: ['leads'] });
            setOptimisticStatusMap((prev) => ({
                ...prev,
                [lead.id]: targetStatus,
            }));
            onStatusChange(lead.id, targetStatus as EditableLeadStatus);
        }
    }

    function getColumnLeads(status: LeadStatus): { leads: Lead[]; count: number } {
        const queryCol = columns[status];
        const rawLeads = queryCol.leads;

        const remaining = rawLeads.filter((l) => {
            const opt = optimisticStatusMap[l.id];
            return !opt || opt === status;
        });

        const movedIn = allQueryLeads.filter(
            (l) =>
                optimisticStatusMap[l.id] === status &&
                !rawLeads.some((r) => r.id === l.id),
        );

        const combined = [...remaining, ...movedIn];
        const delta = combined.length - rawLeads.length;
        const count = Math.max(0, queryCol.count + delta);

        return { leads: combined, count };
    }

    return (
        <div className='flex flex-col gap-3'>
            {/* Mobile Column Tabs (< sm) */}
            <div className='flex scrollbar-thin gap-1.5 overflow-x-auto pb-1 sm:hidden'>
                {statuses.map((status) => {
                    const count = columns[status].count;
                    const isActive = activeTab === status;

                    return (
                        <button
                            key={status}
                            type='button'
                            onClick={() => setActiveTab(status)}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                                isActive
                                    ? 'border-brand-accent bg-brand-accent text-white shadow-xs'
                                    : 'border-card-border bg-card-surface-area text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <LeadStatusDot status={status} />
                            <span>
                                {t(
                                    `leadStatus.${status}` as import('@/i18n/dictionaries/uz').TranslationKey,
                                )}
                            </span>
                            <span
                                className={cn(
                                    'rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-background-gray-secondary text-text-tertiary',
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div
                className={cn(
                    'flex min-w-full snap-x snap-mandatory scrollbar-thin gap-3.5 overflow-x-auto pt-1 pb-6 transition-all duration-300',
                    !onlyStatus &&
                        'lg:grid lg:grid-cols-5 lg:gap-3.5 lg:overflow-x-visible 2xl:gap-4',
                )}
            >
                {statuses.map((status) => {
                    const column = columns[status];
                    const { leads: columnLeads, count: columnCount } =
                        getColumnLeads(status);
                    const isOver = dragOverColumn === status;

                    return (
                        <div
                            key={status}
                            onDragOver={(e) =>
                                canDropOn(status) && handleDragOver(e, status)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) =>
                                canDropOn(status) && handleDrop(e, status)
                            }
                            className={cn(
                                'border-card-border bg-background-gray-secondary/40 flex min-h-[480px] w-[280px] shrink-0 snap-start flex-col rounded-2xl border p-3 transition-all duration-150 ease-out sm:w-[300px] lg:w-full lg:min-w-0 lg:shrink',
                                status !== activeTab && 'hidden sm:flex',
                                isOver &&
                                    'border-brand-accent/80 bg-brand-accent/5 ring-brand-accent/20 scale-[1.008] shadow-md ring-4',
                            )}
                        >
                            {/* Column Header */}
                            <div className='border-card-border mb-3 flex items-center justify-between border-b px-1 pb-2.5'>
                                <div className='flex min-w-0 items-center gap-2'>
                                    <LeadStatusDot status={status} />
                                    <h4 className='text-text-primary truncate text-sm font-semibold'>
                                        {t(
                                            `leadStatus.${status}` as import('@/i18n/dictionaries/uz').TranslationKey,
                                        )}
                                    </h4>
                                </div>
                                <span className='border-card-border bg-card-surface-area text-text-secondary shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums shadow-2xs'>
                                    {columnCount}
                                </span>
                            </div>

                            {/* Column Items */}
                            <div className='min-h-[150px] flex-1 scrollbar-thin space-y-2.5 overflow-y-auto pr-0.5'>
                                {isOver && draggedLeadId && (
                                    <div className='border-brand-accent/60 bg-brand-accent/10 text-brand-accent flex h-16 animate-pulse items-center justify-center rounded-xl border-2 border-dashed text-xs font-semibold shadow-inner'>
                                        ↓ {t('leads.dropHere')}
                                    </div>
                                )}

                                {column.isPending ? (
                                    <div className='bg-background-gray-secondary/80 h-28 animate-pulse rounded-xl' />
                                ) : columnLeads.length === 0 && !isOver ? (
                                    <div className='text-text-tertiary border-card-border flex h-28 items-center justify-center rounded-xl border border-dashed text-xs transition-all duration-200'>
                                        {t('leads.columnEmpty')}
                                    </div>
                                ) : (
                                    columnLeads.map((lead) => {
                                        const effectiveStatus =
                                            optimisticStatusMap[lead.id] ??
                                            lead.status;
                                        const isDraggingThis =
                                            draggedLeadId === lead.id;
                                        const draggable =
                                            canUpdate &&
                                            effectiveStatus !== 'won';

                                        return (
                                            <div
                                                key={lead.id}
                                                draggable={draggable}
                                                onDragStart={(e) =>
                                                    handleDragStart(e, lead.id)
                                                }
                                                onDragEnd={() => {
                                                    setDraggedLeadId(null);
                                                    setDragOverColumn(null);
                                                    dragOverColumnRef.current =
                                                        null;
                                                }}
                                                className={cn(
                                                    'border-card-border bg-card-surface-area hover:border-brand-accent/40 flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all duration-200 hover:shadow-sm',
                                                    draggable &&
                                                        'cursor-grab active:cursor-grabbing hover:-translate-y-0.5',
                                                    isDraggingThis &&
                                                        'border-brand-accent bg-brand-accent/5 scale-[0.98] border-dashed opacity-40 shadow-xl',
                                                )}
                                            >
                                                <div>
                                                    <div className='flex items-start justify-between gap-1.5'>
                                                        <h5
                                                            className='text-text-primary flex min-w-0 items-center gap-1.5 text-xs font-bold sm:text-sm'
                                                            title={`${lead.first_name} ${lead.last_name || ''}`}
                                                        >
                                                            {draggable && (
                                                                <span className='text-text-tertiary shrink-0 cursor-grab text-xs opacity-50 select-none hover:opacity-100'>
                                                                    ⋮⋮
                                                                </span>
                                                            )}
                                                            <span className='truncate'>
                                                                {lead.first_name}{' '}
                                                                {lead.last_name ||
                                                                    ''}
                                                            </span>
                                                        </h5>
                                                        {canUpdate && (
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    onEdit(lead)
                                                                }
                                                                className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary shrink-0 rounded-md p-1 transition-colors'
                                                                aria-label={t(
                                                                    'common.edit',
                                                                )}
                                                            >
                                                                <Pencil1 className='size-3.5' />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className='mt-1 text-xs'>
                                                        <PhoneLink
                                                            phone={
                                                                lead.phone_number
                                                            }
                                                        />
                                                    </div>

                                                    <div className='mt-2.5 flex flex-wrap items-center gap-1.5'>
                                                        <LeadSourceBadge
                                                            source={lead.source}
                                                        />
                                                        {lead.course && (
                                                            <span
                                                                className='bg-background-gray-secondary text-text-secondary max-w-[140px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium'
                                                                title={
                                                                    lead.course
                                                                        .name
                                                                }
                                                            >
                                                                {
                                                                    lead.course
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {lead.next_call_date && (
                                                        <div className='text-brand-accent mt-2 flex items-center gap-1 text-[11px] font-medium'>
                                                            <Calendar className='size-3 shrink-0' />
                                                            <span className='truncate'>
                                                                {t(
                                                                    'leads.nextCall',
                                                                    {
                                                                        date: formatDate(
                                                                            lead.next_call_date,
                                                                        ),
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Switcher & Convert */}
                                                <div className='border-card-border mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5'>
                                                    {canUpdate &&
                                                        effectiveStatus !==
                                                            'won' && (
                                                            <div className='min-w-[120px] flex-1'>
                                                                <SelectInput
                                                                    className='h-7 rounded-lg text-[11px] font-medium'
                                                                    options={EDITABLE_LEAD_STATUSES.map(
                                                                        (
                                                                            s,
                                                                        ) => ({
                                                                            value: s,
                                                                            label: t(
                                                                                `leadStatus.${s}` as import('@/i18n/dictionaries/uz').TranslationKey,
                                                                            ),
                                                                        }),
                                                                    )}
                                                                    value={
                                                                        effectiveStatus
                                                                    }
                                                                    onValueChange={(
                                                                        next,
                                                                    ) => {
                                                                        if (
                                                                            next !==
                                                                            effectiveStatus
                                                                        ) {
                                                                            setOptimisticStatusMap(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [lead.id]:
                                                                                        next as LeadStatus,
                                                                                }),
                                                                            );
                                                                            onStatusChange(
                                                                                lead.id,
                                                                                next as EditableLeadStatus,
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                    {effectiveStatus !==
                                                        'won' &&
                                                        canConvert && (
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    onConvert(
                                                                        lead,
                                                                    )
                                                                }
                                                                className='border-brand-accent/40 bg-brand-accent/5 text-brand-accent hover:bg-brand-accent inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-all hover:text-white hover:shadow-xs'
                                                            >
                                                                <User2 className='size-3.5' />
                                                                <span>
                                                                    + O&apos;quvchi
                                                                </span>
                                                            </button>
                                                        )}

                                                    {effectiveStatus ===
                                                        'won' && (
                                                        <div className='flex w-full items-center justify-between py-0.5'>
                                                            <LeadStatusBadge status='won' />
                                                            {lead.student && (
                                                                <Link
                                                                    href={`/students/${lead.student.id}`}
                                                                    className='text-brand-accent text-xs font-semibold hover:underline'
                                                                >
                                                                    {t(
                                                                        'leads.openStudent',
                                                                    )}{' '}
                                                                    &rarr;
                                                                </Link>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {column.hasMore && (
                                    <button
                                        type='button'
                                        disabled={column.loadingMore}
                                        onClick={column.loadMore}
                                        className='text-text-secondary hover:text-text-primary hover:bg-card-surface-area border-card-border flex w-full justify-center rounded-xl border p-2 text-xs font-medium transition-colors disabled:opacity-50'
                                    >
                                        {t('leads.loadMore', {
                                            shown: columnLeads.length,
                                            total: column.count,
                                        })}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

