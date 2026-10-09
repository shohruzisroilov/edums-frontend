'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { createStudent } from '@/services/api/students';
import { cn } from '@/utils/cn';
import { exportToExcel } from '@/utils/export';
import { formatPhone } from '@/utils/format';
import { invalidateStudyData } from '@/utils/query-cache';
import { TONE_TEXT } from '@/utils/tone';
import { Download1 } from '@tailgrids/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface ImportRow {
    /** Fayldagi qator raqami — xato qaysi qatorda ekanini aytish uchun. */
    line: number;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    parent_phone: string | null;
    /** Yuborishdan oldin topilgan kamchilik; bo'lsa, qator yuborilmaydi. */
    problem: 'name' | 'phone' | null;
}

interface ImportFailure {
    line: number;
    name: string;
    message: string;
}

/**
 * `+998 (90) 123-45-67`, `998901234567`, `90 123 45 67` → `+998901234567`.
 * Excel raqamni son sifatida saqlasa ham shu yerga matn bo'lib keladi.
 */
function normalizePhone(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 9) return `+998${digits}`;
    if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
    return null;
}

/**
 * Ustunlar: Ism | Familiya | Telefon | Ota-ona telefoni yoki F.I.SH | Telefon.
 * Ikki ustunli fayllar (F.I.SH. va Telefon) va uch ustunli fayllar ham avtomatik
 * aniqlanib, ism va familiyaga ajratiladi.
 */
function toRows(table: unknown[][]): ImportRow[] {
    const rows: ImportRow[] = [];

    table.forEach((cells, index) => {
        const parts = cells.map((cell) => String(cell ?? '').trim());
        if (parts.every((part) => part === '')) return;

        // Birinchi qatorda raqam umuman bo'lmasa — bu jadval sarlavhasi (Header)
        const hasDigitsAnywhere = parts.some((p) => /\d{5,}/.test(p));
        if (index === 0 && !hasDigitsAnywhere) return;

        let first_name = '';
        let last_name = '';
        let phone_raw = '';
        let parent_raw = '';

        const col1IsPhone = /\d{5,}/.test(parts[1] ?? '');
        const twoColumns = parts.filter(Boolean).length <= 2 || col1IsPhone;

        if (twoColumns) {
            const rawFullName = parts[0] ?? '';
            phone_raw = parts[1] ?? '';
            const nameTokens = rawFullName.split(/\s+/).filter(Boolean);
            if (nameTokens.length >= 2) {
                first_name = nameTokens[0];
                last_name = nameTokens.slice(1).join(' ');
            } else {
                first_name = nameTokens[0] ?? '';
                last_name = '-';
            }
        } else if (col1IsPhone) {
            // [F.I.SH., Telefon, Ota-ona telefoni]
            const rawFullName = parts[0] ?? '';
            const nameTokens = rawFullName.split(/\s+/).filter(Boolean);
            if (nameTokens.length >= 2) {
                first_name = nameTokens[0];
                last_name = nameTokens.slice(1).join(' ');
            } else {
                first_name = nameTokens[0] ?? '';
                last_name = '-';
            }
            phone_raw = parts[1] ?? '';
            parent_raw = parts[2] ?? '';
        } else {
            // [Ism, Familiya, Telefon, Ota-ona telefoni]
            first_name = parts[0] ?? '';
            last_name = parts[1] ?? '';
            phone_raw = parts[2] ?? '';
            parent_raw = parts[3] ?? '';

            if (!last_name && first_name.includes(' ')) {
                const nameTokens = first_name.split(/\s+/).filter(Boolean);
                first_name = nameTokens[0];
                last_name = nameTokens.slice(1).join(' ');
            } else if (!last_name && first_name) {
                last_name = '-';
            }
        }

        const phone_number = phone_raw ? normalizePhone(phone_raw) : null;
        const parent_phone = parent_raw ? normalizePhone(parent_raw) : null;
        const phone_invalid =
            (phone_raw !== '' && phone_number === null) ||
            (parent_raw !== '' && parent_phone === null) ||
            (!phone_number && !parent_phone);

        rows.push({
            line: index + 1,
            first_name,
            last_name,
            phone_number,
            parent_phone,
            problem: !first_name ? 'name' : phone_invalid ? 'phone' : null,
        });
    });

    return rows;
}

