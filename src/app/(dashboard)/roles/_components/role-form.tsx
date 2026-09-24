'use client';

import { Button } from '@/components/tailgrids/core/button';
import { TableSkeleton, ErrorState } from '@/components/ui/data-state';
import {
    CheckboxInput,
    TextInput,
    TextareaInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listPermissions } from '@/services/api/permissions';
import { createRole, updateRole } from '@/services/api/roles';
import type { PermissionKey, Role } from '@/types/api';
import { can } from '@/utils/access';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    description: string;
    permissions: PermissionKey[];
}

/**
 * Faqat ochilganda mount qilinadi. `readOnly` — tahrirlab bo'lmaydigan rolni
 * (Owner yoki sessiya egasidan keng rol) ko'rish uchun: maydonlar bloklanadi.
 */
export function RoleFormModal({
    role,
    readOnly = false,
    onClose,
}: {
    role: Role | null;
    readOnly?: boolean;
    onClose: () => void;
}) {
    const isEdit = role !== null;
    const { session } = useSession();
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<FormState>(() => ({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions ?? [],
    }));

    const catalogQuery = useQuery({
        queryKey: ['permissions'],
        queryFn: listPermissions,
        staleTime: Infinity,
    });

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                permissions: form.permissions,
            };

            return role ? updateRole(role.id, payload) : createRole(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(t(isEdit ? 'roles.updated' : 'roles.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    /** Backend faqat o'zida bor ruxsatlarni berishga ruxsat beradi. */
    function grantable(permission: PermissionKey): boolean {
        return !readOnly && can(session, permission);
    }

    function toggle(permission: PermissionKey) {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((item) => item !== permission)
                : [...prev.permissions, permission],
        }));
    }

    /** Modul ichidagi berish mumkin bo'lgan barcha ruxsatlarni yoqadi/o'chiradi. */
    function toggleModule(permissions: PermissionKey[], select: boolean) {
        const own = permissions.filter(grantable);
        setForm((prev) => ({
            ...prev,
            permissions: select
                ? [...new Set([...prev.permissions, ...own])]
                : prev.permissions.filter((item) => !own.includes(item)),
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!readOnly) mutation.mutate();
    }

    const title = readOnly
        ? (role?.name ?? '')
        : t(isEdit ? 'roles.edit' : 'roles.new');

    return (
        <Modal
            open
            onClose={onClose}
            title={title}
            description={readOnly ? t('roles.readOnlyHint') : undefined}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {!readOnly && (
                    <>
                        <TextInput
                            label={t('common.name')}
                            required
                            maxLength={100}
                            placeholder={t('roles.namePlaceholder')}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <TextareaInput
                            label={t('common.description')}
                            maxLength={255}
                            rows={2}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                        />
                    </>
                )}

                <fieldset className='flex flex-col gap-3'>
                    <legend className='text-text-primary mb-1.5 text-sm font-medium'>
                        {t('roles.permissions')}
                    </legend>

                    {catalogQuery.isPending ? (
                        <TableSkeleton rows={3} columns={2} />
                    ) : catalogQuery.error ? (
                        <ErrorState error={catalogQuery.error} />
                    ) : (
                        catalogQuery.data.map((group) => {
                            const selected = group.permissions.filter((p) =>
                                form.permissions.includes(p),
                            );
                            const own = group.permissions.filter(grantable);
                            const allOwnSelected =
                                own.length > 0 &&
                                own.every((p) => form.permissions.includes(p));

                            return (
                                <div
                                    key={group.module}
                                    className='border-card-border rounded-xl border p-4'
                                >
                                    <div className='flex items-center justify-between gap-3'>
                                        <p className='text-text-primary text-sm font-semibold'>
                                            {t(
                                                `permissionModule.${group.module}`,
                                            )}
                                        </p>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-text-tertiary text-xs tabular-nums'>
                                                {selected.length}/
                                                {group.permissions.length}
                                            </span>
                                            {!readOnly && own.length > 0 && (
                                                <CheckboxInput
                                                    label={t('roles.selectAll')}
                                                    checked={allOwnSelected}
                                                    onChange={(e) =>
                                                        toggleModule(
                                                            group.permissions,
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                                        {group.permissions.map((permission) => {
                                            const checked =
                                                form.permissions.includes(
                                                    permission,
                                                );

                                            return (
                                                <CheckboxInput
                                                    key={permission}
                                                    label={t(
                                                        `permission.${permission}`,
                                                    )}
                                                    checked={checked}
                                                    // O'zida yo'q ruxsatni
                                                    // olib tashlash mumkin,
                                                    // qo'shish mumkin emas.
                                                    disabled={
                                                        readOnly ||
                                                        (!grantable(
                                                            permission,
                                                        ) &&
                                                            !checked)
                                                    }
                                                    onChange={() =>
                                                        toggle(permission)
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {!readOnly && !session?.is_owner && (
                        <p className='text-text-tertiary text-xs'>
                            {t('roles.ownPermissionsHint')}
                        </p>
                    )}
                </fieldset>

                <div className='mt-2 flex items-center justify-end gap-2'>
                    <Button
                        appearance='outline'
                        size='md'
                        onPress={onClose}
                        isDisabled={mutation.isPending}
                    >
                        {t(readOnly ? 'common.close' : 'common.cancel')}
                    </Button>
                    {!readOnly && (
                        <Button
                            type='submit'
                            variant='primary'
                            appearance='fill'
                            size='md'
                            isDisabled={mutation.isPending}
                        >
                            {t(
                                mutation.isPending
                                    ? 'common.saving'
                                    : 'common.save',
                            )}
                        </Button>
                    )}
                </div>
            </form>
        </Modal>
    );
}
