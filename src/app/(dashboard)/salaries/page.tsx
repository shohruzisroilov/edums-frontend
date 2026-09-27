'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { AccessGuard } from '@/components/ui/access-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DetailSection } from '@/components/ui/detail';
import {
    SelectInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import {
    currentMonth,
    formatMonth,
    MonthSwitcher,
} from '@/components/ui/month-switcher';
import { MoneyInput, NumberInput } from '@/components/ui/number-input';
import { PageHeader } from '@/components/ui/page-header';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useUrlParam } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import {
    cancelSalaryPayout,
    getSalarySheet,
    listSalaryPayouts,
    paySalary,
    removeSalaryRate,
    setSalaryRate,
} from '@/services/api/salaries';
import {
    SALARY_RATE_TYPES,
    type SalaryPayout,
    type SalaryRateType,
    type SalarySheetRow,
} from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { fullName, toISODate } from '@/utils/format';
import { TONE_TEXT } from '@/utils/tone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Qoldiq — xodimga hali to'lanmagan summa: bor bo'lsa to'q sariq, hisoblangani
 * to'liq to'langan bo'lsa yashil.
 */
function payoutTone({
    accrued,
    balance,
}: {
    accrued: number;
    balance: number;
}): string | undefined {
    if (balance > 0) return TONE_TEXT.warning;
    if (accrued > 0) return TONE_TEXT.success;
    return undefined;
}

export default function SalariesPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'salaries.view')}>
            <SalariesView />
        </AccessGuard>
    );
}

function invalidateSalaries(queryClient: ReturnType<typeof useQueryClient>) {
    for (const key of [
        'salary-sheet',
        'salary-payouts',
        'expenses',
        'dashboard',
    ]) {
        queryClient.invalidateQueries({ queryKey: [key] });
    }
}

function SalariesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatPrice, formatNumber, formatDate } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();
    const canManage = can(session, 'salaries.manage');
    const som = t('common.som');

    const [month, setMonth] = useUrlParam('month', currentMonth());
    const [rating, setRating] = useState<SalarySheetRow | null>(null);
    const [paying, setPaying] = useState<SalarySheetRow | null>(null);
    const [cancelling, setCancelling] = useState<SalaryPayout | null>(null);

    const sheetQuery = useQuery({
        queryKey: ['salary-sheet', month],
        queryFn: () => getSalarySheet(month),
    });
    const payoutsQuery = useQuery({
        queryKey: ['salary-payouts', month],
        queryFn: () => listSalaryPayouts(month),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelSalaryPayout(id),
        onSuccess: () => {
            invalidateSalaries(queryClient);
            toast.success(t('salaries.cancelled'));
            setCancelling(null);
        },
        onError: (error) => toastError(error),
    });

    function rateLabel(row: SalarySheetRow): string {
        if (!row.rate) return t('salaries.noRate');
        const type = t(`salaryRateType.${row.rate.type}`);
        const value =
            row.rate.type === 'percent'
                ? `${formatNumber(row.rate.value)}%`
                : formatPrice(row.rate.value, som);
        return `${type} · ${value}`;
    }

    return (
        <>
            <PageHeader
                title={t('salaries.title')}
                description={t('salaries.subtitle')}
                actions={<MonthSwitcher month={month} onChange={setMonth} />}
            />

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {sheetQuery.isPending ? (
                        <TableSkeleton columns={7} />
                    ) : sheetQuery.error ? (
                        <ErrorState error={sheetQuery.error} />
                    ) : sheetQuery.data.rows.length === 0 ? (
                        <EmptyState message={t('salaries.empty')} />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <RowNumberHead />
                                    <TableHead>{t('salaries.staff')}</TableHead>
                                    <TableHead numeric>
                                        {t('salaries.groupsStudents')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('salaries.revenue')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('salaries.accrued')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('salaries.paid')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('salaries.balance')}
                                    </TableHead>
                                    {canManage && (
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sheetQuery.data.rows.map((row, index) => (
                                    <TableRow key={row.user.id}>
                                        <RowNumberCell index={index} />
                                        <TableCell primary>
                                            {fullName(row.user)}
                                            <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                {rateLabel(row)}
                                            </p>
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatNumber(row.groups_count)} /{' '}
                                            {formatNumber(row.students_count)}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(row.revenue, som)}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(row.accrued, som)}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(row.paid, som)}
                                        </TableCell>
                                        <TableCell
                                            numeric
                                            className={cn(
                                                'font-semibold',
                                                payoutTone(row),
                                            )}
                                        >
                                            {formatPrice(row.balance, som)}
                                        </TableCell>
                                        {canManage && (
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        onPress={() =>
                                                            setRating(row)
                                                        }
                                                    >
                                                        {t('salaries.setRate')}
                                                    </Button>
                                                    <Button
                                                        variant='primary'
                                                        appearance='outline'
                                                        size='md'
                                                        onPress={() =>
                                                            setPaying(row)
                                                        }
                                                    >
                                                        {t('salaries.pay')}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell />
                                    <TableCell primary>
                                        {t('common.total')}
                                    </TableCell>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell numeric>
                                        {formatPrice(
                                            sheetQuery.data.totals.accrued,
                                            som,
                                        )}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(
                                            sheetQuery.data.totals.paid,
                                            som,
                                        )}
                                    </TableCell>
                                    <TableCell
                                        numeric
                                        className={cn(
                                            'font-semibold',
                                            payoutTone(sheetQuery.data.totals),
                                        )}
                                    >
                                        {formatPrice(
                                            sheetQuery.data.totals.balance,
                                            som,
                                        )}
                                    </TableCell>
                                    {canManage && <TableCell />}
                                </TableRow>
                            </TableBody>
                        </TableRoot>
                    )}
                </div>
            </div>

            <DetailSection title={t('salaries.payouts')}>
                {payoutsQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : payoutsQuery.error ? (
                    <ErrorState error={payoutsQuery.error} />
                ) : payoutsQuery.data.length === 0 ? (
                    <EmptyState message={t('salaries.noPayouts')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <RowNumberHead />
                                <TableHead>{t('cashbox.paidAt')}</TableHead>
                                <TableHead>{t('salaries.staff')}</TableHead>
                                <TableHead numeric>
                                    {t('cashbox.amount')}
                                </TableHead>
                                <TableHead>{t('cashbox.receivedBy')}</TableHead>
                                {canManage && (
                                    <TableHead className='text-right'>
                                        {t('common.actions')}
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payoutsQuery.data.map((payout, index) => (
                                <TableRow key={payout.id}>
                                    <RowNumberCell index={index} />
                                    <TableCell>
                                        {formatDate(payout.paid_at)}
                                    </TableCell>
                                    <TableCell primary>
                                        {fullName(payout.user)}
                                        {payout.note && (
                                            <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                {payout.note}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(payout.amount, som)}
                                    </TableCell>
                                    <TableCell>
                                        {payout.created_by
                                            ? fullName(payout.created_by)
                                            : '—'}
                                    </TableCell>
                                    {canManage && (
                                        <TableCell>
                                            <div className='flex justify-end'>
                                                <Button
                                                    variant='danger'
                                                    appearance='outline'
                                                    size='md'
                                                    onPress={() =>
                                                        setCancelling(payout)
                                                    }
                                                >
                                                    {t('common.cancel')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </DetailSection>

            {rating && (
                <RateModal row={rating} onClose={() => setRating(null)} />
            )}
            {paying && (
                <PayModal
                    row={paying}
                    month={month}
                    onClose={() => setPaying(null)}
                />
            )}

            <ConfirmDialog
                open={cancelling !== null}
                title={t('salaries.cancelTitle')}
                message={t('salaries.cancelMessage', {
                    name: cancelling ? fullName(cancelling.user) : '',
                    amount: cancelling
                        ? formatPrice(cancelling.amount, som)
                        : '',
                })}
                confirmLabel={t('salaries.cancelTitle')}
                pending={cancelMutation.isPending}
                onCancel={() => setCancelling(null)}
                onConfirm={() =>
                    cancelling && cancelMutation.mutate(cancelling.id)
                }
            />
        </>
    );
}

function RateModal({
    row,
    onClose,
}: {
    row: SalarySheetRow;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [type, setType] = useState<SalaryRateType>(row.rate?.type ?? 'fixed');
    const [value, setValue] = useState(
        row.rate ? String(Math.round(row.rate.value)) : '',
    );

    const saveMutation = useMutation({
        mutationFn: () =>
            setSalaryRate(row.user.id, { type, value: Number(value || 0) }),
        onSuccess: () => {
            invalidateSalaries(queryClient);
            toast.success(t('salaries.rateSaved'));
            onClose();
        },
        onError: (error) => toastError(error),
    });
    const removeMutation = useMutation({
        mutationFn: () => removeSalaryRate(row.user.id),
        onSuccess: () => {
            invalidateSalaries(queryClient);
            toast.success(t('salaries.rateSaved'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        saveMutation.mutate();
    }

    const pending = saveMutation.isPending || removeMutation.isPending;
    const percentTooHigh = type === 'percent' && Number(value) > 100;

    return (
        <Modal
            open
            onClose={onClose}
            title={t('salaries.rateTitle', { name: fullName(row.user) })}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <SelectInput
                    label={t('salaries.rateType')}
                    required
                    options={SALARY_RATE_TYPES.map((item) => ({
                        value: item,
                        label: t(`salaryRateType.${item}`),
                    }))}
                    hint={t(`salaryRateType.${type}Hint`)}
                    value={type}
                    onValueChange={(next) => setType(next as SalaryRateType)}
                />
                {type === 'percent' ? (
                    <NumberInput
                        label={t('salaries.rateValue')}
                        required
                        unit='%'
                        error={percentTooHigh ? '0–100' : undefined}
                        value={value}
                        onValueChange={setValue}
                    />
                ) : (
                    <MoneyInput
                        label={t('salaries.rateValue')}
                        required
                        currency={t('common.som')}
                        value={value}
                        onValueChange={setValue}
                    />
                )}

                <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                    {row.rate ? (
                        <Button
                            variant='danger'
                            appearance='ghost'
                            size='md'
                            onPress={() => removeMutation.mutate()}
                            isDisabled={pending}
                        >
                            {t('salaries.removeRate')}
                        </Button>
                    ) : (
                        <span />
                    )}
                    <div className='flex gap-2'>
                        <Button
                            appearance='outline'
                            size='md'
                            onPress={onClose}
                            isDisabled={pending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type='submit'
                            variant='primary'
                            appearance='fill'
                            size='md'
                            isDisabled={
                                pending || value === '' || percentTooHigh
                            }
                        >
                            {t(
                                saveMutation.isPending
                                    ? 'common.saving'
                                    : 'common.save',
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

function PayModal({
    row,
    month,
    onClose,
}: {
    row: SalarySheetRow;
    month: string;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        amount: row.balance > 0 ? String(Math.round(row.balance)) : '',
        paid_at: toISODate(new Date()),
        note: '',
    });

    const mutation = useMutation({
        mutationFn: () =>
            paySalary({
                user_id: row.user.id,
                month,
                amount: Number(form.amount),
                paid_at: form.paid_at,
                note: form.note.trim() || null,
            }),
        onSuccess: () => {
            invalidateSalaries(queryClient);
            toast.success(t('salaries.paidDone'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t('salaries.payTitle', { name: fullName(row.user) })}
            description={t('salaries.payHint', {
                month: formatMonth(month, t),
            })}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <MoneyInput
                        label={t('cashbox.amount')}
                        required
                        currency={t('common.som')}
                        value={form.amount}
                        onValueChange={(amount) => setForm({ ...form, amount })}
                    />
                    <TextInput
                        label={t('cashbox.paidAt')}
                        type='date'
                        required
                        value={form.paid_at}
                        onChange={(e) =>
                            setForm({ ...form, paid_at: e.target.value })
                        }
                    />
                </div>
                <TextareaInput
                    label={t('common.note')}
                    maxLength={500}
                    rows={2}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
                <div className='mt-2 flex items-center justify-end gap-2'>
                    <Button
                        appearance='outline'
                        size='md'
                        onPress={onClose}
                        isDisabled={mutation.isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={mutation.isPending || !Number(form.amount)}
                    >
                        {t(
                            mutation.isPending
                                ? 'common.saving'
                                : 'salaries.pay',
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
