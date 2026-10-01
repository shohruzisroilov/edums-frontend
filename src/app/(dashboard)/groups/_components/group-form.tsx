'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { MoneyInput } from '@/components/ui/number-input';
import { WeekdayPicker } from '@/components/ui/weekday-picker';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listBranches } from '@/services/api/branches';
import { listCourses } from '@/services/api/courses';
import { createGroup, updateGroup } from '@/services/api/groups';
import { listRooms } from '@/services/api/rooms';
import { listUserOptions } from '@/services/api/users';
import {
    GROUP_STATUSES,
    type Group,
    type GroupStatus,
    type Weekday,
} from '@/types/api';
import { fullName, toISODate } from '@/utils/format';
import { invalidateStudyData } from '@/utils/query-cache';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    course_id: string;
    branch_id: string;
    teacher_id: string;
    room_id: string;
    /** Satr — bo'sh bo'lsa kurs narxi olinadi. */
    price: string;
    start_date: string;
    end_date: string;
    lesson_days: Weekday[];
    lesson_start: string;
    lesson_end: string;
    status: GroupStatus;
}

/**
 * Faqat ochilganda mount qilinadi. Tanlov ro'yxatlarida faqat faol kurs,
 * filial va xonalar bor — tahrirlanayotgan guruhning hozirgi (nofaol bo'lib
 * qolgan) qiymati bundan mustasno: backend uni saqlab qolishga ruxsat beradi.
 */
