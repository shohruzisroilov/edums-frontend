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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * To'lov qabul qilish. O'quvchi berilmasa — qidirib tanlanadi (GET /students,
 * students.view kerak). Guruhlar o'quvchi balansidan olinadi — har biri
 * yonida qarzi ko'rinadi va guruh tanlanganda summa qarz bilan to'ladi.
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
            for (const key of [
                'students',
                'student-payments',
                'student-balance',
                'debtors',
                'dashboard',
            ]) {
                queryClient.invalidateQueries({ queryKey: [key] });
            }
            toast.success(t('cashbox.created'));

            const selectedGrp = groups.find((g) => g.group.id === form.group_id);
            setReceiptData({
                studentName: student ? fullName(student) : '',
                groupName: selectedGrp ? selectedGrp.group.name : 'Guruh',
                amount: Number(form.amount),
                method: t(`paymentMethod.${form.method}` as any) || form.method,
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
    // Balans kelgan renderning o'zida bir marta (effekt emas: qo'shimcha
    // render va summaning bir lahza bo'sh ko'rinishi bo'lmaydi).
    const [autoPicked, setAutoPicked] = useState(false);
    if (!autoPicked && groups.length === 1 && !form.group_id) {
        setAutoPicked(true);
        selectGroup(groups[0].group.id);
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
                        options={groups.map((item) => ({
                            value: item.group.id,
                            label:
                                item.balance < 0
                                    ? `${item.group.name} · ${t('cashbox.groupDebt', { amount: formatPrice(-item.balance, t('common.som')) })}`
                                    : item.group.name,
                        }))}
                        hint={
                            balanceQuery.isSuccess && groups.length === 0
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
