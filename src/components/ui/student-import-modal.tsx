'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createStudent } from '@/services/api/students';
import { formatPhone } from '@/utils/format';
import { Download1 } from '@tailgrids/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

interface ParsedStudent {
    first_name: string;
    last_name: string;
    phone_number: string;
    parent_phone?: string;
}

export function StudentImportModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const queryClient = useQueryClient();
    const toastError = useApiErrorToast();

    const [textData, setTextData] = useState('');
    const [parsedRows, setParsedRows] = useState<ParsedStudent[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'input' | 'preview'>('input');

    const handleParse = () => {
        const lines = textData
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const rows: ParsedStudent[] = [];

        for (const line of lines) {
            // Split by comma, tab, or semicolon
            const parts = line.split(/[\t,;]+/).map((p) => p.trim());
            if (parts.length >= 2) {
                const first_name = parts[0];
                const last_name = parts.length >= 3 ? parts[1] : '';
                const phone_number = parts.length >= 3 ? parts[2] : parts[1];
                const parent_phone = parts.length >= 4 ? parts[3] : undefined;

                if (first_name && phone_number) {
                    rows.push({
                        first_name,
                        last_name,
                        phone_number,
                        parent_phone,
                    });
                }
            }
        }

        if (rows.length === 0) {
            toast.error("Ma'lumotlar formati noto'g'ri. Har bir qatorda: Ism, Familiya, Telefon bo'lishi kerak.");
            return;
        }

        setParsedRows(rows);
        setStep('preview');
    };

    const handleImport = async () => {
        setSubmitting(true);
        let successCount = 0;

        try {
            for (const student of parsedRows) {
                try {
                    await createStudent({
                        first_name: student.first_name,
                        last_name: student.last_name || '',
                        phone_number: student.phone_number,
                        parent_phone: student.parent_phone || undefined,
                        branch_id: '',
                    });
                    successCount++;
                } catch (e) {
                    // ignore single failure and continue batch
                }
            }

            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(`${successCount} ta o'quvchi muvaffaqiyatli import qilindi!`);
            onClose();
        } catch (error) {
            toastError(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Excel / CSV'dan o'quvchilarni import qilish"
            size='lg'
        >
            {step === 'input' ? (
                <div className='space-y-4'>
                    <p className='text-text-tertiary text-sm'>
                        Excel'dan nusxalab olingan ustunlarni (Ism, Familiya, Telefon) pastga joylashtiring:
                    </p>
                    <textarea
                        value={textData}
                        onChange={(e) => setTextData(e.target.value)}
                        placeholder={`Ali	Valiyev	+998901234567\nZilola	Karimova	+998909876543`}
                        rows={8}
                        className='border-card-border bg-background-gray-secondary text-text-primary w-full rounded-xl border p-3 text-sm font-mono outline-none focus:border-input-primary-focus-border'
                    />

                    <div className='flex items-center justify-between pt-2'>
                        <button
                            type='button'
                            onClick={() => {
                                const sample = "Ism,Familiya,Telefon\nAli,Valiyev,+998901234567\nZilola,Karimova,+998909876543";
                                const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'namuna_oquvchilar.csv';
                                a.click();
                            }}
                            className='text-brand-accent flex items-center gap-1.5 text-xs font-medium hover:underline'
                        >
                            <Download1 className='size-3.5' />
                            Namuna shablonini yuklab olish
                        </button>
                        <div className='flex gap-2'>
                            <Button appearance='outline' onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button variant='primary' appearance='fill' onPress={handleParse}>
                                Tekshirish ({textData.split('\n').filter(Boolean).length} qator)
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='space-y-4'>
                    <p className='text-text-primary text-sm font-medium'>
                        {parsedRows.length} ta o'quvchi tayyor:
                    </p>
                    <div className='border-card-border scrollbar-thin max-h-60 overflow-y-auto rounded-xl border'>
                        <table className='w-full text-left text-sm'>
                            <thead className='bg-background-gray-secondary border-b text-xs font-semibold uppercase'>
                                <tr>
                                    <th className='p-2.5'>#</th>
                                    <th className='p-2.5'>Ism</th>
                                    <th className='p-2.5'>Familiya</th>
                                    <th className='p-2.5'>Telefon</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y'>
                                {parsedRows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className='text-text-tertiary p-2.5 text-xs'>{idx + 1}</td>
                                        <td className='text-text-primary p-2.5 font-medium'>{row.first_name}</td>
                                        <td className='text-text-secondary p-2.5'>{row.last_name || '—'}</td>
                                        <td className='text-text-secondary p-2.5 tabular-nums'>{formatPhone(row.phone_number)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='flex items-center justify-end gap-2 pt-2'>
                        <Button appearance='outline' onPress={() => setStep('input')} isDisabled={submitting}>
                            Orqaga
                        </Button>
                        <Button variant='primary' appearance='fill' onPress={handleImport} isDisabled={submitting}>
                            {submitting ? 'Import qilinmoqda…' : `Barchasini saqlash (${parsedRows.length})`}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
