'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { ImageUploadField } from '@/components/ui/image-upload';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createEducation, updateEducation } from '@/services/api/educations';
import { listTariffs } from '@/services/api/tariffs';
import type { Education, EducationStatus } from '@/types/api';
import { ENTITY_STATUSES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    phone_number: string;
    status: EducationStatus;
    logo_id: string | null;
    logo_url: string | null;
    /** Faqat yaratishda: obuna shu zahoti boshlanadi. */
    tariff_id: string;
}

const EMPTY: FormState = {
    name: '',
    phone_number: '',
    status: 'active',
    logo_id: null,
    logo_url: null,
    tariff_id: '',
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function EducationFormModal({
    education,
    onClose,
}: {
    education: Education | null;
    onClose: () => void;
}) {
    const isEdit = education !== null;

    const [form, setForm] = useState<FormState>(() =>
        education
            ? {
                  name: education.name,
                  phone_number: education.phone_number,
                  status: education.status,
                  logo_id: education.logo_id,
                  logo_url: education.logo?.url ?? null,
                  tariff_id: '',
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    // Tarif faqat yangi tashkilotda tanlanadi — keyin u alohida
    // PATCH /educations/:id/tariff orqali almashtiriladi.
    const tariffsQuery = useQuery({
        queryKey: ['tariffs', 'options'],
        queryFn: () => listTariffs({ is_active: true, limit: 200 }),
        enabled: !isEdit,
    });

    const mutation = useMutation({
        mutationFn: () => {
            const shared = {
                name: form.name.trim(),
                phone_number: form.phone_number.trim(),
                status: form.status,
                logo_id: form.logo_id,
            };

            if (education) return updateEducation(education.id, shared);

            return createEducation({
                ...shared,
                tariff_id: form.tariff_id || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            toast.success(
                t(isEdit ? 'educations.updated' : 'educations.created'),
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
            title={t(isEdit ? 'educations.edit' : 'educations.new')}
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
                        hint={t('educations.phoneHint')}
                        value={form.phone_number}
                        onValueChange={(phone) =>
                            setForm({ ...form, phone_number: phone })
                        }
                    />
                </div>

                <ImageUploadField
                    label={t('educations.logo')}
                    value={form.logo_id}
                    previewUrl={form.logo_url}
                    onChange={(logo_id, logo_url) =>
                        setForm({ ...form, logo_id, logo_url })
                    }
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                    <SelectInput
                        label={t('common.status')}
                        options={ENTITY_STATUSES.map((status) => ({
                            value: status,
                            label: t(`centerStatus.${status}`),
                        }))}
                        value={form.status}
                        onValueChange={(next) =>
                            setForm({
                                ...form,
                                status: next as EducationStatus,
                            })
                        }
                    />

                    {!isEdit && (
                        <SelectInput
                            label={t('educations.tariff')}
                            placeholder={t('educations.noTariff')}
                            options={(tariffsQuery.data?.data ?? []).map(
                                (tariff) => ({
                                    value: tariff.id,
                                    label: t('educations.tariffOption', {
                                        name: tariff.name,
                                        days: tariff.duration_days,
                                    }),
                                }),
                            )}
                            value={form.tariff_id}
                            onValueChange={(next) =>
                                setForm({ ...form, tariff_id: next })
                            }
                        />
                    )}
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
