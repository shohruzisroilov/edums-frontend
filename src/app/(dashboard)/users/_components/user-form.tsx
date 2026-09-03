'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    SelectInput,
    TextInput,
} from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listEducationCenters } from '@/services/api/education-centers';
import { createUser, updateUser } from '@/services/api/users';
import type { User, UserRole } from '@/types/api';
import { USER_ROLES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    role: UserRole;
    education_center_id: string;
    is_active: boolean;
}

const EMPTY: FormState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    role: 'manager',
    education_center_id: '',
    is_active: true,
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function UserFormModal({
    user,
    onClose,
}: {
    user: User | null;
    onClose: () => void;
}) {
    const isEdit = user !== null;

    const [form, setForm] = useState<FormState>(() =>
        user
            ? {
                  first_name: user.first_name,
                  last_name: user.last_name,
                  phone_number: user.phone_number,
                  password: '',
                  role: user.role,
                  education_center_id: user.education_center_id ?? '',
                  is_active: user.is_active,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options'],
        queryFn: () => listEducationCenters({ limit: 200 }),
        enabled: !isEdit,
    });

    const mutation = useMutation({
        mutationFn: () => {
            if (user) {
                // Backend PATCH /users/:id da role va markazni qabul qilmaydi.
                return updateUser(user.id, {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone_number: form.phone_number.trim(),
                    password: form.password || undefined,
                    is_active: form.is_active,
                });
            }

            return createUser({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                password: form.password,
                role: form.role,
                education_center_id: form.education_center_id || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(t(isEdit ? 'users.updated' : 'users.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'users.edit' : 'users.new')}
            description={isEdit ? t('users.editHint') : undefined}
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

                <TextInput
                    label={t('common.password')}
                    type='password'
                    required={!isEdit}
                    minLength={8}
                    maxLength={72}
                    hint={t(
                        isEdit
                            ? 'users.passwordKeepHint'
                            : 'users.passwordHint',
                    )}
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                {!isEdit && (
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <SelectInput
                            label={t('users.role')}
                            required
                            options={USER_ROLES.map((role) => ({
                                value: role,
                                label: t(`role.${role}`),
                            }))}
                            value={form.role}
                            onValueChange={(next) =>
                                setForm({
                                    ...form,
                                    role: next as UserRole,
                                })
                            }
                        />
                        <SelectInput
                            label={t('students.center')}
                            placeholder={t('common.notSelected')}
                            options={(centersQuery.data?.data ?? []).map(
                                (center) => ({
                                    value: center.id,
                                    label: center.name,
                                }),
                            )}
                            value={form.education_center_id}
                            onValueChange={(next) =>
                                setForm({
                                    ...form,
                                    education_center_id: next,
                                })
                            }
                        />
                    </div>
                )}

                {isEdit && (
                    <CheckboxInput
                        label={t('common.active')}
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
                        isDisabled={mutation.isPending}
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
