'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { LeadStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { deleteLead, updateLead } from '@/services/api/leads';
import type { EditableLeadStatus } from '@/types/api';
import { EDITABLE_LEAD_STATUSES } from '@/types/api';
import { Trash1 } from '@tailgrids/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

interface LeadBatchActionsProps {
    selectedIds: string[];
    onClearSelection: () => void;
    canUpdate: boolean;
    canDelete: boolean;
}

export function LeadBatchActionsBar({
    selectedIds,
    onClearSelection,
    canUpdate,
    canDelete,
}: LeadBatchActionsProps) {
    const t = useT();
    const queryClient = useQueryClient();
    const toastError = useApiErrorToast();

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<EditableLeadStatus>('contacted');
    const [isPending, setIsPending] = useState(false);

    if (selectedIds.length === 0) return null;

    const count = selectedIds.length;

    const handleBatchStatus = async () => {
        setIsPending(true);
        try {
            await Promise.all(
                selectedIds.map((id) => updateLead(id, { status: targetStatus })),
            );
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['leads'] }),
                queryClient.invalidateQueries({ queryKey: ['lead-stats'] }),
            ]);
            toast.success(t('leads.batchStatusDone', { count }));
            setStatusModalOpen(false);
            onClearSelection();
        } catch (err) {
            toastError(err);
        } finally {
            setIsPending(false);
        }
    };

    const handleBatchDelete = async () => {
        setIsPending(true);
        try {
            await Promise.all(selectedIds.map((id) => deleteLead(id)));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['leads'] }),
                queryClient.invalidateQueries({ queryKey: ['lead-stats'] }),
            ]);
            toast.success(t('leads.batchDeleteDone', { count }));
            setDeleteModalOpen(false);
            onClearSelection();
        } catch (err) {
            toastError(err);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            {/* Floating Bottom Bar */}
            <div className='fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-200'>
                <div className='bg-card-surface-area border border-card-border shadow-2xl rounded-2xl p-2.5 px-4 flex items-center gap-3 backdrop-blur-md'>
                    <div className='flex items-center gap-2 pr-2 border-r border-card-border'>
                        <span className='bg-brand-accent text-white font-bold text-xs rounded-lg px-2 py-1 tabular-nums'>
                            {count}
                        </span>
                        <span className='text-text-primary text-xs font-semibold hidden sm:inline'>
                            lid tanlandi
                        </span>
                    </div>

                    {canUpdate && (
                        <Button
                            appearance='outline'
                            size='sm'
                            onPress={() => setStatusModalOpen(true)}
                        >
                            Holatni o&apos;zgartirish
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            variant='danger'
                            appearance='outline'
                            size='sm'
                            onPress={() => setDeleteModalOpen(true)}
                        >
                            <Trash1 className='size-3.5' />
                            <span className='hidden sm:inline'>{t('common.delete')}</span>
                        </Button>
                    )}

                    <button
                        type='button'
                        onClick={onClearSelection}
                        className='text-text-tertiary hover:text-text-primary text-xs font-medium px-2 py-1 transition-colors'
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>

            {/* Batch Status Modal */}
            {statusModalOpen && (
                <Modal
                    open
                    onClose={() => setStatusModalOpen(false)}
                    title="Tanlangan lidlar holatini o'zgartirish"
                    description={`${count} ta lid uchun yangi holatni tanlang:`}
                    size='md'
                >
                    <div className='space-y-4 pt-1'>
                        <SelectInput
                            label={t('common.status')}
                            options={EDITABLE_LEAD_STATUSES.map((status) => ({
                                value: status,
                                label: t(`leadStatus.${status}`),
                            }))}
                            value={targetStatus}
                            onValueChange={(val) => setTargetStatus(val as EditableLeadStatus)}
                        />

                        <div className='flex items-center justify-end gap-2 pt-2'>
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => setStatusModalOpen(false)}
                                isDisabled={isPending}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                isDisabled={isPending}
                                onPress={handleBatchStatus}
                            >
                                {isPending ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Batch Delete Modal */}
            {deleteModalOpen && (
                <Modal
                    open
                    onClose={() => setDeleteModalOpen(false)}
                    title="Lidlarni o'chirish"
                    description={`Tanlangan ${count} ta lid butunlay o'chiriladi. Ishonchingiz komilmi?`}
                    size='md'
                >
                    <div className='flex items-center justify-end gap-2 pt-4'>
                        <Button
                            appearance='outline'
                            size='md'
                            onPress={() => setDeleteModalOpen(false)}
                            isDisabled={isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant='danger'
                            appearance='fill'
                            size='md'
                            isDisabled={isPending}
                            onPress={handleBatchDelete}
                        >
                            {isPending ? t('common.saving') : `${count} ta lidni o'chirish`}
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    );
}
