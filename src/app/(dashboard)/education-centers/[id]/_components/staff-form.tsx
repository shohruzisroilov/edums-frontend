'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { createCenterStaff } from '@/services/api/education-centers';
import type { CenterStaffRole } from '@/types/api';
import { CENTER_STAFF_ROLES } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const EMPTY = {
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    role: 'teacher' as CenterStaffRole,
};

/** Faqat ochilganda mount qilinadi — har safar bo'sh forma bilan boshlanadi. */
export function CenterStaffFormModal({
    centerId,
    onClose,
}: {
    centerId: string;
    onClose: () => void;
}) {
    const [form, setForm] = useState(EMPTY);
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();
    const { session } = useSession();

    // Manager faqat administrator va teacher qo'sha oladi.
    const roles: CenterStaffRole[] = hasRole(session, 'manager')
        ? CENTER_STAFF_ROLES.filter((role) => role !== 'manager')
        : [...CENTER_STAFF_ROLES];

    const mutation = useMutation({
        mutationFn: () =>
            createCenterStaff(centerId, {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                password: form.password,
                role: form.role,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['center-staff', centerId],
            });
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            toast.success(t('centers.staffCreated'));
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
            title={t('centers.addStaffTitle')}
            description={t('centers.addStaffHint')}
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
                    hint={t('centers.staffPhoneHint')}
                    value={form.phone_number}
                    onValueChange={(phone) =>
                        setForm({ ...form, phone_number: phone })
                    }
                />

                <div className='grid gap-4 sm:grid-cols-2'>
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
                    <SelectInput
                        label={t('staff.role')}
                        required
                        options={roles.map((role) => ({
                            value: role,
                            label: t(`role.${role}`),
                        }))}
                        value={form.role}
                        onValueChange={(next) =>
                            setForm({ ...form, role: next as CenterStaffRole })
                        }
                    />
                </div>

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
