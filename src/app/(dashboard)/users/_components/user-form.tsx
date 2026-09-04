'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    SelectInput,
    TextInput,
} from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { ImageUploadField } from '@/components/ui/image-upload';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listEducationCenters } from '@/services/api/education-centers';
import { listEducations } from '@/services/api/educations';
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
    education_id: string;
    education_center_ids: string[];
    avatar_id: string | null;
    avatar_url: string | null;
    is_active: boolean;
}

const EMPTY: FormState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    role: 'owner',
    education_id: '',
    education_center_ids: [],
    avatar_id: null,
    avatar_url: null,
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
                  education_id: user.education_id ?? '',
                  education_center_ids: user.education_centers.map(
                      (center) => center.id,
                  ),
                  avatar_id: user.avatar_id,
                  avatar_url: user.avatar?.url ?? null,
                  is_active: user.is_active,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    // Owner butun tashkilotga biriktiriladi, qolganlari aniq filiallarga.
    const isOwner = form.role === 'owner';

    const educationsQuery = useQuery({
        queryKey: ['educations', 'options'],
        queryFn: () => listEducations({ limit: 200 }),
        enabled: !isEdit,
    });

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options', form.education_id],
        queryFn: () =>
            listEducationCenters({
                education_id: form.education_id,
                limit: 200,
            }),
        enabled: !isEdit && !isOwner && form.education_id !== '',
    });

    const centers = centersQuery.data?.data ?? [];

    const mutation = useMutation({
        mutationFn: () => {
            if (user) {
                // Backend PATCH /users/:id da role, tashkilot va filiallarni
                // qabul qilmaydi — ular boshqa endpointlar orqali yuritiladi.
                return updateUser(user.id, {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone_number: form.phone_number.trim(),
                    password: form.password || undefined,
                    avatar_id: form.avatar_id,
                    is_active: form.is_active,
                });
            }

            return createUser({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                password: form.password,
                role: form.role,
                avatar_id: form.avatar_id,
                education_id: form.education_id || undefined,
                education_center_ids: isOwner
                    ? undefined
                    : form.education_center_ids,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(t(isEdit ? 'users.updated' : 'users.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function toggleCenter(id: string) {
        setForm((prev) => ({
            ...prev,
            education_center_ids: prev.education_center_ids.includes(id)
                ? prev.education_center_ids.filter((item) => item !== id)
                : [...prev.education_center_ids, id],
        }));
    }

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
                    autoComplete='new-password'
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
                    <>
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
                                        education_center_ids: [],
                                    })
                                }
                            />
                            <SelectInput
                                label={t('users.education')}
                                required
                                placeholder={t('users.selectEducation')}
                                hint={
                                    isOwner
                                        ? t('users.educationHint')
                                        : undefined
                                }
                                options={(educationsQuery.data?.data ?? []).map(
                                    (education) => ({
                                        value: education.id,
                                        label: education.name,
                                    }),
                                )}
                                value={form.education_id}
                                onValueChange={(next) =>
                                    setForm({
                                        ...form,
                                        education_id: next,
                                        education_center_ids: [],
                                    })
                                }
                            />
                        </div>

                        {isOwner ? (
                            <p className='text-text-tertiary text-xs'>
                                {t('users.ownerCentersHint')}
                            </p>
                        ) : (
                            <fieldset className='flex flex-col gap-2'>
                                <legend className='text-text-primary mb-1.5 text-sm font-medium'>
                                    {t('users.centers')}
                                </legend>
                                {centers.length === 0 ? (
                                    <p className='text-text-tertiary text-xs'>
                                        {t('users.noCenters')}
                                    </p>
                                ) : (
                                    <div className='grid gap-2 sm:grid-cols-2'>
                                        {centers.map((center) => (
                                            <CheckboxInput
                                                key={center.id}
                                                label={center.name}
                                                checked={form.education_center_ids.includes(
                                                    center.id,
                                                )}
                                                onChange={() =>
                                                    toggleCenter(center.id)
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                                <p className='text-text-tertiary text-xs'>
                                    {t('users.centersHint')}
                                </p>
                            </fieldset>
                        )}
                    </>
                )}

                <ImageUploadField
                    label={t('common.avatar')}
                    value={form.avatar_id}
                    previewUrl={form.avatar_url}
                    onChange={(avatar_id, avatar_url) =>
                        setForm({ ...form, avatar_id, avatar_url })
                    }
                />

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
