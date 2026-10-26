'use client';

import { Button } from '@/components/tailgrids/core/button';
import { CheckboxInput, SelectInput, TextInput } from '@/components/ui/form-field';
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
import type { Enrollment, Group, Student, Weekday } from '@/types/api';
import { fullName, toISODate } from '@/utils/format';
import { calculateLessonProration } from '@/utils/proration';
import { invalidateStudyData } from '@/utils/query-cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

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
        first_month_price:
            enrollment.first_month_price != null
                ? String(Math.round(enrollment.first_month_price))
                : '',
        left_at: enrollment.left_at ?? '',
    });

    const mutation = useMutation({
        mutationFn: () =>
            updateEnrollment(enrollment.id, {
                joined_at: form.joined_at,
                monthly_price: Number(form.monthly_price || 0),
                first_month_price:
                    form.first_month_price === ''
                        ? null
                        : Number(form.first_month_price),
                left_at: form.left_at || undefined,
            }),
        onSuccess: () => {
            invalidateStudyData(queryClient);
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
                <MoneyInput
                    label={t('students.firstMonthPrice')}
                    currency={t('common.som')}
                    hint={t('students.firstMonthHint')}
                    placeholder={form.monthly_price}
                    value={form.first_month_price}
                    onValueChange={(first_month_price) =>
                        setForm({ ...form, first_month_price })
                    }
                />
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

/** Qo'shilgan sana, oylik narx va darsbay mutanosib to'lov */
function EnrollFields({
    joinedAt,
    price,
    placeholderPrice,
    lessonDays,
    firstMonthPrice,
    isProrated,
    onChange,
}: {
    joinedAt: string;
    price: string;
    placeholderPrice?: number;
    lessonDays?: Weekday[];
    firstMonthPrice: string;
    isProrated: boolean;
    onChange: (next: {
        joinedAt: string;
        price: string;
        firstMonthPrice: string;
        isProrated: boolean;
    }) => void;
}) {
    const t = useT();
    const { formatNumber, formatPrice } = useFormat();

    const basePrice = placeholderPrice ?? 0;
    const effectiveMonthlyPrice =
        price === '' ? basePrice : Number(price || 0);

    const proration = calculateLessonProration(
        joinedAt,
        lessonDays,
        effectiveMonthlyPrice,
    );

    const isGrant = price === '0';
    const isHalf =
        basePrice > 0 && Number(price) === Math.round(basePrice * 0.5);
    const isStandard =
        price === '' || (basePrice > 0 && Number(price) === basePrice);

    return (
        <div className='flex flex-col gap-4'>
            {/* Tezkor imtiyoz / to'lov turi tugmalari */}
            {basePrice > 0 && (
                <div className='flex flex-col gap-1.5'>
                    <label className='text-text-secondary text-xs font-medium'>
                        {t('students.discountType')}
                    </label>
                    <div className='flex flex-wrap gap-2'>
                        <button
                            type='button'
                            onClick={() =>
                                onChange({
                                    joinedAt,
                                    price: '',
                                    firstMonthPrice: '',
                                    isProrated: false,
                                })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                isStandard && !isGrant && !isHalf
                                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent font-semibold ring-1 ring-brand-accent/30'
                                    : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                            }`}
                        >
                            {t('students.standardPrice')}
                        </button>

                        <button
                            type='button'
                            onClick={() =>
                                onChange({
                                    joinedAt,
                                    price: '0',
                                    firstMonthPrice: '0',
                                    isProrated: false,
                                })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                isGrant
                                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500/30'
                                    : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                            }`}
                        >
                            🎁 {t('students.grantFree')}
                        </button>

                        <button
                            type='button'
                            onClick={() =>
                                onChange({
                                    joinedAt,
                                    price: String(Math.round(basePrice * 0.5)),
                                    firstMonthPrice: '',
                                    isProrated: false,
                                })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                isHalf
                                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold ring-1 ring-indigo-500/30'
                                    : 'border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary'
                            }`}
                        >
                            🏷️ {t('students.halfPrice')}
                        </button>
                    </div>
                </div>
            )}

            <div className='grid gap-4 sm:grid-cols-2'>
                <TextInput
                    label={t('students.joinedAt')}
                    type='date'
                    required
                    value={joinedAt}
                    onChange={(e) =>
                        onChange({
                            joinedAt: e.target.value,
                            price,
                            firstMonthPrice,
                            isProrated,
                        })
                    }
                />
                <MoneyInput
                    label={t('students.monthlyPrice')}
                    currency={t('common.som')}
                    placeholder={
                        placeholderPrice === undefined
                            ? undefined
                            : formatNumber(placeholderPrice)
                    }
                    hint={
                        isGrant
                            ? t('students.grantHint')
                            : t('students.monthlyPriceHint')
                    }
                    value={price}
                    onValueChange={(next) =>
                        onChange({
                            joinedAt,
                            price: next,
                            firstMonthPrice,
                            isProrated,
                        })
                    }
                />
            </div>

            {isGrant && (
                <div className='flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400'>
                    <span>✓</span>
                    <span className='font-medium'>{t('students.grantHint')}</span>
                </div>
            )}

            {/* Oyni yarmidan kelgan bo'lsa darsbay hisob bloki */}
            {proration?.isMidMonth && !isGrant && (
                <div className='flex flex-col gap-2.5 rounded-xl border border-brand-accent/30 bg-brand-accent/5 p-3.5'>
                    <div className='flex items-center justify-between text-xs'>
                        <span className='font-semibold text-text-primary flex items-center gap-1.5'>
                            📅 {t('students.midMonthTitle')}
                        </span>
                        <span className='text-text-tertiary text-[11px]'>
                            {t('students.midMonthDesc', {
                                remaining: proration.remainingLessons,
                                passed: proration.passedLessons,
                            })}
                        </span>
                    </div>

                    <div className='pt-1'>
                        <CheckboxInput
                            label={`${t('students.firstMonthProrated')} (${formatPrice(
                                proration.suggestedFirstMonthPrice,
                                t('common.som'),
                            )})`}
                            checked={isProrated}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                onChange({
                                    joinedAt,
                                    price,
                                    isProrated: checked,
                                    firstMonthPrice: checked
                                        ? firstMonthPrice ||
                                          String(proration.suggestedFirstMonthPrice)
                                        : '',
                                });
                            }}
                        />
                    </div>

                    {isProrated && (
                        <div className='pt-1'>
                            <MoneyInput
                                label={t('students.firstMonthPrice')}
                                currency={t('common.som')}
                                value={
                                    firstMonthPrice ||
                                    String(proration.suggestedFirstMonthPrice)
                                }
                                onValueChange={(val) =>
                                    onChange({
                                        joinedAt,
                                        price,
                                        isProrated: true,
                                        firstMonthPrice: val,
                                    })
                                }
                                hint={t('students.firstMonthHint')}
                            />
                        </div>
                    )}
                </div>
            )}
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
        firstMonthPrice: '',
        isProrated: false,
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
                first_month_price:
                    fields.isProrated && fields.firstMonthPrice !== ''
                        ? Number(fields.firstMonthPrice)
                        : null,
            }),
        onSuccess: () => {
            invalidateStudyData(queryClient);
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
                    label={t('common.group')}
                    required
                    options={groups.map((group) => ({
                        value: group.id,
                        label: `${group.name} · ${group.course.name}`,
                    }))}
                    value={groupId}
                    onValueChange={(newId) => {
                        setGroupId(newId);
                        setFields((prev) => ({
                            ...prev,
                            firstMonthPrice: '',
                            isProrated: false,
                        }));
                    }}
                />
                <EnrollFields
                    joinedAt={fields.joinedAt}
                    price={fields.price}
                    placeholderPrice={selected?.price}
                    lessonDays={selected?.lesson_days}
                    firstMonthPrice={fields.firstMonthPrice}
                    isProrated={fields.isProrated}
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
        firstMonthPrice: '',
        isProrated: false,
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
                first_month_price:
                    fields.isProrated && fields.firstMonthPrice !== ''
                        ? Number(fields.firstMonthPrice)
                        : null,
            }),
        onSuccess: () => {
            invalidateStudyData(queryClient);
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
                        lessonDays={group.lesson_days}
                        firstMonthPrice={fields.firstMonthPrice}
                        isProrated={fields.isProrated}
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
