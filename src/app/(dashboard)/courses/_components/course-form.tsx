'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput, NumberInput } from '@/components/ui/number-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { createCourse, updateCourse } from '@/services/api/courses';
import type { Course } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function CourseFormModal({
    course,
    onClose,
}: {
    course: Course | null;
    onClose: () => void;
}) {
    const isEdit = course !== null;
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    // Raqamli maydonlar satr sifatida — bo'sh satr "qiymat yo'q".
    const [form, setForm] = useState(() => ({
        name: course?.name ?? '',
        description: course?.description ?? '',
        price: course ? String(Math.round(course.price)) : '',
        duration_months:
            course?.duration_months == null
                ? ''
                : String(course.duration_months),
        is_active: course?.is_active ?? true,
    }));

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                price: Number(form.price || 0),
                duration_months: form.duration_months
                    ? Number(form.duration_months)
                    : null,
                is_active: form.is_active,
            };

            return course
                ? updateCourse(course.id, payload)
                : createCourse(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success(t(isEdit ? 'courses.updated' : 'courses.created'));
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
            title={t(isEdit ? 'courses.edit' : 'courses.new')}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={150}
                    placeholder={t('courses.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className='grid gap-4 sm:grid-cols-2'>
                    <MoneyInput
                        label={t('courses.price')}
                        required
                        currency={t('common.som')}
                        hint={t('courses.priceHint')}
                        value={form.price}
                        onValueChange={(price) => setForm({ ...form, price })}
                    />
                    <NumberInput
                        label={t('courses.duration')}
                        unit={t('courses.monthUnit')}
                        hint={t('courses.durationHint')}
                        value={form.duration_months}
                        onValueChange={(duration_months) =>
                            setForm({ ...form, duration_months })
                        }
                    />
                </div>
                <TextareaInput
                    label={t('common.description')}
                    maxLength={2000}
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
                <CheckboxInput
                    label={t('courses.activeLabel')}
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
                        isDisabled={mutation.isPending || form.price === ''}
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
