'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { formatPhone } from '@/utils/format';
import { Printer } from '@tailgrids/icons';

export function ReceiptModal({
    open,
    onClose,
    receiptData,
}: {
    open: boolean;
    onClose: () => void;
    receiptData: {
        studentName: string;
        groupName: string;
        amount: number;
        method: string;
        date: string;
        receivedBy?: string;
    };
}) {
    const t = useT();
    const { session } = useSession();

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal open={open} onClose={onClose} title="To'lov cheki" size='md'>
            <div className='space-y-4'>
                <div
                    id='printable-receipt'
                    className='border-card-border bg-card-surface-area rounded-xl border p-6 text-sm font-mono shadow-inner'
                >
                    <div className='border-b pb-4 text-center'>
                        <h3 className='font-display text-base font-bold uppercase tracking-wide text-text-primary'>
                            {session?.education?.name || "O'quv Markaz"}
                        </h3>
                        <p className='text-text-tertiary text-xs mt-0.5'>TO'LOV KVTANSIYASI</p>
                        <p className='text-text-secondary text-xs mt-1 tabular-nums'>Sana: {receiptData.date}</p>
                    </div>

                    <div className='space-y-2 py-4 border-b text-xs'>
                        <div className='flex justify-between'>
                            <span className='text-text-tertiary'>O'quvchi:</span>
                            <span className='text-text-primary font-bold'>{receiptData.studentName}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-text-tertiary'>Guruh:</span>
                            <span className='text-text-primary font-medium'>{receiptData.groupName}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-text-tertiary'>To'lov turi:</span>
                            <span className='text-text-primary uppercase'>{receiptData.method}</span>
                        </div>
                        {receiptData.receivedBy && (
                            <div className='flex justify-between'>
                                <span className='text-text-tertiary'>Kassir:</span>
                                <span className='text-text-primary'>{receiptData.receivedBy}</span>
                            </div>
                        )}
                    </div>

                    <div className='pt-4 flex items-center justify-between font-bold text-base'>
                        <span className='text-text-primary uppercase'>Jami to'landi:</span>
                        <span className='text-emerald-600 dark:text-emerald-400 tabular-nums'>
                            {receiptData.amount.toLocaleString()} so'm
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-end gap-2 pt-2'>
                    <Button appearance='outline' onPress={onClose}>
                        {t('common.close')}
                    </Button>
                    <Button variant='primary' appearance='fill' onPress={handlePrint}>
                        <Printer className='size-4' />
                        Chop etish / PDF
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
