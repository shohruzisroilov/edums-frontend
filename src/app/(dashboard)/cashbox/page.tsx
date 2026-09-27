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
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PaymentModal } from '@/components/ui/payment-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { PaymentMethodBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
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
import { Download1, Plus, Trash1, Wallet2 } from '@tailgrids/icons';
import { EyeLinkButton } from '@/components/ui/eye-icon';
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

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteStudentPayment(id),
        onSuccess: () => {
            for (const key of [
                'student-payments',
                'student-balance',
                'debtors',
                'dashboard',
            ]) {
                queryClient.invalidateQueries({ queryKey: [key] });
            }
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
                                        'Kassa_Tushumlari',
                                        [
                                            'Sana',
                                            "O'quvchi",
                                            'Guruh',
                                            'Summa (som)',
                                            "To'lov turi",
                                            'Qabul qildi',
                                        ],
                                        query.data.data.map((p) => [
                                            formatDate(p.paid_at),
                                            fullName(p.student),
                                            p.group.name,
                                            p.amount,
                                            p.method,
                                            p.received_by ? fullName(p.received_by) : '',
                                        ]),
                                    );
                                }}
                            >
                                <Download1 />
                                Eksport (Excel)
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

            <div className='flex flex-wrap items-center gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('cashbox.search')}
                />
                <div className='w-full sm:w-40'>
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
                    onDateChange={({ from, to }) => {
                        setFilter('from', from);
                        setFilter('to', to);
                    }}
                />
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
                                Boolean(search || filters.method || filters.from || filters.to) ? (
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
                                        Filtrni tozalash
                                    </Button>
                                ) : canCreate ? (
                                    <Button
                                        variant='primary'
                                        appearance='fill'
                                        size='md'
                                        onPress={() => setCreating(true)}
                                    >
                                        <Plus />
                                        Birinchi to'lovni qabul qilish
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
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
                                    {query.data.data.map((payment, index) => (
                                        <TableRow key={payment.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell>
                                                {formatDate(payment.paid_at)}
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
                                                    fullName(payment.student)
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
                                    ))}
                                </TableBody>
                            </TableRoot>

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
