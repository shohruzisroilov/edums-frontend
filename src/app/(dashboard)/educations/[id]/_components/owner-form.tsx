'use client';

import { Button } from '@/components/tailgrids/core/button';
import { CheckboxInput, TextInput } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    createEducationOwner,
    updateEducationOwner,
} from '@/services/api/educations';
import type { User } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const EMPTY = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    is_active: true,
};

/** Faqat ochilganda mount qilinadi — tahrirlashda owner ma'lumotlari bilan boshlanadi. */
export function OwnerFormModal({
    educationId,
    owner,
    onClose,
}: {
    educationId: string;
    owner?: User | null;
    onClose: () => void;
}) {
    const isEdit = Boolean(owner);
    const [form, setForm] = useState(() =>
        owner
            ? {
                  first_name: owner.first_name,
                  last_name: owner.last_name,
                  phone_number: owner.phone_number,
                  password: '',
                  is_active: owner.is_active,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const mutation = useMutation({
        mutationFn: () => {
            if (owner) {
                return updateEducationOwner(educationId, owner.id, {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone_number: form.phone_number.trim(),
                    is_active: form.is_active,
                });
            }
            return createEducationOwner(educationId, {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                password: form.password,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['education-owners', educationId],
            });
            toast.success(
                isEdit
                    ? t('educations.ownerUpdated')
                    : t('educations.ownerCreated'),
            );
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
            title={
                isEdit
                    ? t('educations.editOwnerTitle')
                    : t('educations.addOwnerTitle')
            }
            description={
                isEdit
                    ? t('educations.editOwnerHint')
                    : t('educations.addOwnerHint')
            }
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
                    hint={t('educations.ownerPhoneHint')}
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
                        hint={t('users.passwordHint')}
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                )}

                {isEdit && (
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
                        isDisabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? t('common.saving')
                            : isEdit
                              ? t('common.save')
                              : t('common.add')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
