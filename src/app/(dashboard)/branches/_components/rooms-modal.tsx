'use client';

import { Button } from '@/components/tailgrids/core/button';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { CheckboxInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { NumberInput } from '@/components/ui/number-input';
import { ActiveBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    createRoom,
    deleteRoom,
    listRooms,
    updateRoom,
} from '@/services/api/rooms';
import type { Branch, Room } from '@/types/api';
import { Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface RoomForm {
    name: string;
    capacity: string;
    is_active: boolean;
}

/**
 * Filial xonalari. Tahrirlash va o'chirishni tasdiqlash shu oynaning ichida —
 * ikkinchi modal ochilsa, Escape va Tab ikkala oynaga birdaniga ta'sir qilardi.
 */
export function RoomsModal({
    branch,
    canManage,
    onClose,
}: {
    branch: Branch;
    /** branches.update — xona qo'shish, tahrirlash, o'chirish. */
    canManage: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [editing, setEditing] = useState<Room | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Room | null>(null);
    const [form, setForm] = useState<RoomForm>({
        name: '',
        capacity: '',
        is_active: true,
    });

    const query = useQuery({
        queryKey: ['rooms', branch.id],
        queryFn: () => listRooms({ branch_id: branch.id }),
    });

    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }

    const saveMutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                capacity: form.capacity ? Number(form.capacity) : null,
                is_active: form.is_active,
            };

            return editing && editing !== 'new'
                ? updateRoom(editing.id, payload)
                : createRoom({ ...payload, branch_id: branch.id });
        },
        onSuccess: () => {
            invalidate();
            toast.success(t('rooms.saved'));
            setEditing(null);
        },
        onError: (error) => toastError(error),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteRoom(id),
        onSuccess: () => {
            invalidate();
            toast.success(t('rooms.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    function startEdit(room: Room | 'new') {
        setDeleting(null);
        setEditing(room);
        setForm(
            room === 'new'
                ? { name: '', capacity: '', is_active: true }
                : {
                      name: room.name,
                      capacity:
                          room.capacity === null ? '' : String(room.capacity),
                      is_active: room.is_active,
                  },
        );
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        saveMutation.mutate();
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t('rooms.title', { branch: branch.name })}
            description={t('rooms.hint')}
            size='lg'
        >
            {canManage && editing === null && (
                <div className='mb-4 flex justify-end'>
                    <Button
                        variant='primary'
                        appearance='outline'
                        size='md'
                        onPress={() => startEdit('new')}
                    >
                        <Plus />
                        {t('rooms.new')}
                    </Button>
                </div>
            )}

            {editing !== null && (
                <form
                    onSubmit={handleSubmit}
                    className='border-card-border mb-4 flex flex-col gap-4 rounded-lg border p-4'
                >
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <TextInput
                            label={t('common.name')}
                            required
                            maxLength={100}
                            placeholder={t('rooms.namePlaceholder')}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <NumberInput
                            label={t('rooms.capacity')}
                            unit={t('rooms.personUnit')}
                            value={form.capacity}
                            onValueChange={(capacity) =>
                                setForm({ ...form, capacity })
                            }
                        />
                    </div>
                    {editing !== 'new' && (
                        <CheckboxInput
                            label={t('branches.activeLabel')}
                            checked={form.is_active}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_active: e.target.checked,
                                })
                            }
                        />
                    )}
                    <div className='flex justify-end gap-2'>
                        <Button
                            appearance='outline'
                            size='md'
                            onPress={() => setEditing(null)}
                            isDisabled={saveMutation.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type='submit'
                            variant='primary'
                            appearance='fill'
                            size='md'
                            isDisabled={saveMutation.isPending}
                        >
                            {t(
                                saveMutation.isPending
                                    ? 'common.saving'
                                    : 'common.save',
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {deleting && (
                <div
                    role='alertdialog'
                    className='border-alert-danger-border bg-alert-danger-background mb-4 rounded-lg border p-4'
                >
                    <p className='text-alert-danger-title text-sm'>
                        {t('rooms.deleteMessage', { name: deleting.name })}
                    </p>
                    <div className='mt-3 flex justify-end gap-2'>
                        <Button
                            appearance='outline'
                            size='sm'
                            onPress={() => setDeleting(null)}
                            isDisabled={removeMutation.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant='danger'
                            appearance='fill'
                            size='sm'
                            onPress={() => removeMutation.mutate(deleting.id)}
                            isDisabled={removeMutation.isPending}
                        >
                            {t(
                                removeMutation.isPending
                                    ? 'common.deleting'
                                    : 'common.delete',
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {query.isPending ? (
                <TableSkeleton rows={3} columns={3} />
            ) : query.error ? (
                <ErrorState error={query.error} />
            ) : query.data.length === 0 ? (
                <p className='text-text-tertiary py-4 text-center text-sm'>
                    {t('rooms.empty')}
                </p>
            ) : (
                <ul className='divide-card-border border-card-border divide-y rounded-lg border'>
                    {query.data.map((room) => (
                        <li
                            key={room.id}
                            className='flex items-center justify-between gap-3 px-4 py-3'
                        >
                            <div className='min-w-0'>
                                <p className='text-text-primary text-sm font-medium'>
                                    {room.name}
                                </p>
                                {room.capacity !== null && (
                                    <p className='text-text-tertiary text-xs tabular-nums'>
                                        {t('rooms.capacityValue', {
                                            count: room.capacity,
                                        })}
                                    </p>
                                )}
                            </div>
                            <div className='flex items-center gap-2'>
                                <ActiveBadge active={room.is_active} />
                                {canManage && (
                                    <>
                                        <Button
                                            appearance='outline'
                                            size='sm'
                                            iconOnly
                                            aria-label={t('common.edit')}
                                            onPress={() => startEdit(room)}
                                        >
                                            <Pencil1 />
                                        </Button>
                                        <Button
                                            variant='danger'
                                            appearance='outline'
                                            size='sm'
                                            iconOnly
                                            aria-label={t('common.delete')}
                                            onPress={() => {
                                                setEditing(null);
                                                setDeleting(room);
                                            }}
                                        >
                                            <Trash1 />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
}
