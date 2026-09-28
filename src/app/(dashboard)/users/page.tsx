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
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { ResetPasswordModal } from '@/components/ui/reset-password-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import { ActiveBadge, RoleBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listRoles } from '@/services/api/roles';
import { deleteUser, listUsers, resetUserPassword } from '@/services/api/users';
import type { User } from '@/types/api';
import { can, canManageUser } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus, Trash1, User2 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { UserFormModal } from './_components/user-form';

export default function UsersPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'users.view')}>
            <UsersView />
        </AccessGuard>
    );
}

function UsersView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate } = useFormat();
    const { session } = useSession();

    const canCreate = can(session, 'users.create');
    const canUpdate = can(session, 'users.update');
    const canDelete = can(session, 'users.delete');
    // GET /roles shu uchtasidan biri bilan ochiq — filtr va forma uchun kerak.
    const canListRoles = can(session, 'roles.view') || canCreate || canUpdate;

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ role_id: '', is_active: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [resetting, setResetting] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);

    useOpenOnNewParam(() => {
        setEditing(null);
        setFormOpen(true);
    }, canCreate);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['users', { search, ...filters, limit, offset }],
        queryFn: () =>
            listUsers({
                search: search || undefined,
                role_id: filters.role_id || undefined,
                is_active:
                    filters.is_active === ''
                        ? undefined
                        : filters.is_active === 'true',
                limit,
                offset,
            }),
    });

    const rolesQuery = useQuery({
        queryKey: ['roles'],
        queryFn: () => listRoles(),
        enabled: canListRoles,
    });
    const roles = rolesQuery.data ?? [];

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(t('users.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    const activeRole = roles.find((r) => r.id === filters.role_id);
    const activeStatus =
        filters.is_active !== ''
            ? filters.is_active === 'true'
                ? t('common.active')
                : t('common.inactive')
            : null;
    const activeCount =
        (filters.role_id ? 1 : 0) + (filters.is_active !== '' ? 1 : 0);

    const activeChips = [
        ...(activeRole
            ? [
                  {
                      key: 'role',
                      label: `Rol: ${activeRole.name}`,
                      onRemove: () => setFilter('role_id', ''),
                  },
              ]
            : []),
        ...(activeStatus
            ? [
                  {
                      key: 'status',
                      label: `Holat: ${activeStatus}`,
                      onRemove: () => setFilter('is_active', ''),
                  },
              ]
            : []),
    ];

    const maxUsers = session?.subscription?.max_users;
    const isAtUserLimit =
        maxUsers !== null &&
        maxUsers !== undefined &&
        query.data !== undefined &&
        query.data.count >= maxUsers;

    return (
        <>
            <PageHeader
                title={t('users.title')}
                count={
                    maxUsers !== null &&
                    maxUsers !== undefined &&
                    query.data?.count !== undefined
                        ? `${query.data.count} / ${maxUsers}`
                        : query.data?.count
                }
                description={
                    <span className='flex flex-wrap items-center gap-2'>
                        <span>{t('users.subtitle')}</span>
                        {session?.subscription?.tariff_name && (
                            <span className='border-brand-accent/25 bg-brand-accent/10 text-brand-accent rounded-md border px-2 py-0.5 text-xs font-semibold'>
                                {t('billing.tariff')}: {session.subscription.tariff_name}
                            </span>
                        )}
                    </span>
                }
                actions={
                    canCreate && (
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
                    )
                }
            />

            {isAtUserLimit && (
                <div className='border-card-border bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200 mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl border p-3 text-xs sm:mx-5'>
                    <span>
                        Tarifingiz (
                        <strong>
                            {session?.subscription?.tariff_name || 'Boshlang\'ich'}
                        </strong>
                        ) boʻyicha maksimal {maxUsers} ta foydalanuvchi limiti toʻlgan ({query.data?.count} / {maxUsers}). Yangi foydalanuvchi qoʻshish uchun yuqoriroq tarifga oʻting.
                    </span>
                    {can(session, 'billing.manage') && (
                        <Link
                            href='/billing'
                            className='text-brand-accent shrink-0 font-semibold hover:underline'
                        >
                            {t('billing.manageSubscription')} →
                        </Link>
                    )}
                </div>
            )}

            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5'>
                <div className='min-w-[220px] flex-1'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('users.search')}
                    />
                </div>

                <MobileFilterSheet
                    activeCount={activeCount}
                    onClear={() => {
                        setFilter('role_id', '');
                        setFilter('is_active', '');
                    }}
                    activeChips={activeChips}
                >
                    {canListRoles && (
                        <SelectInput
                            label={t('users.allRoles')}
                            options={roles.map((role) => ({
                                value: role.id,
                                label: role.name,
                            }))}
                            placeholder={t('users.allRoles')}
                            value={filters.role_id}
                            onValueChange={(next) => setFilter('role_id', next)}
                        />
                    )}
                    <SelectInput
                        label={t('common.allStatuses')}
                        options={[
                            { value: 'true', label: t('common.active') },
                            { value: 'false', label: t('common.inactive') },
                        ]}
                        placeholder={t('common.allStatuses')}
                        value={filters.is_active}
                        onValueChange={(next) => setFilter('is_active', next)}
                    />
                </MobileFilterSheet>

                <div className='hidden items-center gap-3 sm:flex'>
                    {canListRoles && (
                        <div className='w-52'>
                            <SelectInput
                                options={roles.map((role) => ({
                                    value: role.id,
                                    label: role.name,
                                }))}
                                placeholder={t('users.allRoles')}
                                value={filters.role_id}
                                onValueChange={(next) =>
                                    setFilter('role_id', next)
                                }
                            />
                        </div>
                    )}
                    <div className='w-40'>
                        <SelectInput
                            options={[
                                { value: 'true', label: t('common.active') },
                                { value: 'false', label: t('common.inactive') },
                            ]}
                            placeholder={t('common.allStatuses')}
                            value={filters.is_active}
                            onValueChange={(next) =>
                                setFilter('is_active', next)
                            }
                        />
                    </div>
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
                                        <RowNumberHead />
                                        <TableHead>
                                            {t('common.fullName')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>
                                            {t('users.roles')}
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
                                    {query.data.data.map((user, index) => {
                                        const isSelf = user.id === session?.id;
                                        // Ruxsatlari kengroq odamni backend
                                        // baribir rad etadi — tugmani ko'rsatmaymiz.
                                        const manageable =
                                            rolesQuery.isSuccess &&
                                            canManageUser(session, user, roles);

                                        return (
                                            <TableRow key={user.id}>
                                                <RowNumberCell
                                                    index={index}
                                                    offset={offset}
                                                />
                                                <TableCell primary>
                                                    {fullName(user)}
                                                    {isSelf && (
                                                        <span className='text-text-tertiary ml-1.5 text-xs font-normal'>
                                                            {t('users.you')}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {user.phone_number}
                                                </TableCell>
                                                <TableCell className='whitespace-normal'>
                                                    <div className='flex flex-wrap gap-1'>
                                                        {user.roles.map(
                                                            (role) => (
                                                                <RoleBadge
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    role={role}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <ActiveBadge
                                                        active={user.is_active}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        user.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-end gap-2'>
                                                        {canUpdate &&
                                                            (isSelf ||
                                                                manageable) && (
                                                                <Button
                                                                    appearance='outline'
                                                                    size='md'
                                                                    iconOnly
                                                                    aria-label={t(
                                                                        'common.edit',
                                                                    )}
                                                                    onPress={() => {
                                                                        setEditing(
                                                                            user,
                                                                        );
                                                                        setFormOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Pencil1 />
                                                                </Button>
                                                            )}
                                                        {canUpdate &&
                                                            !isSelf &&
                                                            manageable && (
                                                                <Button
                                                                    appearance='outline'
                                                                    size='md'
                                                                    onPress={() =>
                                                                        setResetting(
                                                                            user,
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        'users.resetPassword',
                                                                    )}
                                                                </Button>
                                                            )}
                                                        {canDelete &&
                                                            !isSelf &&
                                                            manageable && (
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
                                                                            user,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash1 />
                                                                </Button>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
                    roles={roles}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {resetting && (
                <ResetPasswordModal
                    user={resetting}
                    reset={(password) =>
                        resetUserPassword(resetting.id, password)
                    }
                    onClose={() => setResetting(null)}
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
