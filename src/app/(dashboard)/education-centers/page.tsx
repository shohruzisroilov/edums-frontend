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
import { CenterStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useListQuery } from '@/hooks/use-list-query';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    deleteEducationCenter,
    listEducationCenters,
} from '@/services/api/education-centers';
import { listEducations } from '@/services/api/educations';
import type { EducationCenter, EducationCenterStatus } from '@/types/api';
import { ENTITY_STATUSES } from '@/types/api';
import { ALL_ROLES, CAN_MANAGE_CENTERS } from '@/utils/access';
import { Pencil1, Plus, Shop, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { CenterFormModal } from './_components/center-form';

export default function EducationCentersPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <CentersView />
        </RoleGuard>
    );
}

function CentersView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { session } = useSession();

    // Backend ro'yxatni rolga qarab o'zi cheklaydi; bu yerda faqat
    // yozish amallari yashiriladi.
    const canManage = hasRole(session, ...CAN_MANAGE_CENTERS);
    const isSuperAdmin = hasRole(session, 'super_admin');

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '', education_id: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<EducationCenter | null>(null);
    const [deleting, setDeleting] = useState<EducationCenter | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['education-centers', { search, ...filters, limit, offset }],
        queryFn: () =>
            listEducationCenters({
                search: search || undefined,
                status: (filters.status || undefined) as
                    | EducationCenterStatus
                    | undefined,
                education_id: isSuperAdmin
                    ? filters.education_id || undefined
                    : undefined,
                limit,
                offset,
            }),
    });

    const educationsQuery = useQuery({
        queryKey: ['educations', 'options'],
        queryFn: () => listEducations({ limit: 200 }),
        enabled: isSuperAdmin,
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteEducationCenter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['education-centers'] });
            toast.success(t('centers.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('centers.title')}
                count={query.data?.count}
                description={t('centers.subtitle')}
                actions={
                    canManage && (
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
                            {t('centers.new')}
                        </Button>
                    )
                }
            />

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('centers.search')}
                />
                <div className='sm:w-44'>
                    <SelectInput
                        options={ENTITY_STATUSES.map((status) => ({
                            value: status,
                            label: t(`centerStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
                {isSuperAdmin && (
                    <div className='sm:w-56'>
                        <SelectInput
                            options={(educationsQuery.data?.data ?? []).map(
                                (education) => ({
                                    value: education.id,
                                    label: education.name,
                                }),
                            )}
                            placeholder={t('centers.allEducations')}
                            value={filters.education_id}
                            onValueChange={(next) =>
                                setFilter('education_id', next)
                            }
                        />
                    </div>
                )}
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('centers.empty')}
                            icon={<Shop className='size-5' />}
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
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>
                                            {t('centers.workingHours')}
                                        </TableHead>
                                        {isSuperAdmin && (
                                            <TableHead>
                                                {t('centers.education')}
                                            </TableHead>
                                        )}
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        {canManage && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((center) => (
                                        <TableRow key={center.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/education-centers/${center.id}`}
                                                    className='text-brand-accent font-medium hover:underline'
                                                >
                                                    {center.name}
                                                </Link>
                                                {center.address && (
                                                    <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                        {center.address}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {center.phone_number}
                                            </TableCell>
                                            <TableCell>
                                                {center.working_hours ?? '—'}
                                            </TableCell>
                                            {isSuperAdmin && (
                                                <TableCell>
                                                    {center.education?.name ??
                                                        '—'}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <CenterStatusBadge
                                                    status={center.status}
                                                />
                                            </TableCell>
                                            {canManage && (
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
                                                                setEditing(
                                                                    center,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
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
                                                                setDeleting(
                                                                    center,
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

            {formOpen && (
                <CenterFormModal
                    center={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('centers.deleteTitle')}
                message={t('centers.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
