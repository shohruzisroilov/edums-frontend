'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    createEducationCenter,
    updateEducationCenter,
} from '@/services/api/education-centers';
import { listTariffs } from '@/services/api/tariffs';
import type {
    CreateEducationCenterPayload,
    EducationCenter,
    EducationCenterStatus,
} from '@/types/api';
import { EDUCATION_CENTER_STATUSES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    phone_number: string;
    address: string;
    telegram: string;
    instagram: string;
    status: EducationCenterStatus;
    tariff_id: string;
}

const EMPTY: FormState = {
    name: '',
    phone_number: '',
    address: '',
    telegram: '',
    instagram: '',
    status: 'active',
    tariff_id: '',
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function CenterFormModal({
    center,
    onClose,
}: {
    center: EducationCenter | null;
    onClose: () => void;
}) {
    const [form, setForm] = useState<FormState>(() =>
        center
            ? {
                  name: center.name,
                  phone_number: center.phone_number,
                  address: center.address ?? '',
                  telegram: center.telegram ?? '',
                  instagram: center.instagram ?? '',
                  status: center.status,
                  tariff_id: center.tariff_id ?? '',
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const tariffsQuery = useQuery({
        queryKey: ['tariffs', 'options'],
        queryFn: () => listTariffs({ is_active: true, limit: 200 }),
    });

    const mutation = useMutation({
        mutationFn: (payload: CreateEducationCenterPayload) =>
            center
                ? updateEducationCenter(center.id, payload)
                : createEducationCenter(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['education-centers'] });
            toast.success(t(center ? 'centers.updated' : 'centers.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        mutation.mutate({
            name: form.name.trim(),
            phone_number: form.phone_number.trim(),
            address: form.address.trim() || undefined,
            telegram: form.telegram.trim() || undefined,
            instagram: form.instagram.trim() || undefined,
            status: form.status,
            tariff_id: form.tariff_id || undefined,
        });
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t(center ? 'centers.edit' : 'centers.new')}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('common.name')}
                        required
                        maxLength={150}
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                    <PhoneInput
                        label={t('common.phoneNumber')}
                        required
                        hint={t('centers.phoneHint')}
                        value={form.phone_number}
                        onValueChange={(phone) =>
                            setForm({ ...form, phone_number: phone })
                        }
                    />
                </div>

                <TextInput
                    label={t('common.address')}
                    maxLength={255}
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('centers.telegram')}
                        maxLength={100}
                        placeholder='@markaz'
                        value={form.telegram}
                        onChange={(e) =>
                            setForm({ ...form, telegram: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('centers.instagram')}
                        maxLength={100}
                        placeholder='@markaz'
                        value={form.instagram}
                        onChange={(e) =>
                            setForm({ ...form, instagram: e.target.value })
                        }
                    />
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <SelectInput
                        label={t('common.status')}
                        options={EDUCATION_CENTER_STATUSES.map((status) => ({
                            value: status,
                            label: t(`centerStatus.${status}`),
                        }))}
                        value={form.status}
                        onValueChange={(next) =>
                            setForm({
                                ...form,
                                status: next as EducationCenterStatus,
                            })
                        }
                    />
                    <SelectInput
                        label={t('centers.tariff')}
                        placeholder={t('centers.noTariff')}
                        options={(tariffsQuery.data?.data ?? []).map(
                            (tariff) => ({
                                value: tariff.id,
                                label: tariff.name,
                            }),
                        )}
                        value={form.tariff_id}
                        onValueChange={(next) =>
                            setForm({ ...form, tariff_id: next })
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
