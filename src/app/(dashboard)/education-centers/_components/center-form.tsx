'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    createEducationCenter,
    updateEducationCenter,
} from '@/services/api/education-centers';
import { listEducations } from '@/services/api/educations';
import type { EducationCenter, EducationCenterStatus } from '@/types/api';
import { ENTITY_STATUSES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    phone_number: string;
    address: string;
    working_hours: string;
    status: EducationCenterStatus;
    education_id: string;
}

const EMPTY: FormState = {
    name: '',
    phone_number: '',
    address: '',
    working_hours: '',
    status: 'active',
    education_id: '',
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function CenterFormModal({
    center,
    onClose,
}: {
    center: EducationCenter | null;
    onClose: () => void;
}) {
    const { session } = useSession();
    const t = useT();
    const toastError = useApiErrorToast();
    const isEdit = center !== null;

    // Tashkilotni faqat super admin tanlaydi — owner uchun tokendan olinadi.
    const isSuperAdmin = session?.role === 'super_admin';

    const [form, setForm] = useState<FormState>(() =>
        center
            ? {
                  name: center.name,
                  phone_number: center.phone_number,
                  address: center.address ?? '',
                  working_hours: center.working_hours ?? '',
                  status: center.status,
                  education_id: center.education_id,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();

    const educationsQuery = useQuery({
        queryKey: ['educations', 'options'],
        queryFn: () => listEducations({ limit: 200 }),
        enabled: isSuperAdmin && !isEdit,
    });

    const mutation = useMutation({
        mutationFn: () => {
            const shared = {
                name: form.name.trim(),
                phone_number: form.phone_number.trim(),
                address: form.address.trim() || undefined,
                working_hours: form.working_hours.trim() || undefined,
                status: form.status,
            };

            if (center) return updateEducationCenter(center.id, shared);

            return createEducationCenter({
                ...shared,
                education_id: isSuperAdmin
                    ? form.education_id || undefined
                    : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['education-centers'] });
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            toast.success(t(isEdit ? 'centers.updated' : 'centers.created'));
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
            title={t(isEdit ? 'centers.edit' : 'centers.new')}
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
                        label={t('centers.workingHours')}
                        maxLength={100}
                        placeholder={t('centers.workingHoursPlaceholder')}
                        value={form.working_hours}
                        onChange={(e) =>
                            setForm({ ...form, working_hours: e.target.value })
                        }
                    />
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
                                status: next as EducationCenterStatus,
                            })
                        }
                    />
                </div>

                {isSuperAdmin && !isEdit && (
                    <SelectInput
                        label={t('centers.education')}
                        required
                        placeholder={t('centers.selectEducation')}
                        hint={t('centers.educationRequiredHint')}
                        options={(educationsQuery.data?.data ?? []).map(
                            (education) => ({
                                value: education.id,
                                label: education.name,
                            }),
                        )}
                        value={form.education_id}
                        onValueChange={(next) =>
                            setForm({ ...form, education_id: next })
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
