'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { fullName } from '@/utils/format';
import { TONE_TEXT } from '@/utils/tone';
import { Printer } from '@tailgrids/icons';

/**
 * To'lov cheki. Chop etishda faqat `#printable-receipt` qoladi — qolgan
 * sahifa globals.css'dagi print qoidasi bilan yashiriladi.
 */
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
    const { formatDate, formatPrice } = useFormat();
    const { session } = useSession();

    // To'lovni hozirgi foydalanuvchi qabul qildi.
    const receivedBy =
        receiptData.receivedBy ??
        (session?.kind === 'user' ? fullName(session) : undefined);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('receipt.title')}
            size='md'
        >
            <div className='space-y-4'>
                <div
                    id='printable-receipt'
                    className='border-card-border bg-card-surface-area rounded-xl border p-6 font-mono text-sm shadow-inner'
                >
                    <div className='border-b pb-4 text-center'>
                        <h3 className='font-display text-text-primary text-base font-bold tracking-wide uppercase'>
                            {session?.education?.name || t('receipt.education')}
                        </h3>
                        <p className='text-text-tertiary mt-0.5 text-xs uppercase'>
                            {t('receipt.heading')}
                        </p>
                        <p className='text-text-secondary mt-1 text-xs tabular-nums'>
                            {t('receipt.date')}: {formatDate(receiptData.date)}
                        </p>
                    </div>

                    <div className='space-y-2 border-b py-4 text-xs'>
                        <div className='flex justify-between gap-4'>
                            <span className='text-text-tertiary'>
                                {t('common.student')}:
                            </span>
                            <span className='text-text-primary text-right font-bold'>
                                {receiptData.studentName}
                            </span>
                        </div>
                        <div className='flex justify-between gap-4'>
                            <span className='text-text-tertiary'>
                                {t('common.group')}:
                            </span>
                            <span className='text-text-primary text-right font-medium'>
                                {receiptData.groupName}
                            </span>
                        </div>
                        <div className='flex justify-between gap-4'>
                            <span className='text-text-tertiary'>
                                {t('cashbox.method')}:
                            </span>
                            <span className='text-text-primary text-right uppercase'>
                                {receiptData.method}
                            </span>
                        </div>
                        {receivedBy && (
                            <div className='flex justify-between gap-4'>
                                <span className='text-text-tertiary'>
                                    {t('receipt.cashier')}:
                                </span>
                                <span className='text-text-primary text-right'>
                                    {receivedBy}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className='flex items-center justify-between gap-4 pt-4 text-base font-bold'>
                        <span className='text-text-primary uppercase'>
                            {t('receipt.total')}:
                        </span>
                        <span className={`tabular-nums ${TONE_TEXT.success}`}>
                            {formatPrice(receiptData.amount, t('common.som'))}
                        </span>
                    </div>
                </div>

                <div className='flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center'>
                    <Button
                        appearance='outline'
                        className='w-full sm:w-auto'
                        onPress={onClose}
                    >
                        {t('common.close')}
                    </Button>
                    <Button
                        variant='primary'
                        appearance='fill'
                        className='w-full sm:w-auto'
                        onPress={() => window.print()}
                    >
                        <Printer className='size-4' />
                        {t('receipt.print')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
