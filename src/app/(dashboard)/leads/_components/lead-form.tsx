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
import { listCourses } from '@/services/api/courses';
import { createLead, updateLead } from '@/services/api/leads';
import {
    EDITABLE_LEAD_STATUSES,
    LEAD_SOURCES,
    type Lead,
    type LeadPayload,
    type LeadSource,
} from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

type EditableStatus = NonNullable<LeadPayload['status']>;

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function LeadFormModal({
    lead,
    onClose,
}: {
    lead: Lead | null;
    onClose: () => void;
}) {
    const isEdit = lead !== null;
    const isWon = lead?.status === 'won';
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: listCourses,
    });
    const branches = branchesQuery.data ?? [];

    const [form, setForm] = useState(() => ({
        first_name: lead?.first_name ?? '',
        last_name: lead?.last_name ?? '',
        phone_number: lead?.phone_number ?? '',
        source: lead?.source ?? ('other' as LeadSource),
        status: (lead && lead.status !== 'won'
            ? lead.status
            : 'new') as EditableStatus,
        branch_id: lead?.branch?.id ?? '',
        course_id: lead?.course?.id ?? '',
        next_call_date: lead?.next_call_date
            ? lead.next_call_date.slice(0, 10)
            : '',
        note: lead?.note ?? '',
    }));

    const mutation = useMutation({
        mutationFn: () => {
            const payload: LeadPayload = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim() || null,
                phone_number: form.phone_number,
                source: form.source,
                branch_id: form.branch_id || null,
                course_id: form.course_id || null,
                next_call_date: form.next_call_date || null,
                note: form.note.trim() || null,
                // Aylantirilgan lidning holati o'zgarmaydi — yuborilmaydi.
                ...(isWon ? {} : { status: form.status }),
            };

            return lead ? updateLead(lead.id, payload) : createLead(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            toast.success(t(isEdit ? 'leads.updated' : 'leads.created'));
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
            title={t(isEdit ? 'leads.edit' : 'leads.new')}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('common.firstName')}
                        required
                        maxLength={100}
                        value={form.first_name}
                        onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('common.lastName')}
                        maxLength={100}
                        value={form.last_name}
                        onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                        }
                    />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <PhoneInput
                        label={t('common.phoneNumber')}
                        required
                        value={form.phone_number}
                        onValueChange={(phone_number) =>
                            setForm({ ...form, phone_number })
                        }
                    />
                    <SelectInput
                        label={t('leads.source')}
                        required
                        options={LEAD_SOURCES.map((source) => ({
                            value: source,
                            label: t(`leadSource.${source}`),
                        }))}
                        value={form.source}
                        onValueChange={(source) =>
                            setForm({ ...form, source: source as LeadSource })
                        }
                    />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <SelectInput
                        label={t('leads.interest')}
                        options={(coursesQuery.data ?? []).map((course) => ({
                            value: course.id,
                            label: course.name,
                        }))}
                        placeholder={t('common.notSelected')}
                        value={form.course_id}
                        onValueChange={(course_id) =>
                            setForm({ ...form, course_id })
                        }
                    />
                    {!isWon && (
                        <SelectInput
                            label={t('common.status')}
                            required
                            options={EDITABLE_LEAD_STATUSES.map((status) => ({
                                value: status,
                                label: t(`leadStatus.${status}`),
                            }))}
                            hint={t('leads.statusWonHint')}
                            value={form.status}
                            onValueChange={(status) =>
                                setForm({
                                    ...form,
                                    status: status as EditableStatus,
                                })
                            }
                        />
                    )}
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('leads.nextCallDate')}
                        type='date'
                        value={form.next_call_date}
                        onChange={(e) =>
                            setForm({ ...form, next_call_date: e.target.value })
                        }
                    />
                    {branches.length > 1 && (
                        <SelectInput
                            label={t('groups.branch')}
                            options={branches.map((branch) => ({
                                value: branch.id,
                                label: branch.name,
                            }))}
                            placeholder={t('common.notSelected')}
                            value={form.branch_id}
                            onValueChange={(branch_id) =>
                                setForm({ ...form, branch_id })
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
                            form.phone_number.length !== 13
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
