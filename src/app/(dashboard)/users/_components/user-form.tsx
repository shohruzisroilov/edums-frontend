'use client';

import { Button } from '@/components/tailgrids/core/button';
import { CheckboxInput, TextInput } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { ImageUploadField } from '@/components/ui/image-upload';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { createUser, updateUser } from '@/services/api/users';
import type { Role, User } from '@/types/api';
import { canGrantRole } from '@/utils/access';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    role_ids: string[];
    avatar_id: string | null;
    avatar_url: string | null;
    is_active: boolean;
}

const EMPTY: FormState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    role_ids: [],
    avatar_id: null,
    avatar_url: null,
    is_active: true,
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function UserFormModal({
    user,
    roles,
    onClose,
}: {
    user: User | null;
    /** Markazning barcha rollari — sahifa allaqachon yuklagan. */
    roles: Role[];
    onClose: () => void;
}) {
    const isEdit = user !== null;
    const { session } = useSession();
    // O'z rollari va holatini o'zgartirib bo'lmaydi — backend rad etadi.
    const isSelf = user?.id === session?.id;

    const defaultRole =
        roles.find(
            (r) =>
                r.name.toLowerCase().includes("o'qituvchi") ||
                r.name.toLowerCase().includes('teacher'),
        ) ??
        roles.find((r) => !r.is_system) ??
        roles[0];

    const [form, setForm] = useState<FormState>(() =>
        user
            ? {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  phone_number: user.phone_number,
                  password: '',
                  role_ids: user.roles.map((role) => role.id),
                  avatar_id: user.avatar_id,
                  avatar_url: user.avatar?.url ?? null,
                  is_active: user.is_active,
              }
            : {
                  ...EMPTY,
                  role_ids: defaultRole ? [defaultRole.id] : [],
              },
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const mutation = useMutation({
        mutationFn: () => {
            const profile = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                avatar_id: form.avatar_id,
            };

            if (user) {
                return updateUser(
                    user.id,
                    isSelf
                        ? profile
                        : {
                              ...profile,
                              role_ids: form.role_ids,
                              is_active: form.is_active,
                          },
                );
            }

            return createUser({
                ...profile,
                password: form.password,
                role_ids: form.role_ids,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            // O'qituvchi tanlash ro'yxati va oylik varaqasi ham xodimlardan.
            queryClient.invalidateQueries({ queryKey: ['user-options'] });
            queryClient.invalidateQueries({ queryKey: ['salary-sheet'] });
            toast.success(t(isEdit ? 'users.updated' : 'users.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function toggleRole(id: string) {
        setForm((prev) => ({
            ...prev,
            role_ids: prev.role_ids.includes(id)
                ? prev.role_ids.filter((item) => item !== id)
                : [...prev.role_ids, id],
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const noRoleSelected = !isSelf && form.role_ids.length === 0;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'users.edit' : 'users.new')}
            description={isSelf ? t('users.selfEditHint') : undefined}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('common.lastName')}
                        required
                        maxLength={100}
                        value={form.last_name}
                        onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('common.firstName')}
                        required
                        maxLength={100}
                        value={form.first_name}
                        onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                        }
                    />
                </div>

                <PhoneInput
                    label={t('common.phoneNumber')}
                    required
                    hint={t('users.loginHint')}
                    value={form.phone_number}
                    onValueChange={(phone) =>
                        setForm({ ...form, phone_number: phone })
                    }
                />

                {!isEdit && (
                    <PasswordInput
                        label={t('common.password')}
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete='new-password'
                        hint={t('users.passwordHint')}
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                )}

                {!isSelf && (
                    <fieldset className='flex flex-col gap-2'>
                        <legend className='text-text-primary mb-1.5 text-sm font-medium'>
                            {t('users.roles')}
                            <span className='text-red-500'> *</span>
                        </legend>
                        {roles.length === 0 ? (
                            <p className='text-text-tertiary text-xs'>
                                {t('users.noRoles')}
                            </p>
                        ) : (
                            <div className='grid gap-2 sm:grid-cols-2'>
                                {roles.map((role) => {
                                    const checked = form.role_ids.includes(
                                        role.id,
                                    );
                                    // Allaqachon biriktirilgan rolni olib
                                    // tashlashga ruxsat beriladi, yangisini
                                    // qo'shishga esa yo'q.
                                    const grantable = canGrantRole(
                                        session,
                                        role,
                                    );

                                    return (
                                        <CheckboxInput
                                            key={role.id}
                                            label={role.name}
                                            checked={checked}
                                            disabled={!grantable && !checked}
                                            onChange={() => toggleRole(role.id)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                        <p className='text-text-tertiary text-xs'>
                            {t('users.rolesHint')}
                        </p>
                    </fieldset>
                )}

                <ImageUploadField
                    label={t('common.avatar')}
                    value={form.avatar_id}
                    previewUrl={form.avatar_url}
                    onChange={(avatar_id, avatar_url) =>
                        setForm({ ...form, avatar_id, avatar_url })
                    }
                />

                {isEdit && !isSelf && (
                    <CheckboxInput
                        label={t('users.activeLabel')}
                        checked={form.is_active}
                        onChange={(e) =>
                            setForm({ ...form, is_active: e.target.checked })
                        }
                    />
                )}

                <div className='mt-2 flex items-center justify-end gap-2'>
                    <Button
                        appearance='outline'
                        size='md'
                        onPress={onClose}
                        isDisabled={mutation.isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={mutation.isPending || noRoleSelected}
                    >
                        {t(
                            mutation.isPending
                                ? 'common.saving'
                                : 'common.save',
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
