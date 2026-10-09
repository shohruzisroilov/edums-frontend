'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { deleteLead, updateLead } from '@/services/api/leads';
import { EDITABLE_LEAD_STATUSES, type EditableLeadStatus } from '@/types/api';
import { Download1, Trash1 } from '@tailgrids/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

interface LeadBatchActionsProps {
    selectedIds: string[];
    onClearSelection: () => void;
    canUpdate: boolean;
    canDelete: boolean;
    onExport?: () => void;
}

export function LeadBatchActionsBar({
    selectedIds,
    onClearSelection,
    canUpdate,
    canDelete,
    onExport,
}: LeadBatchActionsProps) {
    const t = useT();
    const queryClient = useQueryClient();
    const toastError = useApiErrorToast();

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] =
        useState<EditableLeadStatus>('contacted');
    const [isPending, setIsPending] = useState(false);

    if (selectedIds.length === 0) return null;

    const count = selectedIds.length;

    const handleBatchStatus = async () => {
        setIsPending(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    updateLead(id, { status: targetStatus }),
                ),
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
            <div className='animate-in fade-in slide-in-from-bottom-5 fixed bottom-20 left-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 px-2 duration-200 sm:max-w-md sm:px-0 md:bottom-6'>
                <div className='bg-card-surface-area border-card-border flex items-center gap-2 rounded-2xl border p-2 px-3 shadow-2xl backdrop-blur-md sm:gap-3 sm:p-2.5 sm:px-4'>
                    <div className='border-card-border flex shrink-0 items-center gap-1.5 border-r pr-2 sm:gap-2'>
                        <span className='bg-brand-accent rounded-lg px-2 py-0.5 text-xs font-bold text-white tabular-nums sm:py-1'>
                            {count}
                        </span>
                        <span className='text-text-primary hidden text-xs font-semibold sm:inline'>
                            lid tanlandi
                        </span>
                    </div>

                    {canUpdate && (
                        <Button
                            appearance='outline'
                            size='sm'
                            onPress={() => setStatusModalOpen(true)}
                            className='text-xs'
                        >
                            <span className='sm:hidden'>Holat</span>
                            <span className='hidden sm:inline'>
                                Holatni o&apos;zgartirish
                            </span>
                        </Button>
                    )}

                    {onExport && (
                        <Button
                            appearance='outline'
                            size='sm'
                            onPress={onExport}
                            className='text-xs'
                        >
                            <Download1 className='size-3.5' />
                            <span className='hidden sm:inline'>
                                {t('common.export')}
                            </span>
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
                            <span className='hidden sm:inline'>
                                {t('common.delete')}
                            </span>
                        </Button>
                    )}

                    <button
                        type='button'
                        onClick={onClearSelection}
                        className='text-text-tertiary hover:text-text-primary px-2 py-1 text-xs font-medium transition-colors'
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
                            onValueChange={(val) =>
                                setTargetStatus(val as EditableLeadStatus)
                            }
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
                                {isPending
                                    ? t('common.saving')
                                    : t('common.save')}
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
                            {isPending
                                ? t('common.saving')
                                : `${count} ta lidni o'chirish`}
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    );
}
