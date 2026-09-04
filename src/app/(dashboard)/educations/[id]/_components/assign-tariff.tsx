'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { assignEducationTariff } from '@/services/api/educations';
import { listTariffs } from '@/services/api/tariffs';
import type { Education } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Faqat ochilganda mount qilinadi. */
export function AssignTariffModal({
    education,
    onClose,
}: {
    education: Education;
    onClose: () => void;
}) {
    const [tariffId, setTariffId] = useState(
        education.current_subscription?.tariff_id ?? '',
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const tariffsQuery = useQuery({
        queryKey: ['tariffs', 'options'],
        queryFn: () => listTariffs({ is_active: true, limit: 200 }),
    });

    const mutation = useMutation({
        // Bo'sh tanlov = obunani bekor qilish (backend null qabul qiladi).
        mutationFn: () => assignEducationTariff(education.id, tariffId || null),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['education', education.id],
            });
            queryClient.invalidateQueries({
                queryKey: ['education-subscriptions', education.id],
            });
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            toast.success(t('educations.tariffAssigned'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Modal open onClose={onClose} title={t('educations.assignTariff')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <SelectInput
                    label={t('educations.tariff')}
                    placeholder={t('educations.leaveWithoutTariff')}
                    hint={t('educations.assignTariffHint')}
                    options={(tariffsQuery.data?.data ?? []).map((tariff) => ({
                        value: tariff.id,
                        label: t('educations.tariffOption', {
                            name: tariff.name,
                            days: tariff.duration_days,
                        }),
                    }))}
                    value={tariffId}
                    onValueChange={(next) => setTariffId(next)}
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
                            : t('educations.assignTariffAction')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
