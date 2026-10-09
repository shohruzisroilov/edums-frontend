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
import { PhoneLink } from '@/components/ui/phone-link';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listDebtors } from '@/services/api/student-payments';
import type { Debtor } from '@/types/api';
import { can } from '@/utils/access';
import { exportToExcel } from '@/utils/export';
import { formatPhone, fullName } from '@/utils/format';
import { Download1, SackDollar } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';

export default function DebtorsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'payments.view')}>
            <DebtorsView />
        </AccessGuard>
    );
}

function DebtorsView() {
    const t = useT();
    const toastError = useApiErrorToast();
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
    const [exporting, setExporting] = useState(false);

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
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = branchesQuery.data ?? [];
    const som = t('common.som');

    const activeCount = filters.branch_id ? 1 : 0;

    const allDebtors = query.data?.data ?? [];

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            let items = query.data?.data ?? [];
            const total = query.data?.count ?? 0;
            if (total > items.length) {
                const res = await listDebtors({
                    search: search || undefined,
                    branch_id: filters.branch_id || undefined,
                    limit: Math.min(total, 200),
                    offset: 0,
                });
                items = res.data;
            }
            if (!items.length) return;
            await exportToExcel(
                t('debtors.title'),
                'Debtors',
                [
                    t('common.student'),
                    t('common.phone'),
                    t('common.group'),
                    `${t('balance.charged')} (${som})`,
                    `${t('balance.paid')} (${som})`,
                    `${t('debtors.debt')} (${som})`,
                ],
                items.map((d) => [
                    fullName(d.student),
                    formatPhone(
                        d.student.phone_number || d.student.parent_phone,
                    ),
                    d.group.name,
                    d.charged,
                    d.paid,
                    d.debt,
                ]),
            );
        } catch (err) {
            toastError(err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <PageHeader
                title={t('debtors.title')}
                count={query.data?.count}
                description={t('debtors.subtitle')}
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {allDebtors.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                isPending={exporting}
                                onPress={() => void handleExportExcel()}
                            >
                                <Download1 />
                                {/* Telefonda faqat ikonka — asosiy amal bir qatorda qolsin. */}
                                <span className='sr-only sm:not-sr-only'>
                                    {t('common.export')}
                                </span>
                            </Button>
                        )}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-5'>
                <div className='min-w-0 flex-1 sm:min-w-[200px]'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('students.search')}
                    />
                </div>

                {branches.length > 1 && (
                    <>
                        <MobileFilterSheet
                            activeCount={activeCount}
                            onClear={() => setFilter('branch_id', '')}
                        >
                            <SelectInput
                                label={t('groups.allBranches')}
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
                        </MobileFilterSheet>

                        <div className='hidden w-48 shrink-0 sm:block'>
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
                    </>
                )}

                {query.data && query.data.total_debt > 0 && (
                    <p className='text-badge-error-text ml-auto text-xs font-semibold tabular-nums sm:text-sm'>
                        {t('debtors.total', {
                            amount: formatPrice(query.data.total_debt, som),
                        })}
                    </p>
                )}
            </div>

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={7} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : allDebtors.length === 0 ? (
                        <EmptyState
                            message={t('debtors.empty')}
                            icon={<SackDollar className='size-5' />}
                            action={
                                Boolean(search || filters.branch_id) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('branch_id', '');
                                        }}
                                    >
                                        {t('filters.reset')}
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {allDebtors.map((debtor, index) => {
                                    const key = `${debtor.student.id}:${debtor.group.id}`;

                                    return (
                                        <div
                                            key={key}
                                            className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                        >
                                            <div className='flex items-start justify-between gap-3'>
                                                <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                                                    <div className='min-w-0'>
                                                        <div className='flex items-start gap-2'>
                                                            <span className='text-text-tertiary mt-0.5 shrink-0 text-xs font-semibold tabular-nums'>
                                                                #
                                                                {offset +
                                                                    index +
                                                                    1}
                                                            </span>
                                                            {canOpenStudents ? (
                                                                <Link
                                                                    href={`/students/${debtor.student.id}`}
                                                                    className='text-text-primary hover:text-brand-accent text-sm font-semibold break-words hover:underline'
                                                                >
                                                                    {fullName(
                                                                        debtor.student,
                                                                    )}
                                                                </Link>
                                                            ) : (
                                                                <span className='text-text-primary text-sm font-semibold break-words'>
                                                                    {fullName(
                                                                        debtor.student,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className='text-text-tertiary mt-0.5 text-xs break-words'>
                                                            {debtor.group.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='text-right'>
                                                    <span className='text-badge-error-text block text-sm font-bold tabular-nums'>
                                                        -
                                                        {formatPrice(
                                                            debtor.debt,
                                                            som,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='flex items-center justify-between pt-1 text-xs'>
                                                <div>
                                                    <span className='text-text-tertiary block text-xs'>
                                                        {t('common.phone')}
                                                    </span>
                                                    <PhoneLink
                                                        phone={
                                                            debtor.student
                                                                .phone_number ??
                                                            debtor.student
                                                                .parent_phone
                                                        }
                                                    />
                                                </div>

                                                <div className='text-right'>
                                                    <span className='text-text-tertiary block text-xs'>
                                                        {t('balance.paid')} /{' '}
                                                        {t('balance.charged')}
                                                    </span>
                                                    <span className='text-text-secondary text-xs tabular-nums'>
                                                        {formatPrice(
                                                            debtor.paid,
                                                            som,
                                                        )}{' '}
                                                        /{' '}
                                                        {formatPrice(
                                                            debtor.charged,
                                                            som,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {canPay && (
                                                <div className='border-card-border/60 flex justify-end border-t pt-2'>
                                                    <Button
                                                        variant='primary'
                                                        appearance='outline'
                                                        size='sm'
                                                        className='w-full justify-center sm:w-auto'
                                                        onPress={() =>
                                                            setPaying(debtor)
                                                        }
                                                    >
                                                        {t(
                                                            'debtors.takePayment',
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
                                        {allDebtors.map((debtor, index) => {
                                            const key = `${debtor.student.id}:${debtor.group.id}`;

                                            return (
                                                <TableRow key={key}>
                                                    <RowNumberCell
                                                        index={index}
                                                        offset={offset}
                                                    />
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
                                                            fullName(
                                                                debtor.student,
                                                            )
                                                        )}
                                                        <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                            {debtor.group.name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className='tabular-nums'>
                                                        <PhoneLink
                                                            phone={
                                                                debtor.student
                                                                    .phone_number ??
                                                                debtor.student
                                                                    .parent_phone
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell numeric>
                                                        {formatPrice(
                                                            debtor.charged,
                                                            som,
                                                        )}
                                                    </TableCell>
                                                    <TableCell numeric>
                                                        {formatPrice(
                                                            debtor.paid,
                                                            som,
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        numeric
                                                        className='text-badge-error-text font-semibold'
                                                    >
                                                        {formatPrice(
                                                            debtor.debt,
                                                            som,
                                                        )}
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
                                            );
                                        })}
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
