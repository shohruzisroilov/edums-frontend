'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    TextInput,
    TextareaInput,
} from '@/components/ui/form-field';
import { MoneyInput, NumberInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createTariff, updateTariff } from '@/services/api/tariffs';
import type { CreateTariffPayload, Tariff } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    description: string;
    price: string;
    duration_days: string;
    /** '' = cheksiz (backend null kutadi) */
    max_students: string;
    max_teachers: string;
    is_active: boolean;
}

const EMPTY: FormState = {
    name: '',
    description: '',
    price: '0',
    duration_days: '30',
    max_students: '',
    max_teachers: '',
    is_active: true,
};

function toFormState(tariff: Tariff): FormState {
    return {
        name: tariff.name,
        description: tariff.description ?? '',
        price: String(tariff.price),
        duration_days: String(tariff.duration_days),
        max_students:
            tariff.max_students === null ? '' : String(tariff.max_students),
        max_teachers:
            tariff.max_teachers === null ? '' : String(tariff.max_teachers),
        is_active: tariff.is_active,
    };
}

/**
 * Faqat ochilganda mount qilinadi (sahifada `{open && <TariffFormModal .../>}`),
 * shuning uchun boshlang'ich holat useState ichida bir marta hisoblanadi.
 */
export function TariffFormModal({
    tariff,
    onClose,
}: {
    /** null bo'lsa — yangi tarif. */
    tariff: Tariff | null;
    onClose: () => void;
}) {
    const [form, setForm] = useState<FormState>(() =>
        tariff ? toFormState(tariff) : EMPTY,
    );
    const queryClient = useQueryClient();
    const t = useT();
    const toastError = useApiErrorToast();

    const mutation = useMutation({
        mutationFn: (payload: CreateTariffPayload) =>
            tariff ? updateTariff(tariff.id, payload) : createTariff(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tariffs'] });
            toast.success(t(tariff ? 'tariffs.updated' : 'tariffs.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        mutation.mutate({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: Number(form.price) || 0,
            duration_days: Number(form.duration_days) || 30,
            // Bo'sh maydon = cheksiz. Backend null'ni shunday tushunadi.
            max_students:
                form.max_students === '' ? null : Number(form.max_students),
            max_teachers:
                form.max_teachers === '' ? null : Number(form.max_teachers),
            is_active: form.is_active,
        });
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={t(tariff ? 'tariffs.edit' : 'tariffs.new')}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <TextareaInput
                    label={t('common.description')}
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                    <MoneyInput
                        label={t('tariffs.price')}
                        currency={t('common.som')}
                        value={form.price}
                        onValueChange={(price) => setForm({ ...form, price })}
                    />
                    <NumberInput
                        label={t('tariffs.duration')}
                        unit={t('tariffs.dayUnit')}
                        min={1}
                        max={3650}
                        value={form.duration_days}
                        onValueChange={(duration_days) =>
                            setForm({ ...form, duration_days })
                        }
                    />
                    <NumberInput
                        label={t('tariffs.maxStudentsLabel')}
                        min={1}
                        max={100000}
                        placeholder={t('common.unlimited')}
                        hint={t('tariffs.unlimitedHint')}
                        value={form.max_students}
                        onValueChange={(max_students) =>
                            setForm({ ...form, max_students })
                        }
                    />
                    <NumberInput
                        label={t('tariffs.maxTeachersLabel')}
                        min={1}
                        max={10000}
                        placeholder={t('common.unlimited')}
                        hint={t('tariffs.unlimitedHint')}
                        value={form.max_teachers}
                        onValueChange={(max_teachers) =>
                            setForm({ ...form, max_teachers })
                        }
                    />
                </div>

                <CheckboxInput
                    label={t('common.active')}
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
