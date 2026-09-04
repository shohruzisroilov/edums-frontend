'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { attachStaffToCenter } from '@/services/api/education-centers';
import { listStaff } from '@/services/api/staff';
import { fullName } from '@/utils/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Mavjud xodimni shu filialga ham biriktiradi. Ro'yxatdan owner va allaqachon
 * biriktirilganlar chiqarib tashlanadi — owner barcha filiallarni qamraydi.
 */
export function AttachStaffModal({
    centerId,
    educationId,
    attachedIds,
    onClose,
}: {
    centerId: string;
    educationId: string | null;
    attachedIds: string[];
    onClose: () => void;
}) {
    const [userId, setUserId] = useState('');
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const staffQuery = useQuery({
        queryKey: ['staff', 'options', educationId],
        queryFn: () =>
            listStaff({ education_id: educationId ?? undefined, limit: 200 }),
    });

    const candidates = (staffQuery.data?.data ?? []).filter(
        (user) => user.role !== 'owner' && !attachedIds.includes(user.id),
    );

    const mutation = useMutation({
        mutationFn: () => attachStaffToCenter(centerId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['center-staff', centerId],
            });
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            toast.success(t('centers.staffAttached'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (userId) mutation.mutate();
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t('centers.attachStaffTitle')}
            description={t('centers.attachStaffHint')}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <SelectInput
                    label={t('staff.title')}
                    required
                    placeholder={t('centers.selectStaff')}
                    hint={
                        candidates.length === 0 && !staffQuery.isPending
                            ? t('centers.noStaffToAttach')
                            : undefined
                    }
                    options={candidates.map((user) => ({
                        value: user.id,
                        label: `${fullName(user)} — ${t(`role.${user.role}`)}`,
                    }))}
                    value={userId}
                    onValueChange={setUserId}
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
                        isDisabled={mutation.isPending || !userId}
                    >
                        {mutation.isPending
                            ? t('common.saving')
                            : t('centers.attachAction')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
