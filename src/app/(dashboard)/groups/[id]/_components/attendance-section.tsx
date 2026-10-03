'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { Button } from '@/components/tailgrids/core/button';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DetailSection } from '@/components/ui/detail';
import { SelectInput } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { currentMonth, MonthSwitcher } from '@/components/ui/month-switcher';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { ATTENDANCE_PARAM, useOpenOnNewParam } from '@/hooks/use-new-param';
import { useFormat } from '@/hooks/use-format';
import { useUrlParam } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import { getGroupAttendance, markAttendance } from '@/services/api/attendance';
import {
    ATTENDANCE_STATUSES,
    type AttendanceStatus,
    type GroupAttendance,
} from '@/types/api';
import { wasInGroupOn } from '@/utils/attendance';
import { cn } from '@/utils/cn';
import { fullName, toISODate } from '@/utils/format';
import { CheckCircle1 } from '@tailgrids/icons';
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
    const { formatDate } = useFormat();
    const [month, setMonth] = useUrlParam('month', currentMonth());
    const [marking, setMarking] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ['group-attendance', groupId, month],
        queryFn: () => getGroupAttendance(groupId, month),
    });

    const today = toISODate(new Date());
    const isCurrentMonth = month === currentMonth();
    const lessonDates = query.data?.lesson_dates ?? [];
    const students = query.data?.students ?? [];

    // Tugma belgilaydigan kun: bugun dars bo'lsa — bugun, bo'lmasa shu
    // oydagi oxirgi o'tgan dars (o'qituvchi kechroq kiritayotgan bo'lishi
    // mumkin). Boshqa oylar — faqat sana ustiga bosib.
    const target = isCurrentMonth
        ? lessonDates.includes(today)
            ? today
            : (lessonDates.findLast((date) => date < today) ?? null)
        : null;

    // O'tgan, lekin hech kimga belgi qo'yilmagan darslar — jurnalda ajraladi.
    const unmarked = new Set(
        lessonDates.filter(
            (date) =>
                date <= today && !students.some((row) => row.records[date]),
        ),
    );

    // Dashboard va sarlavhadagi "Davomat qilish" — `?attendance=1`.
    useOpenOnNewParam(
        () => {
            if (target) setMarking(target);
            else toast.info(t('attendance.nothingToMark'));
        },
        canMark && query.isSuccess && isCurrentMonth,
        ATTENDANCE_PARAM,
    );

    return (
        <>
            <DetailSection
                title={t('attendance.title')}
                description={canMark ? t('attendance.hint') : undefined}
                action={
                    <div className='flex flex-wrap items-center gap-2'>
                        {canMark && target && (
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setMarking(target)}
                            >
                                <CheckCircle1 />
                                {target === today
                                    ? t('attendance.markToday')
                                    : t('attendance.markDate', {
                                          date: formatDate(target),
                                      })}
                            </Button>
                        )}
                        <MonthSwitcher month={month} onChange={setMonth} />
                    </div>
                }
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
                                                    {unmarked.has(date) && (
                                                        <span
                                                            title={t(
                                                                'attendance.unmarked',
                                                            )}
                                                            className='bg-badge-warning-text mx-auto mt-0.5 block size-1.5 rounded-full'
                                                        >
                                                            <span className='sr-only'>
                                                                {t(
                                                                    'attendance.unmarked',
                                                                )}
                                                            </span>
                                                        </span>
                                                    )}
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
                                                    const lessons =
                                                        row.records[date];
                                                    // Guruhga kelmasidan oldingi
                                                    // yoki ketgandan keyingi kun.
                                                    const outside =
                                                        (!lessons ||
                                                            lessons.length ===
                                                                0) &&
                                                        !wasInGroupOn(
                                                            row,
                                                            date,
                                                        );

                                                    return (
                                                        <td
                                                            key={date}
                                                            className='text-text-tertiary px-1 py-2 text-center align-top'
                                                        >
                                                            {outside && '·'}
                                                            {lessons?.map(
                                                                (lesson, i) => (
                                                                    <Badge
                                                                        key={i}
                                                                        size='sm'
                                                                        color={
                                                                            STATUS_COLORS[
                                                                                lesson
                                                                                    .status
                                                                            ]
                                                                        }
                                                                        title={t(
                                                                            `attendanceStatus.${lesson.status}`,
                                                                        )}
                                                                        className={cn(
                                                                            i >
                                                                                0 &&
                                                                                'mt-1',
                                                                        )}
                                                                    >
                                                                        {t(
                                                                            `attendanceShort.${lesson.status}`,
                                                                        )}
                                                                    </Badge>
                                                                ),
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

/** Kuniga nechta dars alohida belgilanishi mumkin. */
const LESSON_ORDERS = [1, 2, 3];

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

    // Faqat shu kuni guruhda bo'lganlar: oy o'rtasida kelgan yoki ketgan
    // o'quvchi boshqa kunlarga belgilanmaydi — backend buni rad etadi.
    const rows = register.students.filter((row) => wasInGroupOn(row, date));

    const [lessonOrder, setLessonOrder] = useState<number>(1);

    // Belgilanmaganlar "keldi" bilan boshlanadi — odatda ko'pchilik keladi.
    const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
        () =>
            Object.fromEntries(
                rows.map((row) => [
                    row.student.id,
                    row.records[date]?.find((r) => r.order === 1)?.status ??
                        'present',
                ]),
            ),
    );

    const handleLessonOrderChange = (newOrder: number) => {
        setLessonOrder(newOrder);
        setStatuses(
            Object.fromEntries(
                rows.map((row) => [
                    row.student.id,
                    row.records[date]?.find((r) => r.order === newOrder)
                        ?.status ?? 'present',
                ]),
            ),
        );
    };

    const mutation = useMutation({
        mutationFn: () =>
            markAttendance(groupId, {
                date,
                lesson_order: lessonOrder,
                records: Object.entries(statuses).map(
                    ([student_id, status]) => ({ student_id, status }),
                ),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-attendance'] });
            queryClient.invalidateQueries({
                queryKey: ['student-attendance'],
            });
            // Dashboard'dagi "bugungi darslar" va davomat foizi.
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
            <div className='mb-3 flex flex-wrap items-end justify-between gap-3'>
                <div className='w-40'>
                    <SelectInput
                        label={t('attendance.lessonOrder')}
                        options={LESSON_ORDERS.map((order) => ({
                            value: String(order),
                            label: t('attendance.lessonN', { n: order }),
                        }))}
                        value={String(lessonOrder)}
                        onValueChange={(next) =>
                            handleLessonOrderChange(Number(next))
                        }
                    />
                </div>
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

            <ul className='divide-card-border border-card-border divide-y overflow-hidden rounded-xl border'>
                {rows.map((row) => (
                    <li
                        key={row.student.id}
                        className='hover:bg-background-gray-primary/20 flex flex-col justify-between gap-2.5 p-3.5 transition-colors sm:flex-row sm:items-center sm:px-4 sm:py-3'
                    >
                        <span className='text-text-primary truncate text-sm font-semibold'>
                            {fullName(row.student)}
                        </span>
                        <div
                            role='radiogroup'
                            aria-label={fullName(row.student)}
                            className='grid w-full grid-cols-4 gap-1.5 sm:flex sm:w-auto'
                        >
                            {ATTENDANCE_STATUSES.map((status) => {
                                const selected =
                                    statuses[row.student.id] === status;

                                const activeColor =
                                    status === 'present'
                                        ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                                        : status === 'absent'
                                          ? 'bg-rose-600 text-white border-transparent shadow-xs'
                                          : status === 'late'
                                            ? 'bg-amber-600 text-white border-transparent shadow-xs'
                                            : 'bg-slate-600 text-white border-transparent shadow-xs';

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
                                            'rounded-lg border px-2 py-2 text-center text-xs font-semibold transition active:scale-95 sm:px-2.5 sm:py-1',
                                            selected
                                                ? activeColor
                                                : 'border-card-border bg-card-surface-area text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary',
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
                    isDisabled={mutation.isPending || rows.length === 0}
                >
                    {t(mutation.isPending ? 'common.saving' : 'common.save')}
                </Button>
            </div>
        </Modal>
    );
}
