'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { ImageUploadField } from '@/components/ui/image-upload';
import { Modal } from '@/components/ui/modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listGroups } from '@/services/api/groups';
import { createStudent, updateStudent } from '@/services/api/students';
import type { Student, StudentStatus } from '@/types/api';
import { STUDENT_STATUSES } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    first_name: string;
    last_name: string;
    phone_number: string;
    birth_date: string;
    address: string;
    parent_name: string;
    parent_phone: string;
    status: StudentStatus;
    group_id: string;
    avatar_id: string | null;
    avatar_url: string | null;
}

const EMPTY: FormState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    birth_date: '',
    address: '',
    parent_name: '',
    parent_phone: '',
    status: 'active',
    group_id: '',
    avatar_id: null,
    avatar_url: null,
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function StudentFormModal({
    student,
    onClose,
}: {
    student: Student | null;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const isEdit = student !== null;

    const [form, setForm] = useState<FormState>(() =>
        student
            ? {
                  first_name: student.first_name,
                  last_name: student.last_name,
                  phone_number: student.phone_number,
                  birth_date: student.birth_date ?? '',
                  address: student.address ?? '',
                  parent_name: student.parent_name ?? '',
                  parent_phone: student.parent_phone ?? '',
                  status: student.status,
                  group_id: student.group_id,
                  avatar_id: student.avatar_id,
                  avatar_url: student.avatar?.url ?? null,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();

    // Filial guruhdan aniqlanadi — o'quvchi doim guruhga yoziladi.
    const groupsQuery = useQuery({
        queryKey: ['groups', 'options'],
        queryFn: () => listGroups({ status: 'active', limit: 200 }),
    });

    const groups = groupsQuery.data?.data ?? [];

    const mutation = useMutation({
        mutationFn: () => {
            const shared = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number.trim(),
                birth_date: form.birth_date || undefined,
                address: form.address.trim() || undefined,
                parent_name: form.parent_name.trim() || undefined,
                parent_phone: form.parent_phone.trim() || undefined,
                status: form.status,
                avatar_id: form.avatar_id,
                group_id: form.group_id,
            };

            if (student) return updateStudent(student.id, shared);
            return createStudent(shared);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(t(isEdit ? 'students.updated' : 'students.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const noGroups = !groupsQuery.isPending && groups.length === 0;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'students.edit' : 'students.new')}
            size='lg'
        >
            {noGroups && !isEdit ? (
                <div className='flex flex-col gap-4'>
                    <p className='text-text-primary text-sm font-medium'>
                        {t('students.noGroups')}
                    </p>
                    <p className='text-text-tertiary text-sm'>
                        {t('students.noGroupsHint')}
                    </p>
                    <div className='mt-2 flex justify-end'>
                        <Button
                            appearance='outline'
                            size='md'
                            onPress={onClose}
                        >
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <TextInput
                            label={t('common.lastName')}
                            required
                            maxLength={100}
                            value={form.last_name}
                            onChange={(e) =>
                                setForm({ ...form, last_name: e.target.value })
                            }
                        />
                        <TextInput
                            label={t('common.firstName')}
                            required
                            maxLength={100}
                            value={form.first_name}
                            onChange={(e) =>
                                setForm({ ...form, first_name: e.target.value })
                            }
                        />
                        <PhoneInput
                            label={t('common.phoneNumber')}
                            required
                            value={form.phone_number}
                            onValueChange={(phone) =>
                                setForm({ ...form, phone_number: phone })
                            }
                        />
                        <TextInput
                            label={t('students.birthDate')}
                            type='date'
                            value={form.birth_date}
                            onChange={(e) =>
                                setForm({ ...form, birth_date: e.target.value })
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
                            label={t('students.parentName')}
                            maxLength={200}
                            value={form.parent_name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    parent_name: e.target.value,
                                })
                            }
                        />
                        <PhoneInput
                            label={t('students.parentPhone')}
                            value={form.parent_phone}
                            onValueChange={(phone) =>
                                setForm({ ...form, parent_phone: phone })
                            }
                        />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <SelectInput
                            label={t('students.group')}
                            required
                            placeholder={t('students.selectGroup')}
                            hint={t('students.groupHint')}
                            options={groups.map((group) => ({
                                value: group.id,
                                label: group.education_center
                                    ? `${group.name} — ${group.education_center.name}`
                                    : group.name,
                            }))}
                            value={form.group_id}
                            onValueChange={(next) =>
                                setForm({ ...form, group_id: next })
                            }
                        />
                        <SelectInput
                            label={t('common.status')}
                            options={STUDENT_STATUSES.map((status) => ({
                                value: status,
                                label: t(`studentStatus.${status}`),
                            }))}
                            value={form.status}
                            onValueChange={(next) =>
                                setForm({
                                    ...form,
                                    status: next as StudentStatus,
                                })
                            }
                        />
                    </div>

                    <ImageUploadField
                        label={t('common.avatar')}
                        value={form.avatar_id}
                        previewUrl={form.avatar_url}
                        onChange={(avatar_id, avatar_url) =>
                            setForm({ ...form, avatar_id, avatar_url })
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
            )}
        </Modal>
    );
}
