'use client';

import { Button } from '@/components/tailgrids/core/button';
import { CheckboxInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { PhoneInput } from '@/components/ui/phone-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createBranch, updateBranch } from '@/services/api/branches';
import type { Branch } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function BranchFormModal({
    branch,
    onClose,
}: {
    branch: Branch | null;
    onClose: () => void;
}) {
    const isEdit = branch !== null;
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState(() => ({
        name: branch?.name ?? '',
        address: branch?.address ?? '',
        phone_number: branch?.phone_number ?? '',
        is_active: branch?.is_active ?? true,
    }));

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                // Bo'sh maydon backendda null bo'ladi.
                address: form.address.trim() || null,
                phone_number: form.phone_number || null,
                is_active: form.is_active,
            };

            return branch
                ? updateBranch(branch.id, payload)
                : createBranch(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(t(isEdit ? 'branches.updated' : 'branches.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    // Telefon ixtiyoriy, lekin boshlangan bo'lsa to'liq bo'lishi kerak.
    const phoneIncomplete =
        form.phone_number !== '' && form.phone_number.length !== 13;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'branches.edit' : 'branches.new')}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={150}
                    placeholder={t('branches.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <TextInput
                    label={t('branches.address')}
                    maxLength={255}
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                />
                <PhoneInput
                    label={t('common.phoneNumber')}
                    value={form.phone_number}
                    onValueChange={(phone_number) =>
                        setForm({ ...form, phone_number })
                    }
                />
                <CheckboxInput
                    label={t('branches.activeLabel')}
                    checked={form.is_active}
                    onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
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
                        isDisabled={mutation.isPending || phoneIncomplete}
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
