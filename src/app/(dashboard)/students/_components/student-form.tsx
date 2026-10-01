'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    SelectInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { PhoneInput } from '@/components/ui/phone-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { createStudent, updateStudent } from '@/services/api/students';
import {
    STUDENT_STATUSES,
    type Student,
    type StudentStatus,
} from '@/types/api';
import { invalidateStudyData } from '@/utils/query-cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function StudentFormModal({
    student,
    onClose,
    onCreated,
}: {
    student: Student | null;
    onClose: () => void;
    /** Yangi o'quvchi yaratilgach — masalan, uning sahifasiga o'tish uchun. */
    onCreated?: (student: Student) => void;
}) {
    const isEdit = student !== null;
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const branches = (branchesQuery.data ?? []).filter(
        (branch) => branch.is_active || branch.id === student?.branch.id,
    );

    const [form, setForm] = useState(() => ({
        branch_id: student?.branch.id ?? '',
        first_name: student?.first_name ?? '',
        last_name: student?.last_name ?? '',
        phone_number: student?.phone_number ?? '',
        parent_name: student?.parent_name ?? '',
        parent_phone: student?.parent_phone ?? '',
        birth_date: student?.birth_date ?? '',
        note: student?.note ?? '',
        status: student?.status ?? ('active' as StudentStatus),
    }));

    // Bitta filial bo'lsa, u avtomatik tanlanadi.
    const branchId =
        form.branch_id || (branches.length === 1 ? branches[0].id : '');

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                branch_id: branchId,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number || null,
                parent_name: form.parent_name.trim() || null,
                parent_phone: form.parent_phone || null,
                birth_date: form.birth_date || null,
                note: form.note.trim() || null,
                status: form.status,
            };

            return student
                ? updateStudent(student.id, payload)
                : createStudent(payload);
        },
        onSuccess: (saved) => {
            // Arxivlash o'quvchini guruhlaridan chiqaradi — balans, guruh va
            // qarzdorlar ham o'zgaradi.
            invalidateStudyData(queryClient);
            toast.success(t(isEdit ? 'students.updated' : 'students.created'));
            onClose();
            if (!isEdit) onCreated?.(saved);
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const phoneIncomplete = [form.phone_number, form.parent_phone].some(
        (phone) => phone !== '' && phone.length !== 13,
    );
    const noPhone = !form.phone_number && !form.parent_phone;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'students.edit' : 'students.new')}
            size='lg'
        >
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
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <PhoneInput
                        label={t('students.phone')}
                        value={form.phone_number}
                        onValueChange={(phone_number) =>
                            setForm({ ...form, phone_number })
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

                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('students.parentName')}
                        maxLength={150}
                        value={form.parent_name}
                        onChange={(e) =>
                            setForm({ ...form, parent_name: e.target.value })
                        }
                    />
                    <PhoneInput
                        label={t('students.parentPhone')}
                        value={form.parent_phone}
                        onValueChange={(parent_phone) =>
                            setForm({ ...form, parent_phone })
                        }
                    />
                </div>
                <p className='text-text-tertiary -mt-2 text-xs'>
                    {t('students.phoneHint')}
                </p>

                <div className='grid gap-4 sm:grid-cols-2'>
                    {branches.length > 1 || isEdit ? (
                        <SelectInput
                            label={t('groups.branch')}
                            required
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            value={branchId}
                            onValueChange={(branch_id) =>
                                setForm({ ...form, branch_id })
                            }
                        />
                    ) : null}
                    {isEdit && (
                        <SelectInput
                            label={t('common.status')}
                            required
                            options={STUDENT_STATUSES.map((status) => ({
                                value: status,
                                label: t(`studentStatus.${status}`),
                            }))}
                            hint={t('students.statusHint')}
                            value={form.status}
                            onValueChange={(status) =>
                                setForm({
                                    ...form,
                                    status: status as StudentStatus,
                                })
                            }
                        />
                    )}
                </div>

                <TextareaInput
                    label={t('common.note')}
                    maxLength={2000}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
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
                        isDisabled={
                            mutation.isPending ||
                            !branchId ||
                            noPhone ||
                            phoneIncomplete
                        }
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
