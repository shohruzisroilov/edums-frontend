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
import { PageHeader } from '@/components/ui/page-header';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { ActiveBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { deleteTariff, listTariffs } from '@/services/api/tariffs';
import type { Tariff } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { Pencil1, Plus, Trash1, Wallet2 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { TariffFormModal } from './_components/tariff-form';

export default function TariffsPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <TariffsView />
        </AccessGuard>
    );
}

function TariffsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatPrice, formatNumber } = useFormat();
    const queryClient = useQueryClient();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Tariff | null>(null);
    const [deleting, setDeleting] = useState<Tariff | null>(null);

    const query = useQuery({ queryKey: ['tariffs'], queryFn: listTariffs });

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
                count={query.data?.length}
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

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.length === 0 ? (
                        <EmptyState
                            message={t('tariffs.empty')}
                            icon={<Wallet2 className='size-5' />}
                        />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <RowNumberHead />
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead numeric>
                                        {t('tariffs.price')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('tariffs.duration')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('tariffs.yearly')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('tariffs.maxStudents')}
                                    </TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                    <TableHead className='text-right'>
                                        {t('common.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {query.data.map((tariff, index) => (
                                    <TableRow key={tariff.id}>
                                        <RowNumberCell index={index} />
                                        <TableCell primary>
                                            {tariff.name}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(
                                                tariff.price,
                                                t('common.som'),
                                            )}
                                        </TableCell>
                                        <TableCell numeric>
                                            {t('tariffs.durationValue', {
                                                days: tariff.duration_days,
                                            })}
                                        </TableCell>
                                        <TableCell numeric>
                                            {tariff.yearly_price === null ? (
                                                '—'
                                            ) : (
                                                <>
                                                    {formatPrice(
                                                        tariff.yearly_price,
                                                        t('common.som'),
                                                    )}
                                                    <span className='text-badge-success-text block text-xs'>
                                                        −
                                                        {
                                                            tariff.yearly_discount_percent
                                                        }
                                                        %
                                                    </span>
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell numeric>
                                            {(tariff.max_students ??
                                                tariff.max_users ??
                                                null) === null
                                                ? t('common.unlimited')
                                                : formatNumber(
                                                      (tariff.max_students ??
                                                          tariff.max_users)!,
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
