'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    TextInput,
    TextareaInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput, NumberInput } from '@/components/ui/number-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createTariff, updateTariff } from '@/services/api/tariffs';
import type { Tariff } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Raqamli maydonlar satr sifatida saqlanadi — bo'sh satr "qiymat yo'q". */
interface FormState {
    name: string;
    description: string;
    price: string;
    duration_days: string;
    max_users: string;
    sort_order: string;
    is_active: boolean;
}

const EMPTY: FormState = {
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    max_users: '',
    sort_order: '0',
    is_active: true,
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function TariffFormModal({
    tariff,
    onClose,
}: {
    tariff: Tariff | null;
    onClose: () => void;
}) {
    const isEdit = tariff !== null;
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<FormState>(() =>
        tariff
            ? {
                  name: tariff.name,
                  description: tariff.description ?? '',
                  price: String(Math.round(tariff.price)),
                  duration_days: String(tariff.duration_days),
                  max_users:
                      tariff.max_users === null ? '' : String(tariff.max_users),
                  sort_order: String(tariff.sort_order),
                  is_active: tariff.is_active,
              }
            : EMPTY,
    );

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                price: Number(form.price || 0),
                duration_days: Number(form.duration_days),
                max_users: form.max_users ? Number(form.max_users) : null,
                sort_order: Number(form.sort_order || 0),
                is_active: form.is_active,
            };

            return tariff
                ? updateTariff(tariff.id, payload)
                : createTariff(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tariffs'] });
            toast.success(t(isEdit ? 'tariffs.updated' : 'tariffs.created'));
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
            title={t(isEdit ? 'tariffs.edit' : 'tariffs.new')}
            description={isEdit ? t('tariffs.editHint') : undefined}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={100}
                    placeholder={t('tariffs.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <TextareaInput
                    label={t('common.description')}
                    maxLength={1000}
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
                <div className='grid gap-4 sm:grid-cols-2'>
                    <MoneyInput
                        label={t('tariffs.price')}
                        required
                        currency={t('common.som')}
                        value={form.price}
                        onValueChange={(price) => setForm({ ...form, price })}
                    />
                    <NumberInput
                        label={t('tariffs.duration')}
                        required
                        unit={t('tariffs.dayUnit')}
                        value={form.duration_days}
                        onValueChange={(duration_days) =>
                            setForm({ ...form, duration_days })
                        }
                    />
                    <NumberInput
                        label={t('tariffs.maxUsers')}
                        hint={t('tariffs.unlimitedHint')}
                        value={form.max_users}
                        onValueChange={(max_users) =>
                            setForm({ ...form, max_users })
                        }
                    />
                    <NumberInput
                        label={t('tariffs.sortOrder')}
                        hint={t('tariffs.sortOrderHint')}
                        value={form.sort_order}
                        onValueChange={(sort_order) =>
                            setForm({ ...form, sort_order })
                        }
                    />
                </div>
                <CheckboxInput
                    label={t('tariffs.activeLabel')}
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
                        isDisabled={mutation.isPending || !form.duration_days}
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