async function readTable(file: File): Promise<unknown[][]> {
    const XLSX = await import('xlsx');
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    // CSV matn sifatida (UTF-8) o'qiladi — aks holda kirill harflari buziladi.
    const workbook = isCsv
        ? XLSX.read(await file.text(), { type: 'string', raw: true })
        : XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return [];

    // raw: katakning qiymati, ko'rinishi emas — Excel 12 xonali telefonni
    // "9,98901E+11" qilib ko'rsatadi, qiymati esa to'liq qoladi.
    return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        raw: true,
        defval: '',
        blankrows: false,
    });
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = (branchesQuery.data ?? []).filter(
        (branch) => branch.is_active,
    );

    const [branchChoice, setBranchChoice] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [failures, setFailures] = useState<ImportFailure[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [dragOver, setDragOver] = useState(false);

    // Bitta filial bo'lsa, u avtomatik tanlanadi.
    const branchId =
        branchChoice || (branches.length === 1 ? branches[0].id : '');
    const readyRows = rows.filter((row) => row.problem === null);

    const processFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
            toast.error(t('import.wrongType'));
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            toast.error(t('import.tooLarge'));
            return;
        }

        let parsed: ImportRow[];
        try {
            parsed = toRows(await readTable(file));
        } catch {
            toast.error(t('import.unreadable'));
            return;
        }

        if (parsed.length === 0) {
            toast.error(t('import.empty'));
            return;
        }

        setFileName(file.name);
        setRows(parsed);
        setFailures([]);
        setStep('preview');
    };

    const handleImport = async () => {
        setSubmitting(true);
        const failed: ImportFailure[] = [];
        let imported = 0;

        // Ketma-ket: tarif limiti va xatolar har bir qator uchun alohida
        // aniqlanadi, bitta xato qolganlarini to'xtatmaydi.
        for (const row of readyRows) {
            try {
                await createStudent({
                    branch_id: branchId,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    phone_number: row.phone_number,
                    parent_phone: row.parent_phone,
                });
                imported += 1;
            } catch (error) {
                failed.push({
                    line: row.line,
                    name: `${row.last_name} ${row.first_name}`.trim(),
                    message: apiErrorMessage(error, t),
                });
            }
        }

        setSubmitting(false);
        if (imported > 0) invalidateStudyData(queryClient);

        if (failed.length === 0) {
            toast.success(t('import.done', { count: imported }));
            onClose();
            return;
        }

        // Xatolar ko'rinib tursin: qaysi qatorni tuzatish kerakligi aniq bo'lsin.
        toast.error(
            t('import.partial', { count: imported, failed: failed.length }),
        );
        const failedLines = new Set(failed.map((item) => item.line));
        setRows((prev) =>
            prev.filter(
                (row) => row.problem !== null || failedLines.has(row.line),
            ),
        );
        setFailures(failed);
    };

    const handleReset = () => {
        setStep('upload');
        setFileName(null);
        setRows([]);
        setFailures([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadSample = () => {
        void exportToExcel(
            t('import.sampleFile'),
            'Namuna',
            [
                t('common.firstName'),
                t('common.lastName'),
                t('common.phone'),
                t('students.parentPhone'),
            ],
            [
                ['Ali', 'Valiyev', '+998901234567', '+998901234568'],
                ['Zilola', 'Karimova', '+998909876543', ''],
            ],
        );
    };

    const problemText = (row: ImportRow) =>
        row.problem === 'name'
            ? t('import.problemName')
            : row.problem === 'phone'
              ? t('import.problemPhone')
              : failures.find((item) => item.line === row.line)?.message;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('import.title')}
            size='lg'
        >
            {step === 'upload' ? (
                <div className='space-y-4'>
                    <div
                        role='button'
                        tabIndex={0}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) void processFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        className={cn(
                            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition select-none',
                            dragOver
                                ? 'border-brand-accent bg-brand-accent/5'
                                : 'border-card-border hover:border-brand-accent/50 hover:bg-background-gray-secondary',
                        )}
                    >
                        <div className='bg-background-gray-secondary flex size-14 items-center justify-center rounded-full'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='text-text-tertiary size-7'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={1.5}
                                aria-hidden
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
                                {t('import.dropOrPick')}
                            </p>
                            <p className='text-text-tertiary mt-1 text-xs'>
                                {t('import.formats')}
                            </p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='.csv,.xlsx,.xls'
                        className='hidden'
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void processFile(file);
                        }}
                    />

                    <div className='border-card-border bg-background-gray-secondary rounded-xl border p-3'>
                        <p className='text-text-secondary text-xs font-medium'>
                            {t('import.columnsTitle')}
                        </p>
                        <p className='text-text-tertiary mt-1 font-mono text-xs'>
                            {t('import.columns')}
                        </p>
                    </div>

                    <div className='flex items-center justify-between pt-1'>
                        <button
                            type='button'
                            onClick={downloadSample}
                            className='text-brand-accent flex items-center gap-1.5 text-xs font-medium hover:underline'
                        >
                            <Download1 className='size-3.5' />
                            {t('import.sample')}
                        </button>
                        <Button appearance='outline' onPress={onClose}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='space-y-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                        <p className='text-text-primary text-sm font-medium'>
                            {failures.length > 0
                                ? t('import.fixAndRetry')
                                : t('import.ready', {
                                      count: readyRows.length,
                                      total: rows.length,
                                  })}
                        </p>
                        <p className='text-text-tertiary text-xs'>{fileName}</p>
                    </div>

                    {branches.length > 1 && (
                        <SelectInput
                            label={t('groups.branch')}
                            required
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            value={branchId}
                            onValueChange={setBranchChoice}
                        />
                    )}

                    <div className='border-card-border max-h-72 scrollbar-thin overflow-auto rounded-xl border'>
                        <table className='w-full text-left text-sm'>
                            <thead className='bg-background-gray-secondary border-card-border border-b text-xs font-semibold'>
                                <tr>
                                    <th className='p-2.5'>#</th>
                                    <th className='p-2.5'>
                                        {t('common.fullName')}
                                    </th>
                                    <th className='p-2.5'>
                                        {t('common.phone')}
                                    </th>
                                    <th className='p-2.5'>
                                        {t('import.check')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-card-border divide-y'>
                                {rows.map((row) => {
                                    const problem = problemText(row);

                                    return (
                                        <tr key={row.line}>
                                            <td className='text-text-tertiary p-2.5 text-xs tabular-nums'>
                                                {row.line}
                                            </td>
                                            <td className='text-text-primary p-2.5 font-medium'>
                                                {`${row.last_name} ${row.first_name}`.trim() ||
                                                    '—'}
                                            </td>
                                            <td className='text-text-secondary p-2.5 text-xs tabular-nums'>
                                                {row.phone_number &&
                                                    formatPhone(
                                                        row.phone_number,
                                                    )}
                                                {row.parent_phone && (
                                                    <span className='text-text-tertiary block'>
                                                        {formatPhone(
                                                            row.parent_phone,
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={cn(
                                                    'p-2.5 text-xs',
                                                    problem
                                                        ? TONE_TEXT.error
                                                        : TONE_TEXT.success,
                                                )}
                                            >
                                                {problem ?? t('import.ok')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center'>
                        <Button
                            appearance='outline'
                            className='w-full sm:w-auto'
                            onPress={handleReset}
                            isDisabled={submitting}
                        >
                            {t('import.otherFile')}
                        </Button>
                        <Button
                            variant='primary'
                            appearance='fill'
                            className='w-full sm:w-auto'
                            onPress={handleImport}
                            isDisabled={
                                submitting ||
                                !branchId ||
                                readyRows.length === 0 ||
                                failures.length > 0
                            }
                        >
                            {submitting
                                ? t('import.importing')
                                : t('import.submit', {
                                      count: readyRows.length,
                                  })}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
