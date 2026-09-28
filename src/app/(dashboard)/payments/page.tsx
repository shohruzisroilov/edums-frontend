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
import { TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { PaymentStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT } from '@/i18n/provider';
import {
    approvePaymentRequest,
    listPaymentRequests,
    rejectPaymentRequest,
} from '@/services/api/billing';
import type { PaymentRequest, PaymentRequestStatus } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { cn } from '@/utils/cn';
import { Wallet2 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function PaymentsPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <PaymentsView />
        </AccessGuard>
    );
}

function PaymentsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDateTime, formatPrice } = useFormat();
    const queryClient = useQueryClient();

    // Kutilayotganlar birinchi ko'rinadi — super adminning asosiy ishi shu.
    const { filters, setFilter, limit, setLimit, offset, setOffset } =
        useListQuery({ status: 'pending' });

    const [approving, setApproving] = useState<PaymentRequest | null>(null);
    const [rejecting, setRejecting] = useState<PaymentRequest | null>(null);

    const query = useQuery({
        queryKey: ['payment-requests', { ...filters, limit, offset }],
        queryFn: () =>
            listPaymentRequests({
                status: (filters.status || undefined) as
                    | PaymentRequestStatus
                    | undefined,
                limit,
                offset,
            }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => approvePaymentRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            toast.success(t('payments.approved'));
            setApproving(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('payments.title')}
                count={query.data?.count}
                description={t('payments.subtitle')}
            />

            <div className='px-5 pb-4'>
                <div className='border-card-border bg-background-gray-secondary/50 inline-flex flex-wrap items-center gap-1 rounded-xl border p-1'>
                    {[
                        { value: 'pending', label: t('paymentStatus.pending') },
                        {
                            value: 'approved',
                            label: t('paymentStatus.approved'),
                        },
                        {
                            value: 'rejected',
                            label: t('paymentStatus.rejected'),
                        },
                        {
                            value: 'cancelled',
                            label: t('paymentStatus.cancelled'),
                        },
                        { value: '', label: t('common.allStatuses') },
                    ].map((tab) => {
                        const isActive = (filters.status || '') === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type='button'
                                onClick={() => setFilter('status', tab.value)}
                                className={cn(
                                    'cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all',
                                    isActive
                                        ? 'bg-card-background text-text-primary font-semibold shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary hover:bg-card-background/50',
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
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
                            message={t('payments.empty')}
                            icon={<Wallet2 className='size-5' />}
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
                                            {t('payments.education')}
                                        </TableHead>
                                        <TableHead>
                                            {t('billing.tariff')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('tariffs.price')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.createdAt')}
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell>
                                                <Link
                                                    href={`/educations/${item.education_id}`}
                                                    className='text-brand-accent font-medium hover:underline'
                                                >
                                                    {item.education?.name ??
                                                        '—'}
                                                </Link>
                                                <span className='text-text-tertiary block text-xs'>
                                                    {item.education
                                                        ?.phone_number ?? ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.tariff_name}
                                                <span className='text-text-tertiary block text-xs'>
                                                    {t(
                                                        'tariffs.durationValue',
                                                        {
                                                            days: item.duration_days,
                                                        },
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    item.price,
                                                    t('common.som'),
                                                )}
                                            </TableCell>
                                            <TableCell className='whitespace-normal'>
                                                <PaymentStatusBadge
                                                    status={item.status}
                                                />
                                                {item.note && (
                                                    <span className='text-text-tertiary block text-xs'>
                                                        {item.note}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    item.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.status === 'pending' && (
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            variant='primary'
                                                            appearance='fill'
                                                            size='md'
                                                            onPress={() =>
                                                                setApproving(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                'payments.approve',
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant='danger'
                                                            appearance='outline'
                                                            size='md'
                                                            onPress={() =>
                                                                setRejecting(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                'payments.reject',
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
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

            <ConfirmDialog
                open={approving !== null}
                title={t('payments.approveTitle')}
                message={t('payments.approveMessage', {
                    education: approving?.education?.name ?? '',
                    tariff: approving?.tariff_name ?? '',
                    amount: approving
                        ? formatPrice(approving.price, t('common.som'))
                        : '',
                })}
                confirmLabel={t('payments.approve')}
                pending={approveMutation.isPending}
                onCancel={() => setApproving(null)}
                onConfirm={() =>
                    approving && approveMutation.mutate(approving.id)
                }
            />

            {rejecting && (
                <RejectModal
                    request={rejecting}
                    onClose={() => setRejecting(null)}
                />
            )}
        </>
    );
}

function RejectModal({
    request,
    onClose,
}: {
    request: PaymentRequest;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();
    const [note, setNote] = useState('');

    const mutation = useMutation({
        mutationFn: () => rejectPaymentRequest(request.id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
            toast.success(t('payments.rejected'));
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
            title={t('payments.rejectTitle')}
            description={request.education?.name}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('payments.rejectNote')}
                    hint={t('payments.rejectNoteHint')}
                    maxLength={500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
                        variant='danger'
                        appearance='fill'
                        size='md'
                        isDisabled={mutation.isPending}
                    >
                        {t('payments.reject')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
