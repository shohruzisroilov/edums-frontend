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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RoleGuard } from '@/components/ui/role-guard';
import { SearchInput } from '@/components/ui/search-input';
import { ActiveBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT } from '@/i18n/provider';
import { deleteTariff, listTariffs } from '@/services/api/tariffs';
import type { Tariff } from '@/types/api';
import { Wallet2, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { TariffFormModal } from './_components/tariff-form';

export default function TariffsPage() {
    return (
        <RoleGuard allow={['super_admin']}>
            <TariffsView />
        </RoleGuard>
    );
}

function TariffsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatLimit, formatNumber, formatPrice } = useFormat();

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ is_active: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Tariff | null>(null);
    const [deleting, setDeleting] = useState<Tariff | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['tariffs', { search, ...filters, limit, offset }],
        queryFn: () =>
            listTariffs({
                search: search || undefined,
                is_active:
                    filters.is_active === ''
                        ? undefined
                        : filters.is_active === 'true',
                limit,
                offset,
            }),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteTariff(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tariffs'] });
            toast.success(t('tariffs.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('tariffs.title')}
                count={query.data?.count}
                description={t('tariffs.subtitle')}
                actions={
                    <Button
                        variant='primary'
                        appearance='fill'
                        size='md'
                        onPress={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus />
                        {t('tariffs.new')}
                    </Button>
                }
            />

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('tariffs.search')}
                />
                <div className='sm:w-44'>
                    <SelectInput
                        options={[
                            { value: 'true', label: t('common.active') },
                            { value: 'false', label: t('common.inactive') },
                        ]}
                        placeholder={t('common.allStatuses')}
                        value={filters.is_active}
                        onValueChange={(next) => setFilter('is_active', next)}
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
                            message={t('tariffs.empty')}
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
                                        <TableHead>
                                            {t('common.name')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('tariffs.price')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('tariffs.duration')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('tariffs.maxStudents')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('tariffs.maxTeachers')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((tariff) => (
                                        <TableRow key={tariff.id}>
                                            <TableCell
                                                primary
                                                className='whitespace-normal'
                                            >
                                                {tariff.name}
                                                {tariff.description && (
                                                    <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                        {tariff.description}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    tariff.price,
                                                    t('common.som'),
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {t('tariffs.days', {
                                                    count: formatNumber(
                                                        tariff.duration_days,
                                                    ),
                                                })}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatLimit(
                                                    tariff.max_students,
                                                    t('common.unlimited'),
                                                )}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatLimit(
                                                    tariff.max_teachers,
                                                    t('common.unlimited'),
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ActiveBadge
                                                    active={tariff.is_active}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.edit',
                                                        )}
                                                        onPress={() => {
                                                            setEditing(tariff);
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil1 />
                                                    </Button>
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.delete',
                                                        )}
                                                        onPress={() =>
                                                            setDeleting(tariff)
                                                        }
                                                    >
                                                        <Trash1 />
                                                    </Button>
                                                </div>
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

            {formOpen && (
                <TariffFormModal
                    tariff={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('tariffs.deleteTitle')}
                message={t('tariffs.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
