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
import {
    SelectInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/number-input';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { ExpenseCategoryBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import {
    createExpense,
    deleteExpense,
    listExpenses,
} from '@/services/api/expenses';
import {
    EXPENSE_CATEGORIES,
    MANUAL_EXPENSE_CATEGORIES,
    type Expense,
    type ExpenseCategory,
} from '@/types/api';
import { can } from '@/utils/access';
import { fullName, toISODate } from '@/utils/format';
import { exportToCsv } from '@/utils/export';
import { Download1, Plus, SackDollar, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function ExpensesPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'expenses.view')}>
            <ExpensesView />
        </AccessGuard>
    );
}

function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

function ExpensesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate, formatPrice } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();
    const canManage = can(session, 'expenses.manage');

    const {
        filters,
        setFilter,
        setFilters,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ category: '', from: '', to: '' });

    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<Expense | null>(null);

    const query = useQuery({
        queryKey: ['expenses', { ...filters, limit, offset }],
        queryFn: () =>
            listExpenses({
                category: (filters.category || undefined) as
                    | ExpenseCategory
                    | undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                limit,
                offset,
            }),
    });
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteExpense(id),
        onSuccess: () => {
            invalidateFinance(queryClient);
            toast.success(t('expenses.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('expenses.title')}
                count={query.data?.count}
                description={
                    query.data
                        ? t('cashbox.sum', {
                              amount: formatPrice(
                                  query.data.sum,
                                  t('common.som'),
                              ),
                          })
                        : t('expenses.subtitle')
                }
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {query.data?.data && query.data.data.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => {
                                    exportToCsv(
                                        t('expenses.title'),
                                        [
                                            t('expenses.date'),
                                            t('expenses.category'),
                                            `${t('cashbox.amount')} (${t('common.som')})`,
                                            t('expenses.createdBy'),
                                            t('common.note'),
                                        ],
                                        query.data.data.map((e) => [
                                            formatDate(e.spent_at),
                                            t(`expenseCategory.${e.category}`),
                                            e.amount,
                                            e.created_by
                                                ? fullName(e.created_by)
                                                : '',
                                            e.note || '',
                                        ]),
                                    );
                                }}
                            >
                                <Download1 />
                                {t('common.export')}
                            </Button>
                        )}
                        {canManage && (
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setCreating(true)}
                            >
                                <Plus />
                                {t('expenses.new')}
                            </Button>
                        )}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5'>
                <MobileFilterSheet
                    activeCount={
                        (filters.category ? 1 : 0) +
                        (filters.from || filters.to ? 1 : 0)
                    }
                    onClear={() => {
                        setFilter('category', '');
                        setFilter('from', '');
                        setFilter('to', '');
                    }}
                    activeChips={[
                        ...(filters.category
                            ? [
                                  {
                                      key: 'category',
                                      label: t('filters.chip', {
                                          label: t('expenses.category'),
                                          value: t(
                                              `expenseCategory.${filters.category as ExpenseCategory}`,
                                          ),
                                      }),
                                      onRemove: () => setFilter('category', ''),
                                  },
                              ]
                            : []),
                    ]}
                >
                    <SelectInput
                        label={t('expenses.allCategories')}
                        options={EXPENSE_CATEGORIES.map((category) => ({
                            value: category,
                            label: t(`expenseCategory.${category}`),
                        }))}
                        placeholder={t('expenses.allCategories')}
                        value={filters.category}
                        onValueChange={(next) => setFilter('category', next)}
                    />
                    <div className='mt-1'>
                        <DateRangeFilter
                            from={filters.from}
                            to={filters.to}
                            onDateChange={(range) => setFilters(range)}
                        />
                    </div>
                </MobileFilterSheet>

                <div className='hidden flex-wrap items-center gap-3 sm:flex'>
                    <div className='w-52'>
                        <SelectInput
                            options={EXPENSE_CATEGORIES.map((category) => ({
                                value: category,
                                label: t(`expenseCategory.${category}`),
                            }))}
                            placeholder={t('expenses.allCategories')}
                            value={filters.category}
                            onValueChange={(next) =>
                                setFilter('category', next)
                            }
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
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('expenses.empty')}
                            icon={<SackDollar className='size-5' />}
                            action={
                                Boolean(
                                    filters.category ||
                                    filters.from ||
                                    filters.to,
                                ) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setFilter('category', '');
                                            setFilter('from', '');
                                            setFilter('to', '');
                                        }}
                                    >
                                        {t('filters.reset')}
                                    </Button>
                                ) : canManage ? (
                                    <Button
                                        variant='primary'
                                        appearance='fill'
                                        size='md'
                                        onPress={() => setCreating(true)}
                                    >
                                        <Plus />
                                        {t('expenses.new')}
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
                                            {t('expenses.date')}
                                        </TableHead>
                                        <TableHead>
                                            {t('expenses.category')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('cashbox.amount')}
                                        </TableHead>
                                        <TableHead>
                                            {t('cashbox.receivedBy')}
                                        </TableHead>
                                        {canManage && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((expense, index) => (
                                        <TableRow key={expense.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell>
                                                {formatDate(expense.spent_at)}
                                            </TableCell>
                                            <TableCell
                                                primary
                                                className='whitespace-normal'
                                            >
                                                <ExpenseCategoryBadge
                                                    category={expense.category}
                                                />
                                                {(expense.note ||
                                                    expense.branch) && (
                                                    <p className='text-text-tertiary mt-1 text-xs font-normal'>
                                                        {[
                                                            expense.note,
                                                            expense.branch
                                                                ?.name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    expense.amount,
                                                    t('common.som'),
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {expense.created_by
                                                    ? fullName(
                                                          expense.created_by,
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            {canManage && (
                                                <TableCell>
                                                    <div className='flex justify-end'>
                                                        {expense.is_salary_payout ? (
                                                            <span className='text-text-tertiary text-xs'>
                                                                {t(
                                                                    'expenses.salaryLocked',
                                                                )}
                                                            </span>
                                                        ) : (
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
                                                                        expense,
                                                                    )
                                                                }
                                                            >
                                                                <Trash1 />
                                                            </Button>
                                                        )}
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

            {creating && (
                <ExpenseFormModal onClose={() => setCreating(false)} />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('expenses.deleteTitle')}
                message={t('expenses.deleteMessage', {
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

function ExpenseFormModal({ onClose }: { onClose: () => void }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = branchesQuery.data ?? [];

    const [form, setForm] = useState({
        category: 'rent' as ExpenseCategory,
        amount: '',
        spent_at: toISODate(new Date()),
        branch_id: '',
        note: '',
    });

    const mutation = useMutation({
        mutationFn: () =>
            createExpense({
                category: form.category,
                amount: Number(form.amount),
                spent_at: form.spent_at,
                branch_id: form.branch_id || null,
                note: form.note.trim() || null,
            }),
        onSuccess: () => {
            invalidateFinance(queryClient);
            toast.success(t('expenses.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Modal open onClose={onClose} title={t('expenses.new')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <SelectInput
                        label={t('expenses.category')}
                        required
                        options={MANUAL_EXPENSE_CATEGORIES.map((category) => ({
                            value: category,
                            label: t(`expenseCategory.${category}`),
                        }))}
                        value={form.category}
                        onValueChange={(category) =>
                            setForm({
                                ...form,
                                category: category as ExpenseCategory,
                            })
                        }
                    />
                    <MoneyInput
                        label={t('cashbox.amount')}
                        required
                        currency={t('common.som')}
                        value={form.amount}
                        onValueChange={(amount) => setForm({ ...form, amount })}
                    />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('expenses.date')}
                        type='date'
                        required
                        value={form.spent_at}
                        onChange={(e) =>
                            setForm({ ...form, spent_at: e.target.value })
                        }
                    />
                    {branches.length > 1 && (
                        <SelectInput
                            label={t('groups.branch')}
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            placeholder={t('common.notSelected')}
                            value={form.branch_id}
                            onValueChange={(branch_id) =>
                                setForm({ ...form, branch_id })
                            }
                        />
                    )}
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
                                : 'common.save',
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
