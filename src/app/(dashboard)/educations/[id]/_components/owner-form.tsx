'use client';

import { Button } from '@/components/tailgrids/core/button';
import { TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createEducationOwner } from '@/services/api/educations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const EMPTY = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
};

/** Faqat ochilganda mount qilinadi — har safar bo'sh forma bilan boshlanadi. */
export function OwnerFormModal({
    educationId,
    onClose,
}: {
    educationId: string;
    onClose: () => void;
}) {
    const [form, setForm] = useState(EMPTY);
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const mutation = useMutation({
        mutationFn: () => createEducationOwner(educationId, form),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['education-owners', educationId],
            });
            toast.success(t('educations.ownerCreated'));
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
            title={t('educations.addOwnerTitle')}
            description={t('educations.addOwnerHint')}
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

                <TextInput
                    label={t('common.password')}
                    required
                    type='password'
                    minLength={8}
                    maxLength={72}
                    hint={t('users.passwordHint')}
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

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
                            : t('common.add')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
