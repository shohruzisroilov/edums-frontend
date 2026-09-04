'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    SelectInput,
    TextInput,
    TextareaInput,
} from '@/components/ui/form-field';
import { MoneyInput, NumberInput } from '@/components/ui/formatted-input';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { createCourse, updateCourse } from '@/services/api/courses';
import { listEducations } from '@/services/api/educations';
import type { Course, CourseStatus } from '@/types/api';
import { COURSE_STATUSES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    description: string;
    /** '' = ko'rsatilmagan (backend null saqlaydi) */
    duration_months: string;
    price: string;
    level: string;
    status: CourseStatus;
    education_id: string;
}

const EMPTY: FormState = {
    name: '',
    description: '',
    duration_months: '',
    price: '0',
    level: '',
    status: 'active',
    education_id: '',
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function CourseFormModal({
    course,
    onClose,
}: {
    course: Course | null;
    onClose: () => void;
}) {
    const { session } = useSession();
    const t = useT();
    const toastError = useApiErrorToast();
    const isEdit = course !== null;
    const isSuperAdmin = hasRole(session, 'super_admin');

    const [form, setForm] = useState<FormState>(() =>
        course
            ? {
                  name: course.name,
                  description: course.description ?? '',
                  duration_months:
                      course.duration_months === null
                          ? ''
                          : String(course.duration_months),
                  price: String(course.price),
                  level: course.level ?? '',
                  status: course.status,
                  education_id: course.education_id,
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
                description: form.description.trim() || undefined,
                duration_months:
                    form.duration_months === ''
                        ? null
                        : Number(form.duration_months),
                price: Number(form.price) || 0,
                level: form.level.trim() || undefined,
                status: form.status,
            };

            if (course) return updateCourse(course.id, shared);

            return createCourse({
                ...shared,
                education_id: isSuperAdmin
                    ? form.education_id || undefined
                    : undefined,
            });
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
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={150}
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
                        label={t('courses.price')}
                        currency={t('common.som')}
                        value={form.price}
                        onValueChange={(price) => setForm({ ...form, price })}
                    />
                    <NumberInput
                        label={t('courses.duration')}
                        unit={t('courses.monthUnit')}
                        min={1}
                        max={120}
                        value={form.duration_months}
                        onValueChange={(duration_months) =>
                            setForm({ ...form, duration_months })
                        }
                    />
                    <TextInput
                        label={t('courses.level')}
                        maxLength={50}
                        placeholder={t('courses.levelPlaceholder')}
                        value={form.level}
                        onChange={(e) =>
                            setForm({ ...form, level: e.target.value })
                        }
                    />
                    <SelectInput
                        label={t('common.status')}
                        options={COURSE_STATUSES.map((status) => ({
                            value: status,
                            label: t(`courseStatus.${status}`),
                        }))}
                        value={form.status}
                        onValueChange={(next) =>
                            setForm({ ...form, status: next as CourseStatus })
                        }
                    />
                </div>

                {isSuperAdmin && !isEdit && (
                    <SelectInput
                        label={t('courses.education')}
                        required
                        placeholder={t('courses.selectEducation')}
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
