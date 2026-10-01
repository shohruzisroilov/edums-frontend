'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    SelectInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/number-input';
import { ReceiptModal } from '@/components/ui/receipt-modal';
import { SearchInput } from '@/components/ui/search-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { listStudents } from '@/services/api/students';
import { listGroups } from '@/services/api/groups';
import {
    createStudentPayment,
    getStudentBalance,
} from '@/services/api/student-payments';
import {
    PAYMENT_METHODS,
    type PaymentMethod,
    type PersonRef,
} from '@/types/api';
import { fullName, toISODate } from '@/utils/format';
import { invalidateStudyData } from '@/utils/query-cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * To'lov qabul qilish. O'quvchi berilmasa — qidirib tanlanadi (GET /students,
 * students.view kerak). Guruhlar o'quvchi balansidan va markazning aktiv
 * guruhlaridan olinadi. O'quvchi kirmagan guruh tanlansa, to'lov bilan birga
 * avtomatik a'zo qilinadi.
 */
export function PaymentModal({
    student: initialStudent,
    groupId: initialGroupId,
    amount: initialAmount,
    onClose,
}: {
    student?: PersonRef;
    groupId?: string;
    /** Taklif qilinadigan summa — masalan, qarzdorlar ro'yxatidagi qarz. */
    amount?: number;
    onClose: () => void;
}) {
    const t = useT();
    const { formatPrice } = useFormat();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [student, setStudent] = useState<PersonRef | null>(
        initialStudent ?? null,
    );
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        group_id: initialGroupId ?? '',
        amount: initialAmount ? String(Math.round(initialAmount)) : '',
        method: 'cash' as PaymentMethod,
        paid_at: toISODate(new Date()),
        note: '',
    });

    const term = search.trim();
    const studentsQuery = useQuery({
        queryKey: ['students', { search: term, limit: 10 }],
        queryFn: () => listStudents({ search: term, limit: 10 }),
        enabled: student === null && term.length >= 2,
    });

    const balanceQuery = useQuery({
        queryKey: ['student-balance', student?.id],
        queryFn: () => getStudentBalance(student!.id),
        enabled: student !== null,
    });
    const groups = balanceQuery.data?.groups ?? [];

    const allGroupsQuery = useQuery({
        queryKey: ['groups', { status: 'active', limit: 200 }],
        queryFn: () => listGroups({ status: 'active', limit: 200 }),
    });
    const allGroups = allGroupsQuery.data?.data ?? [];

    const enrolledGroupIds = new Set(groups.map((item) => item.group.id));

    const groupOptions = [
        ...groups.map((item) => ({
            value: item.group.id,
            label:
                item.balance < 0
                    ? `${item.group.name} · ${t('cashbox.groupDebt', { amount: formatPrice(-item.balance, t('common.som')) })}`
                    : item.group.name,
        })),
        ...allGroups
            .filter((g) => !enrolledGroupIds.has(g.id))
            .map((g) => ({
                value: g.id,
                label: g.name,
            })),
    ];

    const [receiptData, setReceiptData] = useState<{
        studentName: string;
        groupName: string;
        amount: number;
        method: string;
        date: string;
    } | null>(null);

    const mutation = useMutation({
        mutationFn: () =>
            createStudentPayment({
                student_id: student!.id,
                group_id: form.group_id,
                amount: Number(form.amount),
                method: form.method,
                paid_at: form.paid_at,
                note: form.note.trim() || null,
            }),
        onSuccess: () => {
            // Kirmagan guruh uchun to'lov o'quvchini o'sha guruhga ham qo'shadi.
            invalidateStudyData(queryClient);
            toast.success(t('cashbox.created'));

            const enrolledGrp = groups.find(
                (g) => g.group.id === form.group_id,
            );
            const otherGrp = allGroups.find((g) => g.id === form.group_id);
            const groupName =
                enrolledGrp?.group.name ?? otherGrp?.name ?? t('common.group');

            setReceiptData({
                studentName: student ? fullName(student) : '',
                groupName,
                amount: Number(form.amount),
                method: t(`paymentMethod.${form.method}`),
                date: form.paid_at,
            });
        },
        onError: (error) => toastError(error),
    });

    function selectGroup(group_id: string) {
        const balance = groups.find((item) => item.group.id === group_id);
        setForm((prev) => ({
            ...prev,
            group_id,
            // Qarz bo'lsa — summa shu qarz bilan taklif qilinadi.
            amount:
                balance && balance.balance < 0
                    ? String(Math.round(-balance.balance))
                    : prev.amount,
        }));
    }

    // Guruh bitta bo'lsa, tanlashga hojat yo'q — qarzi bilan darhol to'ladi.
    const [autoPicked, setAutoPicked] = useState(false);
    if (!autoPicked && groupOptions.length === 1 && !form.group_id) {
        setAutoPicked(true);
        selectGroup(groupOptions[0].value);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Modal
            open
            onClose={onClose}
            title={
                student
                    ? `${t('cashbox.new')} — ${fullName(student)}`
                    : t('cashbox.new')
            }
        >
            {student === null ? (
                <div className='flex flex-col gap-3'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('groups.searchStudent')}
                    />
                    {term.length < 2 ? (
                        <p className='text-text-tertiary text-xs'>
                            {t('groups.searchStudentHint')}
                        </p>
                    ) : studentsQuery.data?.data.length === 0 ? (
                        <p className='text-text-tertiary py-2 text-sm'>
                            {t('students.empty')}
                        </p>
                    ) : (
                        <ul className='divide-card-border border-card-border divide-y rounded-lg border'>
                            {(studentsQuery.data?.data ?? []).map((item) => (
                                <li
                                    key={item.id}
                                    className='flex items-center justify-between gap-3 px-4 py-2.5'
                                >
                                    <div className='min-w-0'>
                                        <p className='text-text-primary text-sm font-medium'>
                                            {fullName(item)}
                                        </p>
                                        <p className='text-text-tertiary text-xs'>
                                            {item.groups
                                                .map((group) => group.name)
                                                .join(', ') ||
                                                t('students.noGroups')}
                                        </p>
                                    </div>
                                    <Button
                                        appearance='outline'
                                        size='sm'
                                        onPress={() => setStudent(item)}
                                    >
                                        {t('groups.pick')}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <SelectInput
                        label={t('common.group')}
                        required
                        options={groupOptions}
                        hint={
                            groupOptions.length === 0
                                ? t('cashbox.noGroups')
                                : t('cashbox.groupHint')
                        }
                        value={form.group_id}
                        onValueChange={selectGroup}
                    />
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <MoneyInput
                            label={t('cashbox.amount')}
                            required
                            currency={t('common.som')}
                            value={form.amount}
                            onValueChange={(next) =>
                                setForm({ ...form, amount: next })
                            }
                        />
                        <SelectInput
                            label={t('cashbox.method')}
                            required
                            options={PAYMENT_METHODS.map((method) => ({
                                value: method,
                                label: t(`paymentMethod.${method}`),
                            }))}
                            value={form.method}
                            onValueChange={(method) =>
                                setForm({
                                    ...form,
                                    method: method as PaymentMethod,
                                })
                            }
                        />
                    </div>
                    <TextInput
                        label={t('cashbox.paidAt')}
                        type='date'
                        required
                        value={form.paid_at}
                        onChange={(e) =>
                            setForm({ ...form, paid_at: e.target.value })
                        }
                    />
                    <TextareaInput
                        label={t('common.note')}
                        maxLength={500}
                        rows={2}
                        value={form.note}
                        onChange={(e) =>
                            setForm({ ...form, note: e.target.value })
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
                            isDisabled={
                                mutation.isPending ||
                                !form.group_id ||
                                !Number(form.amount)
                            }
                        >
                            {t(
                                mutation.isPending
                                    ? 'common.saving'
                                    : 'cashbox.new',
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {receiptData && (
                <ReceiptModal
                    open={Boolean(receiptData)}
                    receiptData={receiptData}
                    onClose={onClose}
                />
            )}
        </Modal>
    );
}
