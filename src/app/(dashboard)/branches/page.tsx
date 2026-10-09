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
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { deleteBranch, listBranches } from '@/services/api/branches';
import type { Branch } from '@/types/api';
import { can } from '@/utils/access';
import { MapMarker5, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { BranchFormModal } from './_components/branch-form';
import { RoomsModal } from './_components/rooms-modal';

export default function BranchesPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'branches.view')}>
            <BranchesView />
        </AccessGuard>
    );
}

function BranchesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'branches.create');
    const canUpdate = can(session, 'branches.update');
    const canDelete = can(session, 'branches.delete');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Branch | null>(null);
    const [deleting, setDeleting] = useState<Branch | null>(null);
    const [roomsOf, setRoomsOf] = useState<Branch | null>(null);

    const query = useQuery({ queryKey: ['branches'], queryFn: listBranches });

    // Dashboard'dagi "Xonalarni kiriting" qadami: birinchi filial xonalari.
    const firstBranch = query.data?.[0] ?? null;
    useOpenOnNewParam(
        () => setRoomsOf(firstBranch),
        firstBranch !== null,
        'rooms',
    );

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteBranch(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(t('branches.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('branches.title')}
                count={query.data?.length}
                description={t('branches.subtitle')}
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
                            {t('branches.new')}
                        </Button>
                    )
                }
            />

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.length === 0 ? (
                        <EmptyState
                            message={t('branches.empty')}
                            icon={<MapMarker5 className='size-5' />}
                        />
                    ) : (
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.map((branch, index) => (
                                    <div
                                        key={branch.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{index + 1}
                                                    </span>
                                                    <h3 className='text-text-primary text-sm font-semibold'>
                                                        {branch.name}
                                                    </h3>
                                                </div>
                                                {branch.address && (
                                                    <p className='text-text-tertiary mt-1 text-xs'>
                                                        {branch.address}
                                                    </p>
                                                )}
                                            </div>
                                            <ActiveBadge
                                                active={branch.is_active}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <span className='text-text-secondary'>
                                                {branch.phone_number ?? '—'}
                                            </span>
                                            <span className='text-text-tertiary tabular-nums'>
                                                {formatDate(branch.created_at)}
                                            </span>
                                        </div>

                                        <div className='border-card-border/60 flex items-center justify-end gap-2 border-t pt-2.5'>
                                            <Button
                                                appearance='outline'
                                                size='sm'
                                                onPress={() =>
                                                    setRoomsOf(branch)
                                                }
                                                className='gap-1.5'
                                            >
                                                <span>{t('rooms.manage')}</span>
                                            </Button>
                                            {canUpdate && (
                                                <Button
                                                    appearance='outline'
                                                    size='sm'
                                                    onPress={() => {
                                                        setEditing(branch);
                                                        setFormOpen(true);
                                                    }}
                                                    className='gap-1.5'
                                                >
                                                    <Pencil1 className='size-3.5' />
                                                    <span>
                                                        {t('common.edit')}
                                                    </span>
                                                </Button>
                                            )}
                                            {canDelete &&
                                                query.data.length > 1 && (
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='sm'
                                                        onPress={() =>
                                                            setDeleting(branch)
                                                        }
                                                        className='gap-1.5'
                                                    >
                                                        <Trash1 className='size-3.5' />
                                                        <span>
                                                            {t('common.delete')}
                                                        </span>
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                ))}
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
                                                {t('common.name')}
                                            </TableHead>
                                            <TableHead>
                                                {t('branches.address')}
                                            </TableHead>
                                            <TableHead>
                                                {t('common.phone')}
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
                                        {query.data.map((branch, index) => (
                                            <TableRow key={branch.id}>
                                                <RowNumberCell index={index} />
                                                <TableCell primary>
                                                    {branch.name}
                                                </TableCell>
                                                <TableCell className='whitespace-normal'>
                                                    {branch.address ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {branch.phone_number ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <ActiveBadge
                                                        active={
                                                            branch.is_active
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        branch.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-end gap-2'>
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            onPress={() =>
                                                                setRoomsOf(
                                                                    branch,
                                                                )
                                                            }
                                                        >
                                                            {t('rooms.manage')}
                                                        </Button>
                                                        {canUpdate && (
                                                            <Button
                                                                appearance='outline'
                                                                size='md'
                                                                iconOnly
                                                                aria-label={t(
                                                                    'common.edit',
                                                                )}
                                                                onPress={() => {
                                                                    setEditing(
                                                                        branch,
                                                                    );
                                                                    setFormOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil1 />
                                                            </Button>
                                                        )}
                                                        {canDelete &&
                                                            query.data.length >
                                                                1 && (
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
                                                                            branch,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash1 />
                                                                </Button>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </TableRoot>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {formOpen && (
                <BranchFormModal
                    branch={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {roomsOf && (
                <RoomsModal
                    branch={roomsOf}
                    canManage={canUpdate}
                    onClose={() => setRoomsOf(null)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('branches.deleteTitle')}
                message={t('branches.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
