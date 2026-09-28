'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useT } from '@/i18n/provider';
import { formatPhone } from '@/utils/format';
import { Send1 } from '@tailgrids/icons';
import { useState } from 'react';
import { toast } from 'sonner';

export function BatchSmsModal({
    open,
    recipients,
    onClose,
}: {
    open: boolean;
    recipients: { name: string; phone: string; debt: number }[];
    onClose: () => void;
}) {
    const t = useT();
    const [message, setMessage] = useState(
        "Hushnudlik bilan eslatamiz: O'quv markazingizdan qarzdorlik mavjud. Iltimos, to'lovni o'z vaqtida amalga oshiring.",
    );
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toast.success(`${recipients.length} ta qarzdorga SMS yuborildi!`);
            onClose();
        } catch (e) {
            toast.error('SMS yuborishda xatolik yuz berdi');
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title='Qarzdorlarga SMS yuborish'
            size='md'
        >
            <div className='space-y-4'>
                <p className='text-text-tertiary text-sm'>
                    Tanlangan {recipients.length} ta o'quvchiga matn
                    jo'natiladi:
                </p>

                <div className='border-card-border bg-background-gray-secondary max-h-36 scrollbar-thin space-y-1 overflow-y-auto rounded-xl border p-2.5 text-xs'>
                    {recipients.map((r, i) => (
                        <div
                            key={i}
                            className='flex items-center justify-between'
                        >
                            <span className='text-text-primary font-medium'>
                                {r.name}
                            </span>
                            <span className='text-text-tertiary tabular-nums'>
                                {formatPhone(r.phone)} (
                                {r.debt.toLocaleString()} so'm)
                            </span>
                        </div>
                    ))}
                </div>

                <div>
                    <label className='text-text-secondary mb-1 block text-xs font-medium'>
                        SMS matni:
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className='border-card-border bg-card-surface-area text-text-primary focus:border-input-primary-focus-border w-full rounded-xl border p-3 text-sm outline-none'
                    />
                </div>

                <div className='flex items-center justify-end gap-2 pt-2'>
                    <Button
                        appearance='outline'
                        onPress={onClose}
                        isDisabled={sending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant='primary'
                        appearance='fill'
                        onPress={handleSend}
                        isDisabled={sending}
                    >
                        <Send1 className='size-4' />
                        {sending
                            ? 'Yuborilmoqda…'
                            : `${recipients.length} ta SMS yuborish`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
