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
import { listEducationCenters } from '@/services/api/education-centers';
import { deleteUser, listUsers } from '@/services/api/users';
import type { User, UserRole } from '@/types/api';
import { USER_ROLES } from '@/types/api';
import { fullName } from '@/utils/format';
import { User2, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserFormModal } from './_components/user-form';

export default function UsersPage() {
    return (
        <RoleGuard allow={['super_admin']}>
            <UsersView />
        </RoleGuard>
    );
}

function UsersView() {
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

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['users', { search, ...filters, limit, offset }],
        queryFn: () =>
            listUsers({
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
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(t('users.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('users.title')}
                count={query.data?.count}
                description={t('users.subtitle')}
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
                        {t('users.new')}
                    </Button>
                }
            />

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:flex-wrap sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('users.search')}
                />
                <div className='sm:w-44'>
                    <SelectInput
                        options={USER_ROLES.map((role) => ({
                            value: role,
                            label: t(`role.${role}`),
                        }))}
                        placeholder={t('users.allRoles')}
                        value={filters.role}
                        onValueChange={(next) => setFilter('role', next)}
                    />
                </div>
                <div className='sm:w-52'>
                    <SelectInput
                        options={(centersQuery.data?.data ?? []).map(
                            (center) => ({
                                value: center.id,
                                label: center.name,
                            }),
                        )}
                        placeholder={t('users.allCenters')}
                        value={filters.education_center_id}
                        onValueChange={(next) =>
                            setFilter('education_center_id', next)
                        }
                    />
                </div>
                <div className='sm:w-40'>
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
                            message={t('users.empty')}
                            icon={<User2 className='size-5' />}
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
                                        <TableHead>{t('users.role')}</TableHead>
                                        <TableHead>
                                            {t('users.center')}
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
                                    {query.data.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell
                                                primary
                                                className='whitespace-normal'
                                            >
                                                {fullName(user)}
                                            </TableCell>
                                            <TableCell>
                                                {user.phone_number}
                                            </TableCell>
                                            <TableCell>
                                                {t(`role.${user.role}`)}
                                            </TableCell>
                                            <TableCell>
                                                {user.education_center?.name ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <ActiveBadge
                                                    active={user.is_active}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(user.created_at)}
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
                                                            setEditing(user);
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
                                                            setDeleting(user)
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
                <UserFormModal
                    user={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('users.deleteTitle')}
                message={t('users.deleteMessage', {
                    name: deleting ? fullName(deleting) : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
