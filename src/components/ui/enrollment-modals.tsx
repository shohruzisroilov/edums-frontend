'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/number-input';
import { SearchInput } from '@/components/ui/search-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { listGroups } from '@/services/api/groups';
import {
    enrollStudent,
    listStudents,
    updateEnrollment,
} from '@/services/api/students';
import type { Enrollment, Group, Student } from '@/types/api';
import { fullName, toISODate } from '@/utils/format';
import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/** Guruh tarkibi o'zgarganda eskiradigan hamma narsa. */
function invalidateEnrollments(queryClient: QueryClient) {
    for (const key of [
        'group-students',
        'student-enrollments',
        'groups',
        'group',
        'students',
        'student',
    ]) {
        queryClient.invalidateQueries({ queryKey: [key] });
    }
}

/**
 * O'quvchining guruhdagi davrini o'zgartirish: qo'shilgan sana, oylik narx
 * (chegirma) va chiqish sanasi. Chiqish sanasi qo'yilgach davr yopiladi —
 * qaytsa, qaytadan qo'shiladi.
 */
export function EnrollmentEditModal({
    enrollment,
    onClose,
}: {
    enrollment: Enrollment;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        joined_at: enrollment.joined_at,
        monthly_price: String(Math.round(enrollment.monthly_price)),
        left_at: enrollment.left_at ?? '',
    });

    const mutation = useMutation({
        mutationFn: () =>
            updateEnrollment(enrollment.id, {
                joined_at: form.joined_at,
                monthly_price: Number(form.monthly_price || 0),
                left_at: form.left_at || undefined,
            }),
        onSuccess: () => {
            invalidateEnrollments(queryClient);
            toast.success(
                t(
                    form.left_at && !enrollment.left_at
                        ? 'students.leftDone'
                        : 'students.updated',
                ),
            );
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
            title={`${enrollment.group.name} — ${fullName(enrollment.student)}`}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('students.joinedAt')}
                        type='date'
                        required
                        value={form.joined_at}
                        onChange={(e) =>
                            setForm({ ...form, joined_at: e.target.value })
                        }
                    />
                    <MoneyInput
                        label={t('students.monthlyPrice')}
                        required
                        currency={t('common.som')}
                        value={form.monthly_price}
                        onValueChange={(monthly_price) =>
                            setForm({ ...form, monthly_price })
                        }
                    />
                </div>
                <TextInput
                    label={t('students.leftAt')}
                    type='date'
                    min={form.joined_at}
                    // Yopilgan davr qayta ochilmaydi — sanani faqat o'zgartirish mumkin.
                    required={enrollment.left_at !== null}
                    hint={t('students.leaveHint')}
                    value={form.left_at}
                    onChange={(e) =>
                        setForm({ ...form, left_at: e.target.value })
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
                            mutation.isPending || form.monthly_price === ''
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

/** Qo'shilgan sana va oylik narx — ikkala qo'shish oynasida bir xil. */
function EnrollFields({
    joinedAt,
    price,
    placeholderPrice,
    onChange,
}: {
    joinedAt: string;
    price: string;
    placeholderPrice?: number;
    onChange: (next: { joinedAt: string; price: string }) => void;
}) {
    const t = useT();
    const { formatNumber } = useFormat();

    return (
        <div className='grid gap-4 sm:grid-cols-2'>
            <TextInput
                label={t('students.joinedAt')}
                type='date'
                required
                value={joinedAt}
                onChange={(e) => onChange({ joinedAt: e.target.value, price })}
            />
            <MoneyInput
                label={t('students.monthlyPrice')}
                currency={t('common.som')}
                placeholder={
                    placeholderPrice === undefined
                        ? undefined
                        : formatNumber(placeholderPrice)
                }
                hint={t('students.monthlyPriceHint')}
                value={price}
                onValueChange={(next) => onChange({ joinedAt, price: next })}
            />
        </div>
    );
}

/** O'quvchi sahifasidan: faol guruhlardan birini tanlab qo'shish. */
export function EnrollToGroupModal({
    student,
    currentGroupIds,
    onClose,
}: {
    student: Student;
    /** Hozir o'qiyotgan guruhlari — ro'yxatdan chiqariladi. */
    currentGroupIds: string[];
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [groupId, setGroupId] = useState('');
    const [fields, setFields] = useState({
        joinedAt: toISODate(new Date()),
        price: '',
    });

    const groupsQuery = useQuery({
        queryKey: ['groups', { status: 'active', limit: 200 }],
        queryFn: () => listGroups({ status: 'active', limit: 200 }),
    });
    const groups = (groupsQuery.data?.data ?? []).filter(
        (group) => !currentGroupIds.includes(group.id),
    );
    const selected = groups.find((group) => group.id === groupId);

    const mutation = useMutation({
        mutationFn: () =>
            enrollStudent(groupId, {
                student_id: student.id,
                joined_at: fields.joinedAt,
                monthly_price:
                    fields.price === '' ? undefined : Number(fields.price),
            }),
        onSuccess: () => {
            invalidateEnrollments(queryClient);
            toast.success(t('students.enrolled'));
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
            title={`${t('students.enroll')} — ${fullName(student)}`}
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <SelectInput
                    label={t('groups.title')}
                    required
                    options={groups.map((group) => ({
                        value: group.id,
                        label: `${group.name} · ${group.course.name}`,
                    }))}
                    value={groupId}
                    onValueChange={setGroupId}
                />
                <EnrollFields
                    joinedAt={fields.joinedAt}
                    price={fields.price}
                    placeholderPrice={selected?.price}
                    onChange={setFields}
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
                        isDisabled={mutation.isPending || !groupId}
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

/** Guruh sahifasidan: o'quvchini qidirib topib qo'shish. */
export function AddStudentToGroupModal({
    group,
    enrolledIds,
    onClose,
}: {
    group: Group;
    /** Guruhda hozir o'qiyotganlar — tanlab bo'lmaydi. */
    enrolledIds: string[];
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [picked, setPicked] = useState<Student | null>(null);
    const [fields, setFields] = useState({
        joinedAt: toISODate(new Date()),
        price: '',
    });

    const term = search.trim();
    const studentsQuery = useQuery({
        queryKey: ['students', { search: term, status: 'active', limit: 10 }],
        queryFn: () =>
            listStudents({ search: term, status: 'active', limit: 10 }),
        enabled: term.length >= 2,
    });

    const mutation = useMutation({
        mutationFn: () =>
            enrollStudent(group.id, {
                student_id: picked!.id,
                joined_at: fields.joinedAt,
                monthly_price:
                    fields.price === '' ? undefined : Number(fields.price),
            }),
        onSuccess: () => {
            invalidateEnrollments(queryClient);
            toast.success(t('students.enrolled'));
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
            title={`${t('groups.addStudent')} — ${group.name}`}
        >
            {picked === null ? (
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
                            {(studentsQuery.data?.data ?? []).map((student) => {
                                const inGroup = enrolledIds.includes(
                                    student.id,
                                );

                                return (
                                    <li
                                        key={student.id}
                                        className='flex items-center justify-between gap-3 px-4 py-2.5'
                                    >
                                        <div className='min-w-0'>
                                            <p className='text-text-primary text-sm font-medium'>
                                                {fullName(student)}
                                            </p>
                                            <p className='text-text-tertiary text-xs tabular-nums'>
                                                {student.phone_number ??
                                                    student.parent_phone}
                                            </p>
                                        </div>
                                        {inGroup ? (
                                            <span className='text-text-tertiary text-xs'>
                                                {t('groups.inGroup')}
                                            </span>
                                        ) : (
                                            <Button
                                                appearance='outline'
                                                size='sm'
                                                onPress={() =>
                                                    setPicked(student)
                                                }
                                            >
                                                {t('groups.pick')}
                                            </Button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div className='border-card-border flex items-center justify-between gap-3 rounded-lg border px-4 py-3'>
                        <p className='text-text-primary text-sm font-medium'>
                            {fullName(picked)}
                        </p>
                        <button
                            type='button'
                            className='text-text-tertiary hover:text-text-primary text-xs'
                            onClick={() => setPicked(null)}
                        >
                            {t('common.change')}
                        </button>
                    </div>
                    <EnrollFields
                        joinedAt={fields.joinedAt}
                        price={fields.price}
                        placeholderPrice={group.price}
                        onChange={setFields}
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
