'use client';

import { Button } from '@/components/tailgrids/core/button';
import { PhoneLink } from '@/components/ui/phone-link';
import { LeadSourceBadge, LeadStatusDot } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { Lead, LeadStatus } from '@/types/api';
import { LEAD_STATUSES } from '@/types/api';
import { cn } from '@/utils/cn';
import { Calendar, Pencil1 } from '@tailgrids/icons';

import { useState, type DragEvent } from 'react';

export function LeadKanbanBoard({
    leads,
    onStatusChange,
    onEdit,
    onConvert,
    canUpdate,
    canConvert,
}: {
    leads: Lead[];
    onStatusChange: (leadId: string, status: LeadStatus) => void;
    onEdit: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    canUpdate: boolean;
    canConvert: boolean;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState<LeadStatus>('new');

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

    function handleDrop(
        e: DragEvent<HTMLDivElement>,
        targetStatus: LeadStatus,
    ) {
        e.preventDefault();
        setDragOverColumn(null);
        const leadId = e.dataTransfer.getData('text/plain');
        if (leadId) {
            onStatusChange(leadId, targetStatus);
        }
        setDraggedLeadId(null);
    }

    return (
        <div className='flex flex-col gap-3'>
            {/* Mobile Column Tabs (< sm) */}
            <div className='flex scrollbar-thin gap-1.5 overflow-x-auto pb-1 sm:hidden'>
                {LEAD_STATUSES.map((status) => {
                    const count = leads.filter(
                        (l) => l.status === status,
                    ).length;
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
                                    'py-0.2 rounded-md px-1.5 text-[10px] font-bold tabular-nums',
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

            <div className='flex min-w-full snap-x scrollbar-thin gap-4 overflow-x-auto pt-1 pb-6 2xl:grid 2xl:grid-cols-5'>
                {LEAD_STATUSES.map((status) => {
                    const columnLeads = leads.filter(
                        (l) => l.status === status,
                    );
                    const isOver = dragOverColumn === status;

                    return (
                        <div
                            key={status}
                            onDragOver={(e) =>
                                canUpdate && handleDragOver(e, status)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => canUpdate && handleDrop(e, status)}
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
                                    {columnLeads.length}
                                </span>
                            </div>

                            {/* Column Items */}
                            <div className='min-h-[150px] flex-1 space-y-3 overflow-y-auto'>
                                {columnLeads.length === 0 ? (
                                    <div
                                        className={cn(
                                            'text-text-tertiary border-card-border flex h-28 items-center justify-center rounded-xl border border-dashed text-xs transition-colors',
                                            isOver &&
                                                'border-brand-accent text-brand-accent bg-brand-accent/5 font-medium',
                                        )}
                                    >
                                        {isOver
                                            ? 'Shu yerga tashlang'
                                            : "Lid yo'q"}
                                    </div>
                                ) : (
                                    columnLeads.map((lead) => {
                                        const isDraggingThis =
                                            draggedLeadId === lead.id;
                                        return (
                                            <div
                                                key={lead.id}
                                                draggable={canUpdate}
                                                onDragStart={(e) =>
                                                    handleDragStart(e, lead.id)
                                                }
                                                onDragEnd={() =>
                                                    setDraggedLeadId(null)
                                                }
                                                className={cn(
                                                    'border-card-border bg-card-surface-area hover:border-brand-accent/50 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all',
                                                    canUpdate &&
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
                                                            {canUpdate && (
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
                                                                title='Tahrirlash'
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
                                                                Qo'ng'iroq:{' '}
                                                                {formatDate(
                                                                    lead.next_call_date,
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
                                                                O'quvchi qilish
                                                            </Button>
                                                        )}

                                                    {canUpdate &&
                                                        status !== 'won' && (
                                                            <select
                                                                value={
                                                                    lead.status
                                                                }
                                                                onChange={(e) =>
                                                                    onStatusChange(
                                                                        lead.id,
                                                                        e.target
                                                                            .value as LeadStatus,
                                                                    )
                                                                }
                                                                className='border-card-border bg-background-gray-secondary text-text-secondary hover:text-text-primary focus:border-brand-accent max-w-[130px] cursor-pointer truncate rounded-lg border px-2 py-1 text-xs font-medium transition outline-none'
                                                            >
                                                                {LEAD_STATUSES.map(
                                                                    (s) => (
                                                                        <option
                                                                            key={
                                                                                s
                                                                            }
                                                                            value={
                                                                                s
                                                                            }
                                                                        >
                                                                            {t(
                                                                                `leadStatus.${s}` as import('@/i18n/dictionaries/uz').TranslationKey,
                                                                            )}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        )}

                                                    {status === 'won' && (
                                                        <span className='text-success-600 bg-success-50 dark:bg-success-950/40 dark:text-success-400 rounded-md px-2 py-1 text-xs font-medium'>
                                                            {t(
                                                                'leadStatus.won',
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
