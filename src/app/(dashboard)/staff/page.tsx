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
import { ActiveBadge, RoleBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT } from '@/i18n/provider';
import { listEducationCenters } from '@/services/api/education-centers';
import { deleteStaff, listStaff } from '@/services/api/staff';
import type { User, UserRole } from '@/types/api';
import { USER_ROLES } from '@/types/api';
import { CAN_VIEW_STAFF } from '@/utils/access';
import { fullName } from '@/utils/format';
import { IdCard, Locked3, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResetPasswordModal } from './_components/reset-password';

export default function StaffPage() {
    return (
        <RoleGuard allow={CAN_VIEW_STAFF}>
            <StaffView />
        </RoleGuard>
    );
}

function StaffView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate } = useFormat();

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ role: '', education_center_id: '', is_active: '' });

    const [resetting, setResetting] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['staff', { search, ...filters, limit, offset }],
        queryFn: () =>
            listStaff({
                search: search || undefined,
                role: (filters.role || undefined) as UserRole | undefined,
                education_center_id: filters.education_center_id || undefined,
                is_active:
                    filters.is_active === ''
                        ? undefined
                        : filters.is_active === 'true',
                limit,
                offset,
            }),
    });

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options'],
        queryFn: () => listEducationCenters({ limit: 200 }),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteStaff(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            toast.success(t('staff.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('staff.title')}
                count={query.data?.count}
                description={t('staff.subtitle')}
            />

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('staff.search')}
                />
                <div className='w-full sm:w-44'>
                    <SelectInput
                        options={USER_ROLES.map((role) => ({
                            value: role,
                            label: t(`role.${role}`),
                        }))}
                        placeholder={t('staff.allRoles')}
                        value={filters.role}
                        onValueChange={(next) => setFilter('role', next)}
                    />
                </div>
                <div className='w-full sm:w-48'>
                    <SelectInput
                        options={(centersQuery.data?.data ?? []).map(
                            (center) => ({
                                value: center.id,
                                label: center.name,
                            }),
                        )}
                        placeholder={t('staff.allCenters')}
                        value={filters.education_center_id}
                        onValueChange={(next) =>
                            setFilter('education_center_id', next)
                        }
                    />
                </div>
                <div className='w-full sm:w-40'>
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
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('staff.empty')}
                            icon={<IdCard className='size-5' />}
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
                                            {t('common.fullName')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>{t('staff.role')}</TableHead>
                                        <TableHead>
                                            {t('staff.centers')}
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
                                    {query.data.data.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell primary>
                                                {fullName(member)}
                                            </TableCell>
                                            <TableCell>
                                                {member.phone_number}
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge role={member.role} />
                                            </TableCell>
                                            <TableCell className='whitespace-normal'>
                                                {member.education_centers
                                                    ?.length
                                                    ? member.education_centers
                                                          .map(
                                                              (center) =>
                                                                  center.name,
                                                          )
                                                          .join(', ')
                                                    : t('staff.noCenters')}
                                            </TableCell>
                                            <TableCell>
                                                <ActiveBadge
                                                    active={member.is_active}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(member.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'staff.resetPassword',
                                                        )}
                                                        onPress={() =>
                                                            setResetting(member)
                                                        }
                                                    >
                                                        <Locked3 />
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
                                                            setDeleting(member)
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

            {resetting && (
                <ResetPasswordModal
                    user={resetting}
                    onClose={() => setResetting(null)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('staff.deleteTitle')}
                message={t('staff.deleteMessage', {
                    name: deleting ? fullName(deleting) : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
