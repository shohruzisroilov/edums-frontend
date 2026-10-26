'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    SelectInput,
    TextInput,
} from '@/components/ui/form-field';
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
import { toISODate } from '@/utils/format';
import { calculateLessonProration } from '@/utils/proration';
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
    const { formatNumber, formatPrice } = useFormat();
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
        first_month_price: '',
        is_prorated: false,
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
                first_month_price:
                    form.group_id &&
                    form.is_prorated &&
                    form.first_month_price !== ''
                        ? Number(form.first_month_price)
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
                        {form.group_id &&
                            selectedGroup &&
                            (() => {
                                const basePrice = selectedGroup.price;
                                const effectivePrice =
                                    form.monthly_price === ''
                                        ? basePrice
                                        : Number(form.monthly_price || 0);
                                const todayIso = toISODate(new Date());
                                const proration = calculateLessonProration(
                                    todayIso,
                                    selectedGroup.lesson_days,
                                    effectivePrice,
                                );
                                const isGrant = form.monthly_price === '0';
                                const isHalf =
                                    basePrice > 0 &&
                                    Number(form.monthly_price) ===
                                        Math.round(basePrice * 0.5);
                                const isStandard =
                                    form.monthly_price === '' ||
                                    (basePrice > 0 &&
                                        Number(form.monthly_price) ===
                                            basePrice);

                                return (
                                    <div className='flex flex-col gap-3'>
                                        {basePrice > 0 && (
                                            <div className='flex flex-col gap-1.5'>
                                                <label className='text-text-secondary text-xs font-medium'>
                                                    {t('students.discountType')}
                                                </label>
                                                <div className='flex flex-wrap gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                monthly_price:
                                                                    '',
                                                                first_month_price:
                                                                    '',
                                                                is_prorated: false,
                                                            })
                                                        }
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                            isStandard &&
                                                            !isGrant &&
                                                            !isHalf
                                                                ? 'border-brand-accent bg-brand-accent/10 text-brand-accent ring-brand-accent/30 font-semibold ring-1'
                                                                : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                                                        }`}
                                                    >
                                                        {t(
                                                            'students.standardPrice',
                                                        )}
                                                    </button>

                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                monthly_price:
                                                                    '0',
                                                                first_month_price:
                                                                    '0',
                                                                is_prorated: false,
                                                            })
                                                        }
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                            isGrant
                                                                ? 'border-emerald-500 bg-emerald-500/15 font-semibold text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400'
                                                                : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                                                        }`}
                                                    >
                                                        🎁{' '}
                                                        {t(
                                                            'students.grantFree',
                                                        )}
                                                    </button>

                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                monthly_price:
                                                                    String(
                                                                        Math.round(
                                                                            basePrice *
                                                                                0.5,
                                                                        ),
                                                                    ),
                                                                first_month_price:
                                                                    '',
                                                                is_prorated: false,
                                                            })
                                                        }
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                            isHalf
                                                                ? 'border-indigo-500 bg-indigo-500/15 font-semibold text-indigo-600 ring-1 ring-indigo-500/30 dark:text-indigo-400'
                                                                : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                                                        }`}
                                                    >
                                                        🏷️{' '}
                                                        {t(
                                                            'students.halfPrice',
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <MoneyInput
                                            label={t('students.monthlyPrice')}
                                            currency={t('common.som')}
                                            placeholder={formatNumber(
                                                selectedGroup.price,
                                            )}
                                            hint={
                                                isGrant
                                                    ? t('students.grantHint')
                                                    : t(
                                                          'students.monthlyPriceHint',
                                                      )
                                            }
                                            value={form.monthly_price}
                                            onValueChange={(monthly_price) =>
                                                setForm({
                                                    ...form,
                                                    monthly_price,
                                                })
                                            }
                                        />

                                        {isGrant && (
                                            <div className='flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400'>
                                                <span>✓</span>
                                                <span className='font-medium'>
                                                    {t('students.grantHint')}
                                                </span>
                                            </div>
                                        )}

                                        {proration?.isMidMonth && !isGrant && (
                                            <div className='border-brand-accent/30 bg-brand-accent/5 flex flex-col gap-2.5 rounded-xl border p-3.5'>
                                                <div className='flex items-center justify-between text-xs'>
                                                    <span className='text-text-primary flex items-center gap-1.5 font-semibold'>
                                                        📅{' '}
                                                        {t(
                                                            'students.midMonthTitle',
                                                        )}
                                                    </span>
                                                    <span className='text-text-tertiary text-[11px]'>
                                                        {t(
                                                            'students.midMonthDesc',
                                                            {
                                                                remaining:
                                                                    proration.remainingLessons,
                                                                passed: proration.passedLessons,
                                                            },
                                                        )}
                                                    </span>
                                                </div>

                                                <div className='pt-1'>
                                                    <CheckboxInput
                                                        label={`${t(
                                                            'students.firstMonthProrated',
                                                        )} (${formatPrice(
                                                            proration.suggestedFirstMonthPrice,
                                                            t('common.som'),
                                                        )})`}
                                                        checked={
                                                            form.is_prorated
                                                        }
                                                        onChange={(e) => {
                                                            const checked =
                                                                e.target
                                                                    .checked;
                                                            setForm({
                                                                ...form,
                                                                is_prorated:
                                                                    checked,
                                                                first_month_price:
                                                                    checked
                                                                        ? form.first_month_price ||
                                                                          String(
                                                                              proration.suggestedFirstMonthPrice,
                                                                          )
                                                                        : '',
                                                            });
                                                        }}
                                                    />
                                                </div>

                                                {form.is_prorated && (
                                                    <div className='pt-1'>
                                                        <MoneyInput
                                                            label={t(
                                                                'students.firstMonthPrice',
                                                            )}
                                                            currency={t(
                                                                'common.som',
                                                            )}
                                                            value={
                                                                form.first_month_price ||
                                                                String(
                                                                    proration.suggestedFirstMonthPrice,
                                                                )
                                                            }
                                                            onValueChange={(
                                                                first_month_price,
                                                            ) =>
                                                                setForm({
                                                                    ...form,
                                                                    is_prorated: true,
                                                                    first_month_price,
                                                                })
                                                            }
                                                            hint={t(
                                                                'students.firstMonthHint',
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
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
