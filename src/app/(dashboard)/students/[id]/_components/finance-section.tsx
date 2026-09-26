'use client';

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
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { PaymentMethodBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import {
    getStudentBalance,
    listStudentPayments,
} from '@/services/api/student-payments';
import type { PersonRef } from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { balanceTone } from '@/utils/tone';
import { useQuery } from '@tanstack/react-query';

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
            <DetailSection
                id='finance'
                title={t('balance.title')}
                description={t('debtors.subtitle')}
            >
                {balanceQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : balanceQuery.error ? (
                    <ErrorState error={balanceQuery.error} />
                ) : balanceQuery.data.groups.length === 0 ? (
                    <EmptyState message={t('balance.empty')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <RowNumberHead />
                                <TableHead>{t('common.group')}</TableHead>
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
                            {balanceQuery.data.groups.map((item, index) => (
                                <TableRow key={item.group.id}>
                                    <RowNumberCell index={index} />
                                    <TableCell primary>
                                        {item.group.name}
                                        {item.monthly_price !== null && (
                                            <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                {t('students.monthlyPrice')}:{' '}
                                                {formatPrice(
                                                    item.monthly_price,
                                                    som,
                                                )}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(item.charged, som)}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(item.paid, som)}
                                    </TableCell>
                                    <TableCell
                                        numeric
                                        className={balanceClass(item.balance)}
                                    >
                                        {formatPrice(item.balance, som)}
                                    </TableCell>
                                </TableRow>
                            ))}
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
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <RowNumberHead />
                                <TableHead>{t('cashbox.paidAt')}</TableHead>
                                <TableHead>{t('common.group')}</TableHead>
                                <TableHead numeric>
                                    {t('cashbox.amount')}
                                </TableHead>
                                <TableHead>{t('cashbox.method')}</TableHead>
                                <TableHead>{t('cashbox.receivedBy')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsQuery.data.data.map((payment, index) => (
                                <TableRow key={payment.id}>
                                    <RowNumberCell index={index} />
                                    <TableCell>
                                        {formatDate(payment.paid_at)}
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
                                        {formatPrice(payment.amount, som)}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentMethodBadge
                                            method={payment.method}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {payment.received_by
                                            ? fullName(payment.received_by)
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </DetailSection>
        </>
    );
}
