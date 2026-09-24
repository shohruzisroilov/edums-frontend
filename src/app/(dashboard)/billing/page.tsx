'use client';

import { Badge } from '@/components/tailgrids/core/badge';
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
import { PageHeader } from '@/components/ui/page-header';
import { PaymentStatusBadge } from '@/components/ui/status-badge';
import { TariffCard } from '@/components/ui/tariff-card';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getMe, sessionFromAuthUser } from '@/services/api/auth';
import {
    cancelPaymentRequest,
    createPaymentRequest,
    getBillingOverview,
} from '@/services/api/billing';
import type { SubscriptionStatus } from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export default function BillingPage() {
    const { session } = useSession();
    const t = useT();

    // Tarif tanlash — billing.manage ruxsati borlar ishi (odatda owner).
    // Qolganlar obuna tugaganda shu yerga tushadi va nima qilishni biladi.
    if (!can(session, 'billing.manage')) {
        return (
            <>
                <PageHeader title={t('billing.title')} />
                <div className='px-5'>
                    <div className='border-card-border bg-card-background rounded-xl border p-6 text-sm'>
                        <p className='text-text-primary font-medium'>
                            {session?.subscription?.active
                                ? t('billing.noPermission')
                                : t('billing.expiredAskOwner')}
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return <BillingView />;
}

function BillingView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate, formatPrice } = useFormat();
    const { session, signIn } = useSession();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['billing'],
        queryFn: getBillingOverview,
    });

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ['billing'] });
        // Banner va bloklash sessiyadagi obunaga qaraydi — uni ham yangilaymiz.
        if (session) signIn(sessionFromAuthUser(session.token, await getMe()));
    };

    const requestMutation = useMutation({
        mutationFn: (tariffId: string) => createPaymentRequest(tariffId),
        onSuccess: async () => {
            toast.success(t('billing.requestSent'));
            await refresh();
        },
        onError: (error) => toastError(error),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelPaymentRequest(id),
        onSuccess: async () => {
            toast.success(t('billing.requestCancelled'));
            await refresh();
        },
        onError: (error) => toastError(error),
    });

    if (query.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (query.error) return <ErrorState error={query.error} />;

    const { subscription, tariffs, requests, history, payment_instructions } =
        query.data;
    const pending = requests.find((item) => item.status === 'pending');

    return (
        <>
            <PageHeader
                title={t('billing.title')}
                description={t('billing.subtitle')}
            />

            <div className='flex flex-col gap-8 px-5'>
                <StatusCard subscription={subscription} />

                {pending && (
                    <section className='rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30'>
                        <div className='flex flex-wrap items-start justify-between gap-4'>
                            <div>
                                <p className='text-text-primary font-semibold'>
                                    {t('billing.pendingTitle', {
                                        name: pending.tariff_name,
                                    })}
                                </p>
                                <p className='text-text-secondary mt-1 text-sm'>
                                    {t('billing.pendingAmount', {
                                        amount: formatPrice(
                                            pending.price,
                                            t('common.som'),
                                        ),
                                    })}
                                </p>
                            </div>
                            <Button
                                appearance='outline'
                                size='md'
                                isDisabled={cancelMutation.isPending}
                                onPress={() =>
                                    cancelMutation.mutate(pending.id)
                                }
                            >
                                {t('billing.cancelRequest')}
                            </Button>
                        </div>
                        {payment_instructions && (
                            <div className='border-card-border bg-card-background mt-4 rounded-lg border p-4'>
                                <p className='text-text-tertiary text-xs font-medium tracking-wide uppercase'>
                                    {t('billing.howToPay')}
                                </p>
                                <p className='text-text-primary mt-1.5 text-sm whitespace-pre-line'>
                                    {payment_instructions}
                                </p>
                            </div>
                        )}
                        <p className='text-text-tertiary mt-3 text-xs'>
                            {t('billing.pendingHint')}
                        </p>
                    </section>
                )}

                <section>
                    <h2 className='text-text-primary font-display mb-4 text-base font-semibold'>
                        {t('billing.tariffs')}
                    </h2>
                    {tariffs.length === 0 ? (
                        <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                            <EmptyState message={t('billing.noTariffs')} />
                        </div>
                    ) : (
                        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                            {tariffs.map((tariff) => (
                                <TariffCard
                                    key={tariff.id}
                                    tariff={tariff}
                                    action={
                                        pending?.tariff_id === tariff.id ? (
                                            <Button
                                                appearance='outline'
                                                size='md'
                                                className='w-full'
                                                isDisabled
                                            >
                                                {t('billing.requested')}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant='primary'
                                                appearance='fill'
                                                size='md'
                                                className='w-full'
                                                isDisabled={
                                                    requestMutation.isPending
                                                }
                                                onPress={() =>
                                                    requestMutation.mutate(
                                                        tariff.id,
                                                    )
                                                }
                                            >
                                                {t('billing.choose')}
                                            </Button>
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                    <p className='text-text-tertiary mt-3 text-xs'>
                        {t('billing.stackHint')}
                    </p>
                </section>

                <section>
                    <h2 className='text-text-primary font-display mb-4 text-base font-semibold'>
                        {t('billing.requests')}
                    </h2>
                    <Panel>
                        {requests.length === 0 ? (
                            <EmptyState message={t('billing.noRequests')} />
                        ) : (
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell primary>
                                                {item.tariff_name}
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
                                                    <span className='text-text-tertiary ml-2 text-xs'>
                                                        {item.note}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(item.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableRoot>
                        )}
                    </Panel>
                </section>

                <section>
                    <h2 className='text-text-primary font-display mb-4 text-base font-semibold'>
                        {t('billing.history')}
                    </h2>
                    <Panel>
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('billing.tariff')}</TableHead>
                                    <TableHead>{t('billing.period')}</TableHead>
                                    <TableHead numeric>
                                        {t('tariffs.price')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell primary>
                                            {item.kind === 'trial'
                                                ? t('billing.trial')
                                                : item.tariff_name}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(item.starts_at)} —{' '}
                                            {formatDate(item.ends_at)}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(
                                                item.price,
                                                t('common.som'),
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>
                    </Panel>
                </section>
            </div>
        </>
    );
}

function StatusCard({ subscription }: { subscription: SubscriptionStatus }) {
    const t = useT();
    const { formatDate } = useFormat();

    const title = !subscription.active
        ? t('billing.statusExpired')
        : subscription.kind === 'trial'
          ? t('billing.statusTrial')
          : t('billing.statusPaid', { name: subscription.tariff_name ?? '' });

    return (
        <section
            className={cn(
                'rounded-xl border p-5',
                subscription.active
                    ? 'border-card-border bg-card-background'
                    : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40',
            )}
        >
            <div className='flex flex-wrap items-center gap-3'>
                <h2 className='text-text-primary font-display text-lg font-semibold'>
                    {title}
                </h2>
                <Badge
                    size='sm'
                    color={subscription.active ? 'success' : 'error'}
                >
                    {subscription.active
                        ? t('common.active')
                        : t('billing.expired')}
                </Badge>
            </div>
            <p className='text-text-secondary mt-2 text-sm'>
                {subscription.active
                    ? t('billing.activeUntil', {
                          date: formatDate(subscription.ends_at),
                          days: subscription.days_left,
                      })
                    : t('billing.expiredHint')}
            </p>
        </section>
    );
}

function Panel({ children }: { children: ReactNode }) {
    return (
        <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
            {children}
        </div>
    );
}
