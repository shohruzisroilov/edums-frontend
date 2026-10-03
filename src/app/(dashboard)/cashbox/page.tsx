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
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PaymentModal } from '@/components/ui/payment-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { PaymentMethodBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    deleteStudentPayment,
    listStudentPayments,
} from '@/services/api/student-payments';
import {
    PAYMENT_METHODS,
    type PaymentMethod,
    type StudentPayment,
} from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { fullName } from '@/utils/format';
import { TONE_TEXT } from '@/utils/tone';
import { exportToCsv } from '@/utils/export';
import { invalidateStudyData } from '@/utils/query-cache';
import { Download1, Plus, Trash1, Wallet2 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CashboxPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'payments.view')}>
            <CashboxView />
        </AccessGuard>
    );
}

function CashboxView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate, formatPrice } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    // O'quvchini qidirish GET /students dan — students.view ham kerak.
    const canCreate =
        can(session, 'payments.create') && can(session, 'students.view');
    const canDelete = can(session, 'payments.delete');
    const canOpenStudents = can(session, 'students.view');

    const {
        search,
        setSearch,
        filters,
        setFilter,
        setFilters,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ method: '', from: '', to: '' });

    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<StudentPayment | null>(null);

    useOpenOnNewParam(() => setCreating(true), canCreate);

    const query = useQuery({
        queryKey: ['student-payments', { search, ...filters, limit, offset }],
        queryFn: () =>
            listStudentPayments({
                search: search || undefined,
                method: (filters.method || undefined) as
                    | PaymentMethod
                    | undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                limit,
                offset,
            }),
    });
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteStudentPayment(id),
        onSuccess: () => {
            invalidateStudyData(queryClient);
            toast.success(t('cashbox.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('cashbox.title')}
                count={query.data?.count}
                description={
                    query.data
                        ? t('cashbox.sum', {
                              amount: formatPrice(
                                  query.data.sum,
                                  t('common.som'),
                              ),
                          })
                        : t('cashbox.subtitle')
                }
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {query.data?.data && query.data.data.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => {
                                    exportToCsv(
                                        t('cashbox.title'),
                                        [
                                            t('receipt.date'),
                                            t('common.student'),
                                            t('common.group'),
                                            `${t('cashbox.amount')} (${t('common.som')})`,
                                            t('cashbox.method'),
                                            t('cashbox.receivedBy'),
                                        ],
                                        query.data.data.map((p) => [
                                            formatDate(p.paid_at),
                                            fullName(p.student),
                                            p.group.name,
                                            p.amount,
                                            t(`paymentMethod.${p.method}`),
                                            p.received_by
                                                ? fullName(p.received_by)
                                                : '',
                                        ]),
                                    );
                                }}
                            >
                                <Download1 />
                                {t('common.export')}
                            </Button>
                        )}
                        {canCreate && (
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setCreating(true)}
                            >
                                <Plus />
                                {t('cashbox.new')}
                            </Button>
                        )}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5 lg:flex-nowrap'>
                <div className='min-w-[220px] flex-1 lg:min-w-40'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('cashbox.search')}
                    />
                </div>

                <MobileFilterSheet
                    activeCount={
                        (filters.method ? 1 : 0) +
                        (filters.from || filters.to ? 1 : 0)
                    }
                    onClear={() => {
                        setFilter('method', '');
                        setFilter('from', '');
                        setFilter('to', '');
                    }}
                >
                    <SelectInput
                        label={t('cashbox.allMethods')}
                        options={PAYMENT_METHODS.map((method) => ({
                            value: method,
                            label: t(`paymentMethod.${method}`),
                        }))}
                        placeholder={t('cashbox.allMethods')}
                        value={filters.method}
                        onValueChange={(next) => setFilter('method', next)}
                    />
                    <div className='mt-1'>
                        <DateRangeFilter
                            from={filters.from}
                            to={filters.to}
                            onDateChange={(range) => setFilters(range)}
                        />
                    </div>
                </MobileFilterSheet>

                <div className='hidden min-w-0 flex-wrap items-center gap-3 sm:flex lg:flex-nowrap'>
                    <div className='w-40 min-w-28 shrink'>
                        <SelectInput
                            options={PAYMENT_METHODS.map((method) => ({
                                value: method,
                                label: t(`paymentMethod.${method}`),
                            }))}
                            placeholder={t('cashbox.allMethods')}
                            value={filters.method}
                            onValueChange={(next) => setFilter('method', next)}
                        />
                    </div>
                    <DateRangeFilter
                        from={filters.from}
                        to={filters.to}
                        onDateChange={(range) => setFilters(range)}
                    />
                </div>
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('cashbox.empty')}
                            icon={<Wallet2 className='size-5' />}
                            action={
                                Boolean(
                                    search ||
                                    filters.method ||
                                    filters.from ||
                                    filters.to,
                                ) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('method', '');
                                            setFilter('from', '');
                                            setFilter('to', '');
                                        }}
                                    >
                                        {t('filters.reset')}
                                    </Button>
                                ) : canCreate ? (
                                    <Button
                                        variant='primary'
                                        appearance='fill'
                                        size='md'
                                        onPress={() => setCreating(true)}
                                    >
                                        <Plus />
                                        {t('cashbox.addFirst')}
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.data.map((payment, index) => (
                                    <div
                                        key={payment.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-2.5 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{offset + index + 1}
                                                    </span>
                                                    {canOpenStudents ? (
                                                        <Link
                                                            href={`/students/${payment.student.id}`}
                                                            className='text-text-primary hover:text-brand-accent truncate text-sm font-semibold hover:underline'
                                                        >
                                                            {fullName(
                                                                payment.student,
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <span className='text-text-primary truncate text-sm font-semibold'>
                                                            {fullName(
                                                                payment.student,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className='text-text-tertiary mt-0.5 text-xs'>
                                                    {payment.group.name}
                                                    {payment.note &&
                                                        ` · ${payment.note}`}
                                                </p>
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
                                                        t('common.som'),
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
                                                    {formatDate(
                                                        payment.paid_at,
                                                    )}
                                                </span>
                                            </div>

                                            {payment.received_by && (
                                                <span className='text-text-tertiary max-w-[140px] truncate text-[11px]'>
                                                    {fullName(
                                                        payment.received_by,
                                                    )}
                                                </span>
                                            )}

                                            {canDelete && (
                                                <Button
                                                    variant='danger'
                                                    appearance='outline'
                                                    size='sm'
                                                    iconOnly
                                                    aria-label={t(
                                                        'common.delete',
                                                    )}
                                                    onPress={() =>
                                                        setDeleting(payment)
                                                    }
                                                >
                                                    <Trash1 className='size-3.5' />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop / Tablet jadval (>= md) */}
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
                                                {t('common.student')}
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
                                            {canDelete && (
                                                <TableHead className='text-right'>
                                                    {t('common.actions')}
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {query.data.data.map(
                                            (payment, index) => (
                                                <TableRow key={payment.id}>
                                                    <RowNumberCell
                                                        index={index}
                                                        offset={offset}
                                                    />
                                                    <TableCell>
                                                        {formatDate(
                                                            payment.paid_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell primary>
                                                        {canOpenStudents ? (
                                                            <Link
                                                                href={`/students/${payment.student.id}`}
                                                                className='hover:text-brand-accent hover:underline'
                                                            >
                                                                {fullName(
                                                                    payment.student,
                                                                )}
                                                            </Link>
                                                        ) : (
                                                            fullName(
                                                                payment.student,
                                                            )
                                                        )}
                                                        <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                            {payment.group.name}
                                                            {payment.note &&
                                                                ` · ${payment.note}`}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell
                                                        numeric
                                                        className={cn(
                                                            TONE_TEXT.success,
                                                            'font-medium',
                                                        )}
                                                    >
                                                        {formatPrice(
                                                            payment.amount,
                                                            t('common.som'),
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <PaymentMethodBadge
                                                            method={
                                                                payment.method
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.received_by
                                                            ? fullName(
                                                                  payment.received_by,
                                                              )
                                                            : '—'}
                                                    </TableCell>
                                                    {canDelete && (
                                                        <TableCell>
                                                            <div className='flex justify-end'>
                                                                <Button
                                                                    variant='danger'
                                                                    appearance='outline'
                                                                    size='md'
                                                                    iconOnly
                                                                    aria-label={t(
                                                                        'common.delete',
                                                                    )}
                                                                    onPress={() =>
                                                                        setDeleting(
                                                                            payment,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash1 />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </TableRoot>
                            </div>

                            <PaginationBar
                                count={query.data.count}
                                limit={limit}
                                offset={offset}
                                onLimitChange={setLimit}
                                onOffsetChange={setOffset}
                            />
                        </>
                    )}
                </div>
            </div>

            {creating && <PaymentModal onClose={() => setCreating(false)} />}

            <ConfirmDialog
                open={deleting !== null}
                title={t('cashbox.deleteTitle')}
                message={t('cashbox.deleteMessage', {
                    amount: deleting
                        ? formatPrice(deleting.amount, t('common.som'))
                        : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
