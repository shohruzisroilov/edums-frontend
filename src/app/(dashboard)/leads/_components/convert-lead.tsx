'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/number-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listGroups } from '@/services/api/groups';
import { convertLead } from '@/services/api/leads';
import type { Lead } from '@/types/api';
import { can } from '@/utils/access';
import { invalidateStudyData } from '@/utils/query-cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * Lidni o'quvchiga aylantirish. Guruhga qo'shish ixtiyoriy va faqat
 * students.update (hamda guruhlar ro'yxati uchun groups.view) bo'lsa
 * ko'rinadi — backend ham xuddi shunday tekshiradi.
 */
export function ConvertLeadModal({
    lead,
    onClose,
}: {
    lead: Lead;
    onClose: () => void;
}) {
    const t = useT();
    const router = useRouter();
    const { session } = useSession();
    const { formatNumber } = useFormat();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const canEnroll =
        can(session, 'students.update') && can(session, 'groups.view');

    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const groupsQuery = useQuery({
        queryKey: ['groups', { status: 'active', limit: 200 }],
        queryFn: () => listGroups({ status: 'active', limit: 200 }),
        enabled: canEnroll,
    });

    const branches = (branchesQuery.data ?? []).filter(
        (branch) => branch.is_active,
    );

    const [form, setForm] = useState({
        branch_id: lead.branch?.id ?? '',
        first_name: lead.first_name,
        last_name: lead.last_name ?? '',
        phone_number: lead.phone_number,
        parent_name: '',
        parent_phone: '',
        group_id: '',
        monthly_price: '',
    });

    const branchId =
        form.branch_id || (branches.length === 1 ? branches[0].id : '');
    // Qiziqqan kursi bo'yicha guruhlar birinchi.
    const groups = [...(groupsQuery.data?.data ?? [])].sort(
        (a, b) =>
            Number(b.course.id === lead.course?.id) -
            Number(a.course.id === lead.course?.id),
    );
    const selectedGroup = groups.find((group) => group.id === form.group_id);

    const mutation = useMutation({
        mutationFn: () =>
            convertLead(lead.id, {
                branch_id: branchId,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone_number: form.phone_number,
                parent_name: form.parent_name.trim() || null,
                parent_phone: form.parent_phone || null,
                group_id: form.group_id || undefined,
                monthly_price:
                    form.group_id && form.monthly_price !== ''
                        ? Number(form.monthly_price)
                        : undefined,
            }),
        onSuccess: (converted) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            invalidateStudyData(queryClient);
            toast.success(t('leads.converted'));
            onClose();
            if (converted.student && can(session, 'students.view')) {
                router.push(`/students/${converted.student.id}`);
            }
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

    return (
        <Modal
            open
            onClose={onClose}
            title={t('leads.convertTitle')}
            description={t('leads.convertHint')}
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
                    {branches.length > 1 && (
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
                    )}
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

                {canEnroll && (
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <SelectInput
                            label={t('leads.convertGroup')}
                            options={groups.map((group) => ({
                                value: group.id,
                                label: `${group.name} · ${group.course.name}`,
                            }))}
                            placeholder={t('leads.noGroup')}
                            value={form.group_id}
                            onValueChange={(group_id) =>
                                setForm({ ...form, group_id })
                            }
                        />
                        {form.group_id && (
                            <MoneyInput
                                label={t('students.monthlyPrice')}
                                currency={t('common.som')}
                                placeholder={
                                    selectedGroup
                                        ? formatNumber(selectedGroup.price)
                                        : undefined
                                }
                                hint={t('students.monthlyPriceHint')}
                                value={form.monthly_price}
                                onValueChange={(monthly_price) =>
                                    setForm({ ...form, monthly_price })
                                }
                            />
                        )}
                    </div>
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
                        isDisabled={
                            mutation.isPending || !branchId || phoneIncomplete
                        }
                    >
                        {t(
                            mutation.isPending
                                ? 'common.saving'
                                : 'leads.convert',
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
