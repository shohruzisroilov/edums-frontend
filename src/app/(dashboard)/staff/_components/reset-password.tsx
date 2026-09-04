'use client';

import { Button } from '@/components/tailgrids/core/button';
import { TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { resetStaffPassword } from '@/services/api/staff';
import type { User } from '@/types/api';
import { fullName } from '@/utils/format';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Faqat ochilganda mount qilinadi — parol maydoni har safar bo'sh boshlanadi. */
export function ResetPasswordModal({
    user,
    onClose,
}: {
    user: User;
    onClose: () => void;
}) {
    const [password, setPassword] = useState('');
    const t = useT();
    const toastError = useApiErrorToast();

    const mutation = useMutation({
        mutationFn: () => resetStaffPassword(user.id, password),
        onSuccess: () => {
            toast.success(t('staff.passwordReset'));
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
            title={t('staff.resetPasswordTitle')}
            description={fullName(user)}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('staff.newPassword')}
                    required
                    type='password'
                    minLength={8}
                    maxLength={72}
                    autoComplete='new-password'
                    hint={t('staff.resetPasswordHint')}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
