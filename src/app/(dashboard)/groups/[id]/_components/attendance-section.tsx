'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { Button } from '@/components/tailgrids/core/button';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DetailSection } from '@/components/ui/detail';
import { Modal } from '@/components/ui/modal';
import { currentMonth, MonthSwitcher } from '@/components/ui/month-switcher';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { getGroupAttendance, markAttendance } from '@/services/api/attendance';
import {
    ATTENDANCE_STATUSES,
    type AttendanceStatus,
    type GroupAttendance,
} from '@/types/api';
import { cn } from '@/utils/cn';
import { fullName, toISODate } from '@/utils/format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<
    AttendanceStatus,
    'success' | 'error' | 'warning' | 'gray'
> = {
    present: 'success',
    absent: 'error',
    late: 'warning',
    excused: 'gray',
};

/** ISO hafta kuni (1 — dushanba … 7 — yakshanba). */
function isoWeekday(date: string): number {
    const [year, month, day] = date.split('-').map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return weekday === 0 ? 7 : weekday;
}

/**
 * Oy jurnali: qatorlar — o'quvchilar, ustunlar — dars kunlari. Sana
 * sarlavhasi bosilsa, o'sha kun belgilanadi (kelajakdagi kunlar yopiq).
 */
export function AttendanceSection({
    groupId,
    canMark,
}: {
    groupId: string;
    canMark: boolean;
}) {
    const t = useT();
    const [month, setMonth] = useState(currentMonth);
    const [marking, setMarking] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ['group-attendance', groupId, month],
        queryFn: () => getGroupAttendance(groupId, month),
    });

    const today = toISODate(new Date());

    return (
        <>
            <DetailSection
                title={t('attendance.title')}
                description={canMark ? t('attendance.hint') : undefined}
                action={<MonthSwitcher month={month} onChange={setMonth} />}
            >
                {query.isPending ? (
                    <TableSkeleton rows={3} columns={6} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.lesson_dates.length === 0 ? (
                    <EmptyState message={t('attendance.noLessons')} />
                ) : query.data.students.length === 0 ? (
                    <EmptyState message={t('attendance.noStudents')} />
                ) : (
                    <>
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='border-card-border border-b'>
                                        <th className='bg-card-background text-text-tertiary sticky left-0 px-4 py-2 text-left text-xs font-medium'>
                                            <span className='inline-block w-7'>
                                                {t('common.rowNumber')}
                                            </span>
                                            {t('common.fullName')}
                                        </th>
                                        {query.data.lesson_dates.map((date) => {
                                            const markable =
                                                canMark && date <= today;
                                            const label = (
                                                <>
                                                    <span className='block tabular-nums'>
                                                        {Number(date.slice(8))}
                                                    </span>
                                                    <span className='text-text-tertiary block text-[10px] font-normal'>
                                                        {t(
                                                            `weekday.${isoWeekday(date)}` as Parameters<
                                                                typeof t
                                                            >[0],
                                                        )}
                                                    </span>
                                                </>
                                            );

                                            return (
                                                <th
                                                    key={date}
                                                    className={cn(
                                                        'min-w-11 px-1 py-2 text-center text-xs font-semibold',
                                                        date === today &&
                                                            'text-brand-accent',
                                                    )}
                                                >
                                                    {markable ? (
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                setMarking(date)
                                                            }
                                                            className='hover:bg-card-border/40 w-full rounded-md px-1 py-0.5'
                                                        >
                                                            {label}
                                                        </button>
                                                    ) : (
                                                        label
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {query.data.students.map((row, index) => (
                                        <tr
                                            key={row.student.id}
                                            className='border-card-border border-b last:border-b-0'
                                        >
                                            <td className='bg-card-background text-text-primary sticky left-0 px-4 py-2 font-medium whitespace-nowrap'>
                                                <span className='text-text-tertiary inline-block w-7 font-normal tabular-nums'>
                                                    {index + 1}
                                                </span>
                                                {fullName(row.student)}
                                            </td>
                                            {query.data.lesson_dates.map(
                                                (date) => {
                                                    const status =
                                                        row.records[date];

                                                    return (
                                                        <td
                                                            key={date}
                                                            className='px-1 py-2 text-center'
                                                        >
                                                            {status && (
                                                                <Badge
                                                                    size='sm'
                                                                    color={
                                                                        STATUS_COLORS[
                                                                            status
                                                                        ]
                                                                    }
                                                                    title={t(
                                                                        `attendanceStatus.${status}`,
                                                                    )}
                                                                >
                                                                    {t(
                                                                        `attendanceShort.${status}`,
                                                                    )}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    );
                                                },
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Legend />
                    </>
                )}
            </DetailSection>

            {marking && query.data && (
                <MarkAttendanceModal
                    groupId={groupId}
                    date={marking}
                    register={query.data}
                    onClose={() => setMarking(null)}
                />
            )}
        </>
    );
}

function Legend() {
    const t = useT();

    return (
        <div className='border-card-border text-text-tertiary flex flex-wrap gap-4 border-t px-4 py-3 text-xs'>
            {ATTENDANCE_STATUSES.map((status) => (
                <span key={status} className='flex items-center gap-1.5'>
                    <Badge size='sm' color={STATUS_COLORS[status]}>
                        {t(`attendanceShort.${status}`)}
                    </Badge>
                    {t(`attendanceStatus.${status}`)}
                </span>
            ))}
        </div>
    );
}

/** Bir kunni belgilash: har bir o'quvchi uchun to'rtta holatdan biri. */
function MarkAttendanceModal({
    groupId,
    date,
    register,
    onClose,
}: {
    groupId: string;
    date: string;
    register: GroupAttendance;
    onClose: () => void;
}) {
    const t = useT();
    const { formatDate } = useFormat();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    // Belgilanmaganlar "keldi" bilan boshlanadi — odatda ko'pchilik keladi.
    const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
        () =>
            Object.fromEntries(
                register.students.map((row) => [
                    row.student.id,
                    row.records[date] ?? 'present',
                ]),
            ),
    );

    const mutation = useMutation({
        mutationFn: () =>
            markAttendance(groupId, {
                date,
                records: Object.entries(statuses).map(
                    ([student_id, status]) => ({ student_id, status }),
                ),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-attendance'] });
            queryClient.invalidateQueries({
                queryKey: ['student-attendance'],
            });
            toast.success(t('attendance.saved'));
            onClose();
        },
        onError: (error) => toastError(error),
    });

    return (
        <Modal
            open
            onClose={onClose}
            title={t('attendance.markTitle', { date: formatDate(date) })}
            size='lg'
        >
            <div className='mb-3 flex justify-end'>
                <Button
                    appearance='outline'
                    size='sm'
                    onPress={() =>
                        setStatuses(
                            Object.fromEntries(
                                Object.keys(statuses).map((id) => [
                                    id,
                                    'present' as AttendanceStatus,
                                ]),
                            ),
                        )
                    }
                >
                    {t('attendance.allPresent')}
                </Button>
            </div>

            <ul className='divide-card-border border-card-border divide-y rounded-lg border'>
                {register.students.map((row) => (
                    <li
                        key={row.student.id}
                        className='flex flex-wrap items-center justify-between gap-2 px-4 py-2.5'
                    >
                        <span className='text-text-primary text-sm font-medium'>
                            {fullName(row.student)}
                        </span>
                        <div
                            role='radiogroup'
                            aria-label={fullName(row.student)}
                            className='flex gap-1'
                        >
                            {ATTENDANCE_STATUSES.map((status) => {
                                const selected =
                                    statuses[row.student.id] === status;

                                return (
                                    <button
                                        key={status}
                                        type='button'
                                        role='radio'
                                        aria-checked={selected}
                                        onClick={() =>
                                            setStatuses({
                                                ...statuses,
                                                [row.student.id]: status,
                                            })
                                        }
                                        className={cn(
                                            'rounded-md border px-2.5 py-1 text-xs font-medium transition',
                                            selected
                                                ? 'bg-brand-500 border-transparent text-white'
                                                : 'border-card-border text-text-secondary hover:text-text-primary',
                                        )}
                                    >
                                        {t(`attendanceStatus.${status}`)}
                                    </button>
                                );
                            })}
                        </div>
                    </li>
                ))}
            </ul>

            <div className='mt-5 flex items-center justify-end gap-2'>
                <Button
                    appearance='outline'
                    size='md'
                    onPress={onClose}
                    isDisabled={mutation.isPending}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    variant='primary'
                    appearance='fill'
                    size='md'
                    onPress={() => mutation.mutate()}
                    isDisabled={mutation.isPending}
                >
                    {t(mutation.isPending ? 'common.saving' : 'common.save')}
                </Button>
            </div>
        </Modal>
    );
}