export function GroupFormModal({
    group,
    onClose,
}: {
    group: Group | null;
    onClose: () => void;
}) {
    const isEdit = group !== null;
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: listCourses,
    });
    const branchesQuery = useQuery({
        queryKey: ['branches'],
        queryFn: listBranches,
    });
    const teachersQuery = useQuery({
        queryKey: ['user-options'],
        queryFn: listUserOptions,
    });

    const [form, setForm] = useState<FormState>(() =>
        group
            ? {
                  name: group.name,
                  course_id: group.course.id,
                  branch_id: group.branch.id,
                  teacher_id: group.teacher?.id ?? '',
                  room_id: group.room?.id ?? '',
                  price: String(Math.round(group.price)),
                  start_date: group.start_date,
                  end_date: group.end_date ?? '',
                  lesson_days: group.lesson_days,
                  lesson_start: group.lesson_start,
                  lesson_end: group.lesson_end,
                  status: group.status,
              }
            : {
                  name: '',
                  course_id: '',
                  branch_id: '',
                  teacher_id: '',
                  room_id: '',
                  price: '',
                  start_date: toISODate(new Date()),
                  end_date: '',
                  lesson_days: [],
                  lesson_start: '14:00',
                  lesson_end: '15:30',
                  status: 'active',
              },
    );

    const courses = (coursesQuery.data ?? []).filter(
        (course) => course.is_active || course.id === group?.course.id,
    );
    const branches = (branchesQuery.data ?? []).filter(
        (branch) => branch.is_active || branch.id === group?.branch.id,
    );
    // Yangi guruhda bitta filial bo'lsa, u avtomatik tanlanadi.
    const branchId =
        form.branch_id ||
        (branches.length === 1 && !isEdit ? branches[0].id : '');

    const roomsQuery = useQuery({
        queryKey: ['rooms', branchId],
        queryFn: () => listRooms({ branch_id: branchId }),
        enabled: branchId !== '',
    });

    const rooms = (roomsQuery.data ?? []).filter(
        (room) => room.is_active || room.id === group?.room?.id,
    );
    const teachers = teachersQuery.data ?? [];
    // Nofaol bo'lib qolgan o'qituvchi ro'yxatda yo'q — uni ham ko'rsatamiz.
    const teacherOptions = [
        ...(group?.teacher &&
        !teachers.some((user) => user.id === group.teacher?.id)
            ? [group.teacher]
            : []),
        ...teachers,
    ];

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                course_id: form.course_id,
                branch_id: branchId,
                teacher_id: form.teacher_id || null,
                room_id: form.room_id || null,
                price: form.price === '' ? undefined : Number(form.price),
                start_date: form.start_date,
                end_date: form.end_date || null,
                lesson_days: form.lesson_days,
                lesson_start: form.lesson_start,
                lesson_end: form.lesson_end,
                status: form.status,
            };

            return group
                ? updateGroup(group.id, payload)
                : createGroup(payload);
        },
        onSuccess: () => {
            // Tugatilgan guruh o'quvchilarini chiqaradi — balans va qarzdorlar
            // ham o'zgaradi.
            invalidateStudyData(queryClient);
            toast.success(t(isEdit ? 'groups.updated' : 'groups.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function selectCourse(course_id: string) {
        const course = courses.find((item) => item.id === course_id);
        // Narx hali yozilmagan bo'lsa — kurs narxi taklif qilinadi.
        setForm((prev) => ({
            ...prev,
            course_id,
            price:
                prev.price === '' && course
                    ? String(Math.round(course.price))
                    : prev.price,
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const incomplete =
        !form.course_id || !branchId || form.lesson_days.length === 0;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'groups.edit' : 'groups.new')}
            size='lg'
        >
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <TextInput
                    label={t('common.name')}
                    required
                    maxLength={150}
                    placeholder={t('groups.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                    <SelectInput
                        label={t('groups.course')}
                        required
                        options={courses.map((course) => ({
                            value: course.id,
                            label: course.name,
                        }))}
                        hint={
                            coursesQuery.isSuccess && courses.length === 0
                                ? t('groups.noCourses')
                                : undefined
                        }
                        value={form.course_id}
                        onValueChange={selectCourse}
                    />
                    <MoneyInput
                        label={t('groups.price')}
                        currency={t('common.som')}
                        hint={t('groups.priceHint')}
                        value={form.price}
                        onValueChange={(price) => setForm({ ...form, price })}
                    />
                </div>

                <div className='grid gap-4 sm:grid-cols-3'>
                    <SelectInput
                        label={t('groups.branch')}
                        required
                        options={branches.map((branch) => ({
                            value: branch.id,
                            label: branch.name,
                        }))}
                        value={branchId}
                        onValueChange={(branch_id) =>
                            // Xona filialga tegishli — filial o'zgarsa tanlov tushadi.
                            setForm({ ...form, branch_id, room_id: '' })
                        }
                    />
                    <SelectInput
                        label={t('groups.room')}
                        options={rooms.map((room) => ({
                            value: room.id,
                            label: room.name,
                        }))}
                        placeholder={t('groups.notAssigned')}
                        disabled={!branchId}
                        value={form.room_id}
                        onValueChange={(room_id) =>
                            setForm({ ...form, room_id })
                        }
                    />
                    <SelectInput
                        label={t('groups.teacher')}
                        options={teacherOptions.map((user) => ({
                            value: user.id,
                            label: fullName(user),
                        }))}
                        placeholder={t('groups.notAssigned')}
                        value={form.teacher_id}
                        onValueChange={(teacher_id) =>
                            setForm({ ...form, teacher_id })
                        }
                    />
                </div>

                <WeekdayPicker
                    label={t('groups.days')}
                    required
                    value={form.lesson_days}
                    onChange={(lesson_days) =>
                        setForm({ ...form, lesson_days })
                    }
                />

                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('groups.lessonStart')}
                        type='time'
                        required
                        value={form.lesson_start}
                        onChange={(e) =>
                            setForm({ ...form, lesson_start: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('groups.lessonEnd')}
                        type='time'
                        required
                        value={form.lesson_end}
                        onChange={(e) =>
                            setForm({ ...form, lesson_end: e.target.value })
                        }
                    />
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('groups.startDate')}
                        type='date'
                        required
                        value={form.start_date}
                        onChange={(e) =>
                            setForm({ ...form, start_date: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('groups.endDate')}
                        type='date'
                        hint={t('groups.endDateHint')}
                        min={form.start_date}
                        value={form.end_date}
                        onChange={(e) =>
                            setForm({ ...form, end_date: e.target.value })
                        }
                    />
                </div>

                {isEdit && (
                    <SelectInput
                        label={t('common.status')}
                        required
                        options={GROUP_STATUSES.map((status) => ({
                            value: status,
                            label: t(`groupStatus.${status}`),
                        }))}
                        hint={t('groups.statusHint')}
                        value={form.status}
                        onValueChange={(status) =>
                            setForm({ ...form, status: status as GroupStatus })
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
                        isDisabled={mutation.isPending || incomplete}
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
