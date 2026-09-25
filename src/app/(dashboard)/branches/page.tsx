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
import { ActiveBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
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

            <div className='px-5'>
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
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>
                                        {t('branches.address')}
                                    </TableHead>
                                    <TableHead>{t('common.phone')}</TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                    <TableHead>
                                        {t('common.createdAt')}
                                    </TableHead>
                                    <TableHead className='text-right'>
                                        {t('common.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {query.data.map((branch) => (
                                    <TableRow key={branch.id}>
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
                                                active={branch.is_active}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(branch.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    appearance='outline'
                                                    size='md'
                                                    onPress={() =>
                                                        setRoomsOf(branch)
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
                                                            setEditing(branch);
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil1 />
                                                    </Button>
                                                )}
                                                {canDelete &&
                                                    query.data.length > 1 && (
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
