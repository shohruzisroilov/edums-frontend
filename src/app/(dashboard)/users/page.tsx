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
import { useListQuery, useOffsetInRange } from '@/hooks/use-list-query';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listRoles } from '@/services/api/roles';
import { deleteUser, listUsers, resetUserPassword } from '@/services/api/users';
import type { User } from '@/types/api';
import { can, canManageUser } from '@/utils/access';
import { exportToExcel } from '@/utils/export';
import { formatPhone, fullName } from '@/utils/format';
import { Download1, Pencil1, Plus, Trash1, User2 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { SortableHead } from '@/components/ui/sortable-head';
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
        sortBy,
        sortOrder,
        toggleSort,
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
        queryKey: [
            'users',
            { search, ...filters, limit, offset, sortBy, sortOrder },
        ],
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
                sort_by: sortBy || undefined,
                order: sortOrder || undefined,
            }),
    });
    useOffsetInRange(query.data?.count, offset, limit, setOffset);

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
            // O'qituvchi tanlash ro'yxati va oylik varaqasi ham xodimlardan.
            queryClient.invalidateQueries({ queryKey: ['user-options'] });
            queryClient.invalidateQueries({ queryKey: ['salary-sheet'] });
            toast.success(t('users.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    const activeCount =
        (filters.role_id ? 1 : 0) + (filters.is_active !== '' ? 1 : 0);

    const handleExportExcel = async () => {
        let list = query.data?.data ?? [];
        const total = query.data?.count ?? 0;
        if (total > list.length) {
            try {
                const res = await listUsers({
                    search: search || undefined,
                    role_id: filters.role_id || undefined,
                    is_active:
                        filters.is_active === ''
                            ? undefined
                            : filters.is_active === 'true',
                    limit: Math.min(total, 200),
                    offset: 0,
                    sort_by: sortBy || undefined,
                    order: sortOrder || undefined,
                });
                list = res.data;
            } catch {
                /* fallback to current list */
            }
        }
        if (list.length === 0) return;
        await exportToExcel(
            t('users.title'),
            'Users',
            [
                t('common.fullName'),
                t('common.phone'),
                t('users.role'),
                t('common.status'),
                t('common.createdAt'),
            ],
            list.map((u) => [
                fullName(u),
                u.phone_number ? formatPhone(u.phone_number) : '',
                u.roles?.map((r) => r.name).join(', ') || '—',
                u.is_active ? t('common.active') : t('common.inactive'),
                formatDate(u.created_at),
            ]),
        );
    };

    return (
        <>
            <PageHeader
                title={t('users.title')}
                count={query.data?.count}
                description={t('users.subtitle')}
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {query.data?.data && query.data.data.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={handleExportExcel}
                            >
                                <Download1 />
                                <span className='sr-only sm:not-sr-only'>
                                    {t('common.export')}
                                </span>
                            </Button>
                        )}
                        {canCreate && (
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
                        )}
                    </div>
                }
            />

            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5'>
                <div className='min-w-0 flex-1 sm:min-w-[220px]'>
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

                <div className='hidden min-w-0 flex-wrap items-center gap-3 sm:flex'>
                    {canListRoles && (
                        <div className='w-52 shrink-0'>
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
                    <div className='w-40 shrink-0'>
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

            <div className='px-4 sm:px-5'>
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
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.data.map((user, index) => {
                                    const isSelf = user.id === session?.id;
                                    const manageable =
                                        rolesQuery.isSuccess &&
                                        canManageUser(session, user, roles);

                                    return (
                                        <div
                                            key={user.id}
                                            className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                        >
                                            <div className='flex items-start justify-between gap-3'>
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                            #
                                                            {offset + index + 1}
                                                        </span>
                                                        <h3 className='text-text-primary text-sm font-semibold'>
                                                            {fullName(user)}
                                                        </h3>
                                                        {isSelf && (
                                                            <span className='text-text-tertiary text-xs font-normal'>
                                                                (
                                                                {t('users.you')}
                                                                )
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className='text-text-secondary mt-1 text-xs'>
                                                        {user.phone_number}
                                                    </p>
                                                </div>
                                                <ActiveBadge
                                                    active={user.is_active}
                                                />
                                            </div>

                                            {user.roles.length > 0 && (
                                                <div className='flex flex-wrap gap-1'>
                                                    {user.roles.map((role) => (
                                                        <RoleBadge
                                                            key={role.id}
                                                            role={role}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <div className='flex items-center justify-between text-xs'>
                                                <span className='text-text-tertiary'>
                                                    {t('common.createdAt')}
                                                </span>
                                                <span className='text-text-tertiary tabular-nums'>
                                                    {formatDate(
                                                        user.created_at,
                                                    )}
                                                </span>
                                            </div>

                                            {canUpdate &&
                                                (isSelf || manageable) && (
                                                    <div className='border-card-border/60 flex flex-wrap items-center justify-end gap-2 border-t pt-2.5'>
                                                        {!isSelf &&
                                                            manageable && (
                                                                <Button
                                                                    appearance='outline'
                                                                    size='sm'
                                                                    onPress={() =>
                                                                        setResetting(
                                                                            user,
                                                                        )
                                                                    }
                                                                >
                                                                    <span>
                                                                        {t(
                                                                            'users.resetPassword',
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            )}
                                                        <Button
                                                            appearance='outline'
                                                            size='sm'
                                                            onPress={() => {
                                                                setEditing(
                                                                    user,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className='gap-1.5'
                                                        >
                                                            <Pencil1 className='size-3.5' />
                                                            <span>
                                                                {t(
                                                                    'common.edit',
                                                                )}
                                                            </span>
                                                        </Button>
                                                        {canDelete &&
                                                            !isSelf &&
                                                            manageable && (
                                                                <Button
                                                                    variant='danger'
                                                                    appearance='outline'
                                                                    size='sm'
                                                                    onPress={() =>
                                                                        setDeleting(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className='gap-1.5'
                                                                >
                                                                    <Trash1 className='size-3.5' />
                                                                    <span>
                                                                        {t(
                                                                            'common.delete',
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            )}
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
                                            <SortableHead
                                                field='name'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.fullName')}
                                            </SortableHead>
                                            <TableHead>
                                                {t('common.phone')}
                                            </TableHead>
                                            <TableHead>
                                                {t('users.roles')}
                                            </TableHead>
                                            <SortableHead
                                                field='status'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.status')}
                                            </SortableHead>
                                            <SortableHead
                                                field='created_at'
                                                defaultOrder='desc'
                                                currentSort={sortBy}
                                                currentOrder={sortOrder}
                                                onSort={toggleSort}
                                            >
                                                {t('common.createdAt')}
                                            </SortableHead>
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {query.data.data.map((user, index) => {
                                            const isSelf =
                                                user.id === session?.id;
                                            // Ruxsatlari kengroq odamni backend
                                            // baribir rad etadi — tugmani ko'rsatmaymiz.
                                            const manageable =
                                                rolesQuery.isSuccess &&
                                                canManageUser(
                                                    session,
                                                    user,
                                                    roles,
                                                );

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
                                                                        role={
                                                                            role
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ActiveBadge
                                                            active={
                                                                user.is_active
                                                            }
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
