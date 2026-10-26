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
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DetailSection } from '@/components/ui/detail';
import { ReceiptModal } from '@/components/ui/receipt-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { PaymentMethodBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import {
    getStudentBalance,
    listStudentPayments,
} from '@/services/api/student-payments';
import type { PersonRef, StudentPayment } from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { balanceTone, TONE_TEXT } from '@/utils/tone';
import { Printer } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

/** Manfiy balans — qarz (qizil), musbat — oldindan to'langan. */
function balanceClass(balance: number) {
    return cn('font-semibold', balanceTone(balance));
}

/**
 * O'quvchi sahifasida: guruhlar bo'yicha balans va to'lovlar tarixi.
 * "To'lov qabul qilish" tugmasi sahifa sarlavhasida — kassir uni pastga
 * aylantirmasdan ko'radi.
 */
export function FinanceSection({ student }: { student: PersonRef }) {
    const t = useT();
    const { formatDate, formatPrice } = useFormat();
    const som = t('common.som');
    const [viewingReceipt, setViewingReceipt] = useState<StudentPayment | null>(
        null,
    );

    const balanceQuery = useQuery({
        queryKey: ['student-balance', student.id],
        queryFn: () => getStudentBalance(student.id),
    });
    const paymentsQuery = useQuery({
        queryKey: ['student-payments', { student_id: student.id, limit: 50 }],
        queryFn: () =>
            listStudentPayments({ student_id: student.id, limit: 50 }),
    });

    return (
        <>
            <DetailSection id='finance' title={t('balance.title')}>
                {balanceQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : balanceQuery.error ? (
                    <ErrorState error={balanceQuery.error} />
                ) : balanceQuery.data.groups.length === 0 ? (
                    <EmptyState message={t('balance.empty')} />
                ) : (
                    <>
                        {/* Mobil kartalar (< md) */}
                        <div className='divide-card-border divide-y md:hidden'>
                            {balanceQuery.data.groups.map((item, index) => (
                                <div
                                    key={item.group.id}
                                    className='hover:bg-background-gray-primary/20 flex flex-col gap-2.5 p-4 transition-colors'
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-text-tertiary shrink-0 text-xs font-semibold tabular-nums'>
                                                    #{index + 1}
                                                </span>
                                                <span className='text-text-primary text-sm font-semibold break-words'>
                                                    {item.group.name}
                                                </span>
                                            </div>
                                            {item.monthly_price !== null && (
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                    {t('students.monthlyPrice')}
                                                    :{' '}
                                                    {item.monthly_price === 0
                                                        ? `🎁 ${t('students.grantBadge')}`
                                                        : formatPrice(
                                                              item.monthly_price,
                                                              som,
                                                          )}
                                                </p>
                                            )}
                                        </div>
                                        <div className='text-right'>
                                            <span className='text-text-tertiary block text-[11px] tracking-wider uppercase'>
                                                {t('balance.balance')}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-sm font-bold tabular-nums',
                                                    balanceClass(item.balance),
                                                )}
                                            >
                                                {formatPrice(item.balance, som)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='border-card-border/60 bg-background-gray-primary/30 grid grid-cols-2 gap-2 rounded-lg p-2.5 text-xs'>
                                        <div>
                                            <span className='text-text-tertiary block text-[11px]'>
                                                {t('balance.charged')}
                                            </span>
                                            <span className='text-text-primary font-medium tabular-nums'>
                                                {formatPrice(item.charged, som)}
                                            </span>
                                        </div>
                                        <div className='text-right'>
                                            <span className='text-text-tertiary block text-[11px]'>
                                                {t('balance.paid')}
                                            </span>
                                            <span className='text-text-primary font-medium tabular-nums'>
                                                {formatPrice(item.paid, som)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {balanceQuery.data.groups.length > 1 && (
                                <div className='bg-background-gray-primary/40 flex items-center justify-between p-4 text-xs font-semibold'>
                                    <div>
                                        <span className='text-text-primary text-sm font-bold'>
                                            {t('common.total')}
                                        </span>
                                        <div className='text-text-tertiary mt-0.5 flex flex-wrap gap-x-3 text-xs font-normal'>
                                            <span>
                                                {t('balance.charged')}:{' '}
                                                {formatPrice(
                                                    balanceQuery.data.charged,
                                                    som,
                                                )}
                                            </span>
                                            <span>
                                                {t('balance.paid')}:{' '}
                                                {formatPrice(
                                                    balanceQuery.data.paid,
                                                    som,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <span className='text-text-tertiary block text-[11px] tracking-wider uppercase'>
                                            {t('balance.balance')}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-sm font-bold tabular-nums',
                                                balanceClass(
                                                    balanceQuery.data.balance,
                                                ),
                                            )}
                                        >
                                            {formatPrice(
                                                balanceQuery.data.balance,
                                                som,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop jadval (md+) */}
                        <div className='hidden md:block'>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
                                        <TableHead>
                                            {t('common.group')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('balance.charged')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('balance.paid')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('balance.balance')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {balanceQuery.data.groups.map(
                                        (item, index) => (
                                            <TableRow key={item.group.id}>
                                                <RowNumberCell index={index} />
                                                <TableCell primary>
                                                    {item.group.name}
                                                    {item.monthly_price !==
                                                        null && (
                                                        <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                            {t(
                                                                'students.monthlyPrice',
                                                            )}
                                                            :{' '}
                                                            {item.monthly_price ===
                                                            0
                                                                ? `🎁 ${t('students.grantBadge')}`
                                                                : formatPrice(
                                                                      item.monthly_price,
                                                                      som,
                                                                  )}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell numeric>
                                                    {formatPrice(
                                                        item.charged,
                                                        som,
                                                    )}
                                                </TableCell>
                                                <TableCell numeric>
                                                    {formatPrice(
                                                        item.paid,
                                                        som,
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    numeric
                                                    className={balanceClass(
                                                        item.balance,
                                                    )}
                                                >
                                                    {formatPrice(
                                                        item.balance,
                                                        som,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                    {balanceQuery.data.groups.length > 1 && (
                                        <TableRow>
                                            <TableCell />
                                            <TableCell primary>
                                                {t('common.total')}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    balanceQuery.data.charged,
                                                    som,
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    balanceQuery.data.paid,
                                                    som,
                                                )}
                                            </TableCell>
                                            <TableCell
                                                numeric
                                                className={balanceClass(
                                                    balanceQuery.data.balance,
                                                )}
                                            >
                                                {formatPrice(
                                                    balanceQuery.data.balance,
                                                    som,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </TableRoot>
                        </div>
                    </>
                )}
            </DetailSection>

            <DetailSection title={t('balance.payments')}>
                {paymentsQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : paymentsQuery.error ? (
                    <ErrorState error={paymentsQuery.error} />
                ) : paymentsQuery.data.data.length === 0 ? (
                    <EmptyState message={t('cashbox.empty')} />
                ) : (
                    <>
                        {/* Mobil kartalar (< md) */}
                        <div className='divide-card-border divide-y md:hidden'>
                            {paymentsQuery.data.data.map((payment, index) => (
                                <div
                                    key={payment.id}
                                    className='hover:bg-background-gray-primary/20 flex flex-col gap-2.5 p-4 transition-colors'
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-text-tertiary shrink-0 text-xs font-semibold tabular-nums'>
                                                    #{index + 1}
                                                </span>
                                                <span className='text-text-primary text-sm font-semibold break-words'>
                                                    {payment.group.name}
                                                </span>
                                            </div>
                                            {payment.note && (
                                                <p className='text-text-tertiary mt-0.5 text-xs break-words'>
                                                    {payment.note}
                                                </p>
                                            )}
                                        </div>
                                        <div className='text-right'>
                                            <span
                                                className={cn(
                                                    TONE_TEXT.success,
                                                    'text-sm font-bold tabular-nums',
                                                )}
                                            >
                                                +
                                                {formatPrice(
                                                    payment.amount,
                                                    som,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between pt-1 text-xs'>
                                        <div className='flex items-center gap-2'>
                                            <PaymentMethodBadge
                                                method={payment.method}
                                            />
                                            <span className='text-text-tertiary tabular-nums'>
                                                {formatDate(payment.paid_at)}
                                            </span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            {payment.received_by && (
                                                <span className='text-text-tertiary max-w-[120px] truncate text-[11px] sm:max-w-none'>
                                                    {fullName(
                                                        payment.received_by,
                                                    )}
                                                </span>
                                            )}
                                            <Button
                                                appearance='outline'
                                                size='sm'
                                                iconOnly
                                                aria-label={t('receipt.title')}
                                                onPress={() =>
                                                    setViewingReceipt(payment)
                                                }
                                            >
                                                <Printer className='size-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop jadval (md+) */}
                        <div className='hidden md:block'>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
                                        <TableHead>
                                            {t('cashbox.paidAt')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.group')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('cashbox.amount')}
                                        </TableHead>
                                        <TableHead>
                                            {t('cashbox.method')}
                                        </TableHead>
                                        <TableHead>
                                            {t('cashbox.receivedBy')}
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentsQuery.data.data.map(
                                        (payment, index) => (
                                            <TableRow key={payment.id}>
                                                <RowNumberCell index={index} />
                                                <TableCell>
                                                    {formatDate(
                                                        payment.paid_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className='whitespace-normal'>
                                                    {payment.group.name}
                                                    {payment.note && (
                                                        <p className='text-text-tertiary text-xs'>
                                                            {payment.note}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell numeric>
                                                    {formatPrice(
                                                        payment.amount,
                                                        som,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <PaymentMethodBadge
                                                        method={payment.method}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {payment.received_by
                                                        ? fullName(
                                                              payment.received_by,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center justify-end'>
                                                        <Button
                                                            appearance='outline'
                                                            size='sm'
                                                            iconOnly
                                                            aria-label={t(
                                                                'receipt.title',
                                                            )}
                                                            onPress={() =>
                                                                setViewingReceipt(
                                                                    payment,
                                                                )
                                                            }
                                                        >
                                                            <Printer className='size-3.5' />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </TableRoot>
                        </div>
                    </>
                )}
            </DetailSection>

            {viewingReceipt && (
                <ReceiptModal
                    open
                    onClose={() => setViewingReceipt(null)}
                    receiptData={{
                        studentName: fullName(student),
                        groupName: viewingReceipt.group.name,
                        amount: viewingReceipt.amount,
                        method: t(`paymentMethod.${viewingReceipt.method}`),
                        date: viewingReceipt.paid_at,
                        receivedBy: viewingReceipt.received_by
                            ? fullName(viewingReceipt.received_by)
                            : undefined,
                    }}
                />
            )}
        </>
    );
}
