'use client';

import { Badge } from '@/components/tailgrids/core/badge';
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
import { SearchInput } from '@/components/ui/search-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { deleteRole, listRoles } from '@/services/api/roles';
import type { Role } from '@/types/api';
import { PERMISSION_KEYS } from '@/types/api';
import { can, canGrantRole } from '@/utils/access';
import { Pencil1, Plus, Shield1Check, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';
import { RoleFormModal } from './_components/role-form';

export default function RolesPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'roles.view')}>
            <RolesView />
        </AccessGuard>
    );
}

function RolesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatNumber } = useFormat();
    const { session } = useSession();

    const canCreate = can(session, 'roles.create');
    const canUpdate = can(session, 'roles.update');
    const canDelete = can(session, 'roles.delete');

    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const [viewing, setViewing] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState<Role | null>(null);

    const queryClient = useQueryClient();

    // Rollar kam, shuning uchun sahifalanmaydi. Filtrlash — shu ro'yxat ichida.
    const query = useQuery({
        queryKey: ['roles'],
        queryFn: () => listRoles(),
    });

    const needle = deferredSearch.trim().toLowerCase();
    const roles = (query.data ?? []).filter((role) =>
        role.name.toLowerCase().includes(needle),
    );

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(t('roles.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('roles.title')}
                count={query.data?.length}
                description={t('roles.subtitle')}
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
                            {t('roles.new')}
                        </Button>
                    )
                }
            />

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('roles.search')}
                />
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : roles.length === 0 ? (
                        <EmptyState
                            message={t('roles.empty')}
                            icon={<Shield1Check className='size-5' />}
                        />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <RowNumberHead />
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>
                                        {t('common.description')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('roles.permissions')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('roles.usersCount')}
                                    </TableHead>
                                    <TableHead className='text-right'>
                                        {t('common.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role, index) => {
                                    // Owner roli va sessiya egasidan keng
                                    // ruxsatli rollar tahrirlanmaydi.
                                    const editable =
                                        !role.is_system &&
                                        canGrantRole(session, role);

                                    return (
                                        <TableRow key={role.id}>
                                            <RowNumberCell index={index} />
                                            <TableCell primary>
                                                <span className='inline-flex items-center gap-2'>
                                                    {role.name}
                                                    {role.is_system && (
                                                        <Badge
                                                            size='sm'
                                                            color='primary'
                                                        >
                                                            {t('roles.system')}
                                                        </Badge>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className='whitespace-normal'>
                                                {role.is_system
                                                    ? t(
                                                          'roles.ownerDescription',
                                                      )
                                                    : (role.description ?? '—')}
                                            </TableCell>
                                            <TableCell numeric>
                                                {t('roles.permissionsCount', {
                                                    count: formatNumber(
                                                        role.permissions.length,
                                                    ),
                                                    total: formatNumber(
                                                        PERMISSION_KEYS.length,
                                                    ),
                                                })}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatNumber(role.users_count)}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    {canUpdate && editable ? (
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.edit',
                                                            )}
                                                            onPress={() => {
                                                                setEditing(
                                                                    role,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil1 />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            onPress={() =>
                                                                setViewing(role)
                                                            }
                                                        >
                                                            {t(
                                                                'common.details',
                                                            )}
                                                        </Button>
                                                    )}
                                                    {canDelete && editable && (
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
                                                                    role,
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
                    )}
                </div>
            </div>

            {formOpen && (
                <RoleFormModal
                    role={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {viewing && (
                <RoleFormModal
                    role={viewing}
                    readOnly
                    onClose={() => setViewing(null)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('roles.deleteTitle')}
                message={
                    deleting && deleting.users_count > 0
                        ? t('roles.deleteInUse', {
                              name: deleting.name,
                              count: formatNumber(deleting.users_count),
                          })
                        : t('roles.deleteMessage', {
                              name: deleting?.name ?? '',
                          })
                }
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
