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
        <div className='flex min-w-full snap-x gap-4 overflow-x-auto pb-6 xl:grid xl:grid-cols-5'>
            {LEAD_STATUSES.map((status) => {
                const columnLeads = leads.filter((l) => l.status === status);
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
                            'border-card-border bg-background-gray-secondary/40 flex min-h-[400px] w-[280px] shrink-0 snap-start flex-col rounded-2xl border p-3 transition-all duration-150 xl:w-auto xl:shrink',
                            isOver &&
                                'border-brand-accent bg-brand-accent/10 ring-brand-accent/20 scale-[1.01] ring-2',
                        )}
                    >
                        {/* Column Header */}
                        <div className='border-card-border mb-3 flex items-center justify-between border-b px-1 pb-2'>
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
                                        'text-text-tertiary border-card-border flex h-24 items-center justify-center rounded-xl border border-dashed text-xs transition-colors',
                                        isOver &&
                                            'border-brand-accent text-brand-accent bg-brand-accent/5 font-medium',
                                    )}
                                >
                                    {isOver ? 'Shu yerga tashlang' : "Lid yo'q"}
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
                                                    <h5 className='text-text-primary flex items-center gap-1.5 text-sm font-semibold'>
                                                        {canUpdate && (
                                                            <span className='text-text-tertiary cursor-grab text-xs opacity-60 hover:opacity-100'>
                                                                ⋮⋮
                                                            </span>
                                                        )}
                                                        {lead.first_name}{' '}
                                                        {lead.last_name || ''}
                                                    </h5>
                                                    {canUpdate && (
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                onEdit(lead)
                                                            }
                                                            className='text-icon-tertiary hover:text-text-primary'
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
                                                        <span className='bg-background-gray-secondary text-text-secondary rounded-md px-1.5 py-0.5 text-[10px] font-medium'>
                                                            {lead.course.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {lead.next_call_date && (
                                                    <div className='text-brand-accent mt-2 flex items-center gap-1 text-[11px] font-medium'>
                                                        <Calendar className='size-3' />
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
                                            <div className='border-card-border mt-3.5 flex items-center justify-between gap-1 border-t pt-2.5'>
                                                {status !== 'won' &&
                                                    canConvert && (
                                                        <Button
                                                            size='sm'
                                                            variant='primary'
                                                            appearance='outline'
                                                            className='h-7 px-2 text-[10px]'
                                                            onPress={() =>
                                                                onConvert(lead)
                                                            }
                                                        >
                                                            O'quvchi qilish
                                                        </Button>
                                                    )}

                                                {canUpdate &&
                                                    status !== 'won' && (
                                                        <select
                                                            value={lead.status}
                                                            onChange={(e) =>
                                                                onStatusChange(
                                                                    lead.id,
                                                                    e.target
                                                                        .value as LeadStatus,
                                                                )
                                                            }
                                                            className='border-card-border bg-background-gray-secondary text-text-secondary rounded-lg border px-1.5 py-1 text-[10px] font-medium outline-none'
                                                        >
                                                            <option value='new'>
                                                                Yangi
                                                            </option>
                                                            <option value='contacting'>
                                                                Bog'lanildi
                                                            </option>
                                                            <option value='trial'>
                                                                Sinov darsi
                                                            </option>
                                                            <option value='won'>
                                                                Qabul qilindi
                                                            </option>
                                                            <option value='lost'>
                                                                Rad etildi
                                                            </option>
                                                        </select>
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
    );
}
