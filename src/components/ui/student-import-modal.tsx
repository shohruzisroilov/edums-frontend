'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createStudent } from '@/services/api/students';
import { formatPhone } from '@/utils/format';
import { Download1 } from '@tailgrids/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ParsedStudent {
    first_name: string;
    last_name: string;
    phone_number: string;
    parent_phone?: string;
}

/** CSV matnini ParsedStudent[] ga aylantiradi */
function parseCsvText(text: string): ParsedStudent[] {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const rows: ParsedStudent[] = [];

    for (const line of lines) {
        const parts = line.split(/[\t,;]+/).map((p) => p.trim());
        if (parts.length < 2) continue;

        const first_name = parts[0];
        const last_name = parts.length >= 3 ? parts[1] : '';
        const phone_number = parts.length >= 3 ? parts[2] : parts[1];
        const parent_phone = parts.length >= 4 ? parts[3] : undefined;

        // Sarlavha qatorini o'tkazib yuborish
        if (/ism|name|first/i.test(first_name)) continue;

        if (first_name && phone_number) {
            rows.push({ first_name, last_name, phone_number, parent_phone });
        }
    }

    return rows;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fileName, setFileName] = useState<string | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedStudent[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [dragOver, setDragOver] = useState(false);

    const processFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
            toast.error('Faqat .csv, .xlsx yoki .xls fayl qabul qilinadi');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = parseCsvText(text);

            if (rows.length === 0) {
                toast.error(
                    "Fayl bo'sh yoki format noto'g'ri. Ustunlar: Ism, Familiya, Telefon",
                );
                return;
            }

            setParsedRows(rows);
            setStep('preview');
        };

        // CSV va xlsx uchun text sifatida o'qiymiz
        reader.readAsText(file, 'UTF-8');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
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
                } catch {
                    // bitta xato butun importni to'xtatmasin
                }
            }

            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(
                `${successCount} ta o'quvchi muvaffaqiyatli import qilindi!`,
            );
            onClose();
        } catch (error) {
            toastError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setStep('upload');
        setFileName(null);
        setParsedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadSample = () => {
        const sample =
            'Ism,Familiya,Telefon,Ota-ona telefoni\nAli,Valiyev,+998901234567,+998901234568\nZilola,Karimova,+998909876543,';
        const blob = new Blob(['\uFEFF' + sample], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'namuna_oquvchilar.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Excel / CSV'dan o'quvchilarni import qilish"
            size='lg'
        >
            {step === 'upload' ? (
                <div className='space-y-4'>
                    {/* Drag & Drop zona */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition select-none
                            ${dragOver ? 'border-brand-accent bg-brand-accent/5' : 'border-card-border hover:border-brand-accent/50 hover:bg-background-gray-secondary'}`}
                    >
                        <div className='bg-background-gray-secondary flex size-14 items-center justify-center rounded-full'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='text-text-tertiary size-7'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
                                />
                            </svg>
                        </div>
                        <div className='text-center'>
                            <p className='text-text-primary text-sm font-medium'>
                                Faylni shu yerga tashlang yoki{' '}
                                <span className='text-brand-accent'>tanlang</span>
                            </p>
                            <p className='text-text-tertiary mt-1 text-xs'>
                                .csv, .xlsx, .xls — maksimal 10 MB
                            </p>
                        </div>
                        {fileName && (
                            <p className='text-brand-accent text-xs font-medium'>
                                ✓ {fileName}
                            </p>
                        )}
                    </div>

                    {/* Yashirin file input */}
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='.csv,.xlsx,.xls'
                        className='hidden'
                        onChange={handleFileChange}
                    />

                    {/* Ustunlar tartibi haqida izoh */}
                    <div className='border-card-border bg-background-gray-secondary rounded-xl border p-3'>
                        <p className='text-text-secondary text-xs font-medium'>
                            Fayl ustunlari tartibi:
                        </p>
                        <p className='text-text-tertiary mt-1 font-mono text-xs'>
                            Ism | Familiya | Telefon | Ota-ona tel. (ixtiyoriy)
                        </p>
                    </div>

                    <div className='flex items-center justify-between pt-1'>
                        <button
                            type='button'
                            onClick={downloadSample}
                            className='text-brand-accent flex items-center gap-1.5 text-xs font-medium hover:underline'
                        >
                            <Download1 className='size-3.5' />
                            Namuna shablonini yuklab olish
                        </button>
                        <Button appearance='outline' onPress={onClose}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <p className='text-text-primary text-sm font-medium'>
                            {parsedRows.length} ta o&apos;quvchi tayyor
                        </p>
                        <p className='text-text-tertiary text-xs'>{fileName}</p>
                    </div>

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
                                        <td className='text-text-tertiary p-2.5 text-xs'>
                                            {idx + 1}
                                        </td>
                                        <td className='text-text-primary p-2.5 font-medium'>
                                            {row.first_name}
                                        </td>
                                        <td className='text-text-secondary p-2.5'>
                                            {row.last_name || '—'}
                                        </td>
                                        <td className='text-text-secondary p-2.5 tabular-nums'>
                                            {formatPhone(row.phone_number)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex items-center justify-end gap-2 pt-2'>
                        <Button
                            appearance='outline'
                            onPress={handleReset}
                            isDisabled={submitting}
                        >
                            Boshqa fayl
                        </Button>
                        <Button
                            variant='primary'
                            appearance='fill'
                            onPress={handleImport}
                            isDisabled={submitting}
                        >
                            {submitting
                                ? 'Import qilinmoqda…'
                                : `Barchasini saqlash (${parsedRows.length})`}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
