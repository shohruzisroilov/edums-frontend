'use client';

import { Button } from '@/components/tailgrids/core/button';
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
import { Calendar, Pencil1 } from '@tailgrids/icons';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useState, type DragEvent } from 'react';

/** Ustunga bir martada yuklanadigan lidlar soni. */
const COLUMN_PAGE = 30;

interface KanbanFilters {
    search?: string;
    source?: LeadSource;
}

/**
 * Bitta ustun — o'z holatidagi lidlar, sahifalab. Har ustun alohida
 * so'raladi: aks holda bir ro'yxatning birinchi N tasi qaysidir ustunni
 * to'ldirib, boshqalarini bo'sh qoldirardi, sanoqlar ham noto'g'ri chiqardi.
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

    const shown = (status: LeadStatus) => !onlyStatus || onlyStatus === status;
    // Hook'lar doim bir xil tartibda chaqirilishi uchun — har biri alohida.
    const columns: Record<LeadStatus, ReturnType<typeof useLeadColumn>> = {
        new: useLeadColumn('new', filters, shown('new')),
        contacted: useLeadColumn('contacted', filters, shown('contacted')),
        trial: useLeadColumn('trial', filters, shown('trial')),
        won: useLeadColumn('won', filters, shown('won')),
        lost: useLeadColumn('lost', filters, shown('lost')),
    };
    const statuses = LEAD_STATUSES.filter(shown);
    const leads = statuses.flatMap((status) => columns[status].leads);

    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(
        null,
    );
    const [tab, setActiveTab] = useState<LeadStatus>('new');
    const activeTab = onlyStatus ?? tab;

    function handleDragStart(e: DragEvent<HTMLDivElement>, leadId: string) {
        e.dataTransfer.setData('text/plain', leadId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedLeadId(leadId);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>, status: LeadStatus) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumn !== status) {
            setDragOverColumn(status);
        }
    }

    function handleDragLeave(e: DragEvent<HTMLDivElement>) {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverColumn(null);
        }
    }

    /**
     * Shu ustunga tashlash mumkinmi. "O'quvchi bo'ldi" ustuniga tashlash —
     * o'quvchiga aylantirish oynasini ochadi, holatni to'g'ridan-to'g'ri
     * o'zgartirmaydi: bu holat faqat aylantirish bilan qo'yiladi.
     */
    function canDropOn(status: LeadStatus) {
        return status === 'won' ? canConvert : canUpdate;
    }

    function handleDrop(
        e: DragEvent<HTMLDivElement>,
        targetStatus: LeadStatus,
    ) {
        e.preventDefault();
        setDragOverColumn(null);
        setDraggedLeadId(null);

        const lead = leads.find(
            (item) => item.id === e.dataTransfer.getData('text/plain'),
        );
        if (!lead || lead.status === targetStatus || lead.status === 'won') {
            return;
        }

        if (targetStatus === 'won') onConvert(lead);
        else onStatusChange(lead.id, targetStatus);
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
                    'flex min-w-full snap-x scrollbar-thin gap-4 overflow-x-auto pt-1 pb-6',
                    !onlyStatus && '2xl:grid 2xl:grid-cols-5',
                )}
            >
                {statuses.map((status) => {
                    const column = columns[status];
                    const columnLeads = column.leads;
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
                                'border-card-border bg-background-gray-secondary/40 flex min-h-[450px] w-full shrink-0 snap-start flex-col rounded-2xl border p-3.5 transition-all duration-150 sm:w-[320px] 2xl:w-auto 2xl:min-w-0 2xl:shrink',
                                status !== activeTab && 'hidden sm:flex',
                                isOver &&
                                    'border-brand-accent bg-brand-accent/10 ring-brand-accent/20 scale-[1.01] ring-2',
                            )}
                        >
                            {/* Column Header */}
                            <div className='border-card-border mb-3 flex items-center justify-between border-b px-1 pb-2.5'>
                                <div className='flex items-center gap-2'>
                                    <LeadStatusDot status={status} />
                                    <h4 className='text-text-primary text-sm font-semibold'>
                                        {t(
                                            `leadStatus.${status}` as import('@/i18n/dictionaries/uz').TranslationKey,
                                        )}
                                    </h4>
                                </div>
                                <span className='border-card-border bg-card-surface-area text-text-secondary rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums'>
                                    {column.count}
                                </span>
                            </div>

                            {/* Column Items */}
                            <div className='min-h-[150px] flex-1 space-y-3 overflow-y-auto'>
                                {column.isPending ? (
                                    <div className='bg-background-gray-secondary h-28 animate-pulse rounded-xl' />
                                ) : columnLeads.length === 0 ? (
                                    <div
                                        className={cn(
                                            'text-text-tertiary border-card-border flex h-28 items-center justify-center rounded-xl border border-dashed text-xs transition-colors',
                                            isOver &&
                                                'border-brand-accent text-brand-accent bg-brand-accent/5 font-medium',
                                        )}
                                    >
                                        {isOver
                                            ? t('leads.dropHere')
                                            : t('leads.columnEmpty')}
                                    </div>
                                ) : (
                                    columnLeads.map((lead) => {
                                        const isDraggingThis =
                                            draggedLeadId === lead.id;
                                        // Aylantirilgan lid joyidan siljimaydi.
                                        const draggable =
                                            canUpdate && lead.status !== 'won';
                                        return (
                                            <div
                                                key={lead.id}
                                                draggable={draggable}
                                                onDragStart={(e) =>
                                                    handleDragStart(e, lead.id)
                                                }
                                                onDragEnd={() =>
                                                    setDraggedLeadId(null)
                                                }
                                                className={cn(
                                                    'border-card-border bg-card-surface-area hover:border-brand-accent/50 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all',
                                                    draggable &&
                                                        'cursor-grab active:cursor-grabbing',
                                                    isDraggingThis &&
                                                        'border-brand-accent scale-95 border-dashed opacity-40 shadow-md',
                                                )}
                                            >
                                                <div>
                                                    <div className='flex items-start justify-between gap-2'>
                                                        <h5
                                                            className='text-text-primary flex min-w-0 items-center gap-1.5 text-sm font-semibold'
                                                            title={`${lead.first_name} ${lead.last_name || ''}`}
                                                        >
                                                            {draggable && (
                                                                <span className='text-text-tertiary shrink-0 cursor-grab text-xs opacity-60 select-none hover:opacity-100'>
                                                                    ⋮⋮
                                                                </span>
                                                            )}
                                                            <span className='truncate'>
                                                                {
                                                                    lead.first_name
                                                                }{' '}
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
                                                                title={t(
                                                                    'common.edit',
                                                                )}
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
                                                                className='bg-background-gray-secondary text-text-secondary max-w-[160px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium'
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
                                                            <span>
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
                                                <div className='border-card-border mt-3.5 flex items-center justify-between gap-1.5 border-t pt-2.5'>
                                                    {status !== 'won' &&
                                                        canConvert && (
                                                            <Button
                                                                size='sm'
                                                                variant='primary'
                                                                appearance='outline'
                                                                className='h-7.5 shrink-0 px-2.5 text-xs font-medium whitespace-nowrap'
                                                                onPress={() =>
                                                                    onConvert(
                                                                        lead,
                                                                    )
                                                                }
                                                            >
                                                                {t(
                                                                    'leads.convert',
                                                                )}
                                                            </Button>
                                                        )}

                                                    {canUpdate &&
                                                        status !== 'won' && (
                                                            <div className='w-32 max-w-full'>
                                                                <SelectInput
                                                                    className='h-7.5 text-xs'
                                                                    options={EDITABLE_LEAD_STATUSES.map(
                                                                        (
                                                                            s,
                                                                        ) => ({
                                                                            value: s,
                                                                            label: t(
                                                                                `leadStatus.${s}`,
                                                                            ),
                                                                        }),
                                                                    )}
                                                                    value={
                                                                        lead.status
                                                                    }
                                                                    onValueChange={(
                                                                        next,
                                                                    ) =>
                                                                        next !==
                                                                            lead.status &&
                                                                        onStatusChange(
                                                                            lead.id,
                                                                            next as EditableLeadStatus,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                    {status === 'won' && (
                                                        <LeadStatusBadge status='won' />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {column.hasMore && (
                                    <Button
                                        appearance='ghost'
                                        size='sm'
                                        className='w-full justify-center'
                                        isDisabled={column.loadingMore}
                                        onPress={column.loadMore}
                                    >
                                        {t('leads.loadMore', {
                                            shown: columnLeads.length,
                                            total: column.count,
                                        })}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
