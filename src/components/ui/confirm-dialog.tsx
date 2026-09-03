'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { Modal } from './modal';

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    pending,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    pending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const t = useT();

    return (
        <Modal open={open} onClose={onCancel} title={title}>
            <p className='text-text-secondary text-sm'>{message}</p>

            <div className='mt-6 flex items-center justify-end gap-2'>
                <Button
                    appearance='outline'
                    size='md'
                    onPress={onCancel}
                    isDisabled={pending}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    variant='danger'
                    appearance='fill'
                    size='md'
                    onPress={onConfirm}
                    isDisabled={pending}
                >
                    {pending
                        ? t('common.deleting')
                        : (confirmLabel ?? t('common.delete'))}
                </Button>
            </div>
        </Modal>
    );
}
