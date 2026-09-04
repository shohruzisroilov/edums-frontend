'use client';

import { Button } from '@/components/tailgrids/core/button';
import { SelectInput, TextInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { WeekdayPicker } from '@/components/ui/weekday-picker';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { listCourses } from '@/services/api/courses';
import {
    listCenterStaff,
    listEducationCenters,
} from '@/services/api/education-centers';
import { createGroup, updateGroup } from '@/services/api/groups';
import type { Group, GroupStatus, Weekday } from '@/types/api';
import { GROUP_STATUSES } from '@/types/api';
import { fullName } from '@/utils/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

interface FormState {
    name: string;
    course_id: string;
    weekdays: Weekday[];
    start_time: string;
    end_time: string;
    teacher_id: string;
    room: string;
    status: GroupStatus;
    education_center_id: string;
}

const EMPTY: FormState = {
    name: '',
    course_id: '',
    weekdays: [],
    start_time: '09:00',
    end_time: '10:30',
    teacher_id: '',
    room: '',
    status: 'active',
    education_center_id: '',
};

/** Faqat ochilganda mount qilinadi — boshlang'ich holat bir marta hisoblanadi. */
export function GroupFormModal({
    group,
    onClose,
}: {
    group: Group | null;
    onClose: () => void;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const isEdit = group !== null;

    const [form, setForm] = useState<FormState>(() =>
        group
            ? {
                  name: group.name,
                  course_id: group.course_id,
                  weekdays: [...group.weekdays],
                  start_time: group.start_time,
                  end_time: group.end_time,
                  teacher_id: group.teacher_id ?? '',
                  room: group.room ?? '',
                  status: group.status,
                  education_center_id: group.education_center_id,
              }
            : EMPTY,
    );
    const queryClient = useQueryClient();

    const coursesQuery = useQuery({
        queryKey: ['courses', 'options'],
        queryFn: () => listCourses({ status: 'active', limit: 200 }),
    });

    const centersQuery = useQuery({
        queryKey: ['education-centers', 'options'],
        queryFn: () => listEducationCenters({ limit: 200 }),
    });

    const centers = centersQuery.data?.data ?? [];

    // Filial bitta bo'lsa uni so'rashning ma'nosi yo'q — o'zi tanlanadi.
    const centerId =
        form.education_center_id ||
        (!isEdit && centers.length === 1 ? centers[0].id : '');

    /*
     * O'qituvchi shu filialga biriktirilgan bo'lishi kerak, shuning uchun
     * ro'yxat filial xodimlaridan olinadi — /staff hamma rolga ochiq emas.
     */
    const staffQuery = useQuery({
        queryKey: ['center-staff', centerId],
        queryFn: () => listCenterStaff(centerId),
        enabled: centerId !== '',
    });

    const teachers = (staffQuery.data ?? []).filter(
        (member) => member.role === 'teacher',
    );

    const mutation = useMutation({
        mutationFn: () => {
            const shared = {
                name: form.name.trim(),
                course_id: form.course_id,
                weekdays: form.weekdays,
                start_time: form.start_time,
                end_time: form.end_time,
                teacher_id: form.teacher_id || null,
                room: form.room.trim() || undefined,
                status: form.status,
            };

            if (group) return updateGroup(group.id, shared);

            return createGroup({
                ...shared,
                education_center_id: centerId || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success(t(isEdit ? 'groups.updated' : 'groups.created'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const noCourses =
        !coursesQuery.isPending && (coursesQuery.data?.data.length ?? 0) === 0;

    return (
        <Modal
            open
            onClose={onClose}
            title={t(isEdit ? 'groups.edit' : 'groups.new')}
            size='lg'
        >
            {noCourses && !isEdit ? (
                <div className='flex flex-col gap-4'>
                    <p className='text-text-primary text-sm font-medium'>
                        {t('groups.noCourses')}
                    </p>
                    <p className='text-text-tertiary text-sm'>
                        {t('groups.noCoursesHint')}
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
                            label={t('common.name')}
                            required
                            maxLength={150}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <SelectInput
                            label={t('groups.course')}
                            required
                            placeholder={t('groups.selectCourse')}
                            options={(coursesQuery.data?.data ?? []).map(
                                (course) => ({
                                    value: course.id,
                                    label: course.name,
                                }),
                            )}
                            value={form.course_id}
                            onValueChange={(next) =>
                                setForm({ ...form, course_id: next })
                            }
                        />
                    </div>

                    <WeekdayPicker
                        label={t('groups.weekdays')}
                        hint={t('groups.weekdaysHint')}
                        value={form.weekdays}
                        onChange={(weekdays) => setForm({ ...form, weekdays })}
                    />

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <TextInput
                            label={t('groups.startTime')}
                            type='time'
                            required
                            value={form.start_time}
                            onChange={(e) =>
                                setForm({ ...form, start_time: e.target.value })
                            }
                        />
                        <TextInput
                            label={t('groups.endTime')}
                            type='time'
                            required
                            value={form.end_time}
                            onChange={(e) =>
                                setForm({ ...form, end_time: e.target.value })
                            }
                        />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <SelectInput
                            label={t('groups.center')}
                            required={!isEdit}
                            disabled={isEdit}
                            placeholder={t('groups.selectCenter')}
                            hint={
                                isEdit
                                    ? t('groups.centerLockedHint')
                                    : undefined
                            }
                            options={centers.map((center) => ({
                                value: center.id,
                                label: center.name,
                            }))}
                            value={centerId}
                            onValueChange={(next) =>
                                setForm({
                                    ...form,
                                    education_center_id: next,
                                    // Boshqa filialning o'qituvchisi yaramaydi.
                                    teacher_id: '',
                                })
                            }
                        />
                        <SelectInput
                            label={t('groups.teacher')}
                            placeholder={t('groups.noTeacher')}
                            options={teachers.map((teacher) => ({
                                value: teacher.id,
                                label: fullName(teacher),
                            }))}
                            value={form.teacher_id}
                            onValueChange={(next) =>
                                setForm({ ...form, teacher_id: next })
                            }
                        />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <TextInput
                            label={t('groups.room')}
                            maxLength={50}
                            value={form.room}
                            onChange={(e) =>
                                setForm({ ...form, room: e.target.value })
                            }
                        />
                        <SelectInput
                            label={t('common.status')}
                            options={GROUP_STATUSES.map((status) => ({
                                value: status,
                                label: t(`groupStatus.${status}`),
                            }))}
                            value={form.status}
                            onValueChange={(next) =>
                                setForm({
                                    ...form,
                                    status: next as GroupStatus,
                                })
                            }
                        />
                    </div>

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
                                mutation.isPending || form.weekdays.length === 0
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
            )}
        </Modal>
    );
}
