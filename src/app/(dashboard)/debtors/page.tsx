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
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { PaymentModal } from '@/components/ui/payment-modal';
import { SearchInput } from '@/components/ui/search-input';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listDebtors } from '@/services/api/student-payments';
import type { Debtor } from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { SackDollar } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

export default function DebtorsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'payments.view')}>
            <DebtorsView />
        </AccessGuard>
    );
}

function DebtorsView() {
    const t = useT();
    const { formatPrice } = useFormat();
    const { session } = useSession();

    const canPay = can(session, 'payments.create');
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
    } = useListQuery({ branch_id: '' });

    const [paying, setPaying] = useState<Debtor | null>(null);

    const query = useQuery({
        queryKey: ['debtors', { search, ...filters, limit, offset }],
        queryFn: () =>
            listDebtors({
                search: search || undefined,
                branch_id: filters.branch_id || undefined,
                limit,
                offset,
            }),
    });

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = branchesQuery.data ?? [];
    const som = t('common.som');

    return (
        <>
            <PageHeader
                title={t('debtors.title')}
                count={query.data?.count}
                description={t('debtors.subtitle')}
            />

            <div className='flex flex-wrap items-center gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('students.search')}
                />
                {branches.length > 1 && (
                    <div className='w-full sm:w-48'>
                        <SelectInput
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            placeholder={t('groups.allBranches')}
                            value={filters.branch_id}
                            onValueChange={(next) =>
                                setFilter('branch_id', next)
                            }
                        />
                    </div>
                )}
                {query.data && query.data.total_debt > 0 && (
                    <p className='ml-auto text-sm font-semibold text-red-600 tabular-nums dark:text-red-400'>
                        {t('debtors.total', {
                            amount: formatPrice(query.data.total_debt, som),
                        })}
                    </p>
                )}
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('debtors.empty')}
                            icon={<SackDollar className='size-5' />}
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('common.student')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('balance.charged')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('balance.paid')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('debtors.debt')}
                                        </TableHead>
                                        {canPay && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((debtor) => (
                                        <TableRow
                                            key={`${debtor.student.id}:${debtor.group.id}`}
                                        >
                                            <TableCell primary>
                                                {canOpenStudents ? (
                                                    <Link
                                                        href={`/students/${debtor.student.id}`}
                                                        className='hover:text-brand-accent hover:underline'
                                                    >
                                                        {fullName(
                                                            debtor.student,
                                                        )}
                                                    </Link>
                                                ) : (
                                                    fullName(debtor.student)
                                                )}
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                    {debtor.group.name}
                                                </p>
                                            </TableCell>
                                            <TableCell className='tabular-nums'>
                                                {debtor.student.phone_number ??
                                                    debtor.student
                                                        .parent_phone ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    debtor.charged,
                                                    som,
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(debtor.paid, som)}
                                            </TableCell>
                                            <TableCell
                                                numeric
                                                className='font-semibold text-red-600 dark:text-red-400'
                                            >
                                                {formatPrice(debtor.debt, som)}
                                            </TableCell>
                                            {canPay && (
                                                <TableCell>
                                                    <div className='flex justify-end'>
                                                        <Button
                                                            variant='primary'
                                                            appearance='outline'
                                                            size='md'
                                                            onPress={() =>
                                                                setPaying(
                                                                    debtor,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                'debtors.takePayment',
                                                            )}
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

            {paying && (
                <PaymentModal
                    student={paying.student}
                    groupId={paying.group.id}
                    amount={paying.debt}
                    onClose={() => setPaying(null)}
                />
            )}
        </>
    );
}
