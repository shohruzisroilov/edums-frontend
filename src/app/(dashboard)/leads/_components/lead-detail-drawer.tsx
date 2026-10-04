'use client';

import { Button } from '@/components/tailgrids/core/button';
import { TextareaInput, TextInput } from '@/components/ui/form-field';
import { PhoneLink } from '@/components/ui/phone-link';
import { LeadSourceBadge, LeadStatusBadge, LeadStatusDot } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { updateLead } from '@/services/api/leads';
import type { EditableLeadStatus, Lead, LeadPayload } from '@/types/api';
import { EDITABLE_LEAD_STATUSES } from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { Calendar, Close, Pencil1, Trash1, User2 } from '@tailgrids/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LeadDetailDrawerProps {
    lead: Lead | null;
    onClose: () => void;
    onEdit: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
}

export function LeadDetailDrawer({
    lead,
    onClose,
    onEdit,
    onConvert,
    onDelete,
}: LeadDetailDrawerProps) {
    const t = useT();
    const { formatDate } = useFormat();
    const { session } = useSession();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const canUpdate = can(session, 'leads.update');
    const canDelete = can(session, 'leads.delete');
    const canConvert = canUpdate && can(session, 'students.create');
    const canOpenStudents = can(session, 'students.view');

    const [prevLead, setPrevLead] = useState(lead);
    const [note, setNote] = useState(lead?.note ?? '');
    const [nextCallDate, setNextCallDate] = useState(
        lead?.next_call_date ? lead.next_call_date.slice(0, 10) : '',
    );
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Adjust state when lead prop changes (React-recommended render-time pattern)
    if (lead !== prevLead) {
        setPrevLead(lead);
        setNote(lead?.note ?? '');
        setNextCallDate(lead?.next_call_date ? lead.next_call_date.slice(0, 10) : '');
    }

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const statusMutation = useMutation({
        mutationFn: (newStatus: EditableLeadStatus) =>
            updateLead(lead!.id, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            toast.success(t('leads.updated'));
        },
        onError: (error) => toastError(error),
    });

    if (!lead) return null;

    const isWon = lead.status === 'won';

    const updateLeadDetails = async (payload: Partial<LeadPayload>) => {
        setIsSavingNote(true);
        try {
            await updateLead(lead.id, payload);
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            await queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            toast.success(t('leads.updated'));
        } catch (error) {
            toastError(error);
        } finally {
            setIsSavingNote(false);
        }
    };

    // Calculate call urgency
    const todayStr = new Date().toISOString().slice(0, 10);
    const isOverdue = lead.next_call_date && lead.next_call_date < todayStr && !isWon;
    const isToday = lead.next_call_date && lead.next_call_date === todayStr && !isWon;

    return (
        <div className='fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200'>
            <div
                className='absolute inset-0'
                onClick={onClose}
                aria-hidden='true'
            />

            <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
                <div className='pointer-events-auto relative w-screen max-w-md bg-card-surface-area border-l border-card-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300'>
                    
                    {/* Drawer Header */}
                    <div className='border-b border-card-border p-5 pb-4'>
                        <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                                <div className='flex items-center gap-2'>
                                    <LeadStatusBadge status={lead.status} />
                                    {lead.source && <LeadSourceBadge source={lead.source} />}
                                </div>
                                <h3 className='text-text-primary mt-2 text-xl font-bold truncate'>
                                    {lead.first_name} {lead.last_name || ''}
                                </h3>
                                <div className='mt-1 flex items-center gap-2 text-sm'>
                                    <PhoneLink phone={lead.phone_number} />
                                </div>
                            </div>

                            <button
                                type='button'
                                onClick={onClose}
                                className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary rounded-xl p-2 transition-colors'
                                aria-label='Yopish'
                            >
                                <Close className='size-5' />
                            </button>
                        </div>

                        {/* Direct Call & Convert Toolbar */}
                        <div className='mt-4 flex items-center gap-2 border-t border-card-border/60 pt-3.5'>
                            <a
                                href={`tel:${lead.phone_number}`}
                                className='bg-brand-accent text-white hover:bg-brand-accent/90 flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold shadow-xs transition-all'
                            >
                                📞 {t('leadSource.call')}
                            </a>
                            {canConvert && !isWon && (
                                <button
                                    type='button'
                                    onClick={() => onConvert(lead)}
                                    className='bg-emerald-600 hover:bg-emerald-700 text-white flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold shadow-xs transition-all'
                                >
                                    <User2 className='size-4' />
                                    <span>+ O&apos;quvchiga</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Drawer Content Body */}
                    <div className='flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin'>
                        
                        {/* Status Pipeline Step Switcher */}
                        <div>
                            <label className='text-text-tertiary block text-xs font-semibold uppercase tracking-wider mb-2.5'>
                                Voronka bosqichi
                            </label>
                            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                                {EDITABLE_LEAD_STATUSES.map((status) => {
                                    const active = lead.status === status;
                                    return (
                                        <button
                                            key={status}
                                            type='button'
                                            disabled={!canUpdate || isWon || statusMutation.isPending}
                                            onClick={() => statusMutation.mutate(status)}
                                            className={cn(
                                                'flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs font-medium transition-all',
                                                active
                                                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent font-bold ring-2 ring-brand-accent/20 shadow-2xs'
                                                    : 'border-card-border bg-background-gray-secondary/50 text-text-secondary hover:border-card-border/80 hover:bg-background-gray-secondary',
                                                (!canUpdate || isWon) && 'cursor-default opacity-80',
                                            )}
                                        >
                                            <LeadStatusDot status={status} />
                                            <span className='truncate w-full text-[11px] mt-0.5'>
                                                {t(`leadStatus.${status}`)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {isWon && (
                                <div className='mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-between'>
                                    <span>{t('leads.statusWonHint')}</span>
                                    {lead.student && canOpenStudents && (
                                        <Link
                                            href={`/students/${lead.student.id}`}
                                            className='font-bold hover:underline shrink-0'
                                        >
                                            {t('leads.openStudent')} &rarr;
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Course & Branch Details */}
                        <div className='rounded-2xl border border-card-border bg-background-gray-secondary/30 p-4 space-y-3'>
                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-text-tertiary font-medium'>
                                    {t('leads.interest')}:
                                </span>
                                <span className='text-text-primary font-semibold'>
                                    {lead.course?.name ?? t('common.notSelected')}
                                </span>
                            </div>
                            <div className='flex items-center justify-between text-xs border-t border-card-border/50 pt-2.5'>
                                <span className='text-text-tertiary font-medium'>
                                    {t('groups.branch')}:
                                </span>
                                <span className='text-text-primary font-semibold'>
                                    {lead.branch?.name ?? t('common.notSelected')}
                                </span>
                            </div>
                            <div className='flex items-center justify-between text-xs border-t border-card-border/50 pt-2.5'>
                                <span className='text-text-tertiary font-medium'>
                                    {t('common.createdAt')}:
                                </span>
                                <span className='text-text-primary font-medium tabular-nums'>
                                    {formatDate(lead.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Next Call Date Section */}
                        <div className='rounded-2xl border border-card-border bg-card-surface-area p-4 space-y-3 shadow-2xs'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-1.5 text-xs font-bold text-text-primary'>
                                    <Calendar className='size-4 text-brand-accent' />
                                    <span>Keyingi qo'ng'iroq vaqti</span>
                                </div>
                                {isOverdue && (
                                    <span className='rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 animate-pulse'>
                                        ⚠️ Muddati o'tgan
                                    </span>
                                )}
                                {isToday && (
                                    <span className='rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400'>
                                        ⏰ Bugun
                                    </span>
                                )}
                            </div>

                            {canUpdate ? (
                                <div className='flex items-center gap-2'>
                                    <TextInput
                                        type='date'
                                        value={nextCallDate}
                                        onChange={(e) => setNextCallDate(e.target.value)}
                                        className='flex-1 h-9 text-xs'
                                    />
                                    <Button
                                        appearance='outline'
                                        size='sm'
                                        isDisabled={isSavingNote || nextCallDate === (lead.next_call_date?.slice(0, 10) ?? '')}
                                        onPress={() => updateLeadDetails({ next_call_date: nextCallDate || null })}
                                    >
                                        Saqlash
                                    </Button>
                                </div>
                            ) : (
                                <p className='text-xs text-text-secondary font-medium tabular-nums'>
                                    {lead.next_call_date ? formatDate(lead.next_call_date) : t('common.notSelected')}
                                </p>
                            )}
                        </div>

                        {/* Note & History Section */}
                        <div className='space-y-2.5'>
                            <label className='text-text-tertiary block text-xs font-semibold uppercase tracking-wider'>
                                Eslatmalari & Tarix
                            </label>
                            {canUpdate ? (
                                <div className='space-y-2'>
                                    <TextareaInput
                                        value={note}
                                        placeholder="Mijoz bilan muloqot va kelishuvlar haqida eslatma yozing..."
                                        rows={4}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                    <div className='flex justify-end'>
                                        <Button
                                            appearance='fill'
                                            variant='primary'
                                            size='sm'
                                            isDisabled={isSavingNote || note === (lead.note ?? '')}
                                            onPress={() => updateLeadDetails({ note: note.trim() || null })}
                                        >
                                            {isSavingNote ? t('common.saving') : 'Eslatmani saqlash'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className='rounded-xl border border-card-border bg-background-gray-secondary/40 p-3 text-xs text-text-primary whitespace-pre-wrap min-h-20'>
                                    {lead.note || "Eslatma mavjud emas"}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Drawer Footer Actions */}
                    <div className='border-t border-card-border p-4 bg-background-gray-secondary/30 flex items-center justify-between gap-2'>
                        {canDelete && (
                            <Button
                                variant='danger'
                                appearance='outline'
                                size='md'
                                onPress={() => onDelete(lead)}
                            >
                                <Trash1 className='size-4' />
                                <span>{t('common.delete')}</span>
                            </Button>
                        )}
                        <div className='flex items-center gap-2 ml-auto'>
                            {canUpdate && (
                                <Button
                                    appearance='outline'
                                    size='md'
                                    onPress={() => onEdit(lead)}
                                >
                                    <Pencil1 className='size-4' />
                                    <span>{t('common.edit')}</span>
                                </Button>
                            )}
                            <Button
                                appearance='fill'
                                size='md'
                                onPress={onClose}
                            >
                                {t('common.close')}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
