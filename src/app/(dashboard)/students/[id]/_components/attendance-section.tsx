'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DetailSection } from '@/components/ui/detail';
import { currentMonth, MonthSwitcher } from '@/components/ui/month-switcher';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { useFormat } from '@/hooks/use-format';
import { useUrlParam } from '@/hooks/use-url-state';
import { useT } from '@/i18n/provider';
import { getStudentAttendance } from '@/services/api/attendance';
import { ATTENDANCE_STATUSES, type AttendanceStatus } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

const STATUS_COLORS: Record<
    AttendanceStatus,
    'success' | 'error' | 'warning' | 'gray'
> = {
    present: 'success',
    absent: 'error',
    late: 'warning',
    excused: 'gray',
};

/** O'quvchi sahifasida: oy bo'yicha davomat — barcha guruhlari. */
export function StudentAttendanceSection({ studentId }: { studentId: string }) {
    const t = useT();
    const { formatDate, formatNumber } = useFormat();
    const [month, setMonth] = useUrlParam('month', currentMonth());

    const query = useQuery({
        queryKey: ['student-attendance', studentId, month],
        queryFn: () => getStudentAttendance(studentId, month),
    });

    return (
        <DetailSection
            title={t('attendance.title')}
            action={<MonthSwitcher month={month} onChange={setMonth} />}
        >
            {query.isPending ? (
                <TableSkeleton rows={2} columns={3} />
            ) : query.error ? (
                <ErrorState error={query.error} />
            ) : query.data.records.length === 0 ? (
                <EmptyState message={t('attendance.studentEmpty')} />
            ) : (
                <>
                    <div className='border-card-border flex flex-wrap gap-4 border-b px-4 py-3 text-sm'>
                        {ATTENDANCE_STATUSES.map((status) => (
                            <span
                                key={status}
                                className='flex items-center gap-1.5'
                            >
                                <Badge size='sm' color={STATUS_COLORS[status]}>
                                    {t(`attendanceStatus.${status}`)}
                                </Badge>
                                <span className='text-text-primary font-semibold tabular-nums'>
                                    {formatNumber(query.data.summary[status])}
                                </span>
                            </span>
                        ))}
                    </div>
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <RowNumberHead />
                                <TableHead>{t('cashbox.paidAt')}</TableHead>
                                <TableHead>{t('common.group')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {query.data.records.map((record, index) => (
                                <TableRow
                                    key={`${record.group.id}:${record.date}`}
                                >
                                    <RowNumberCell index={index} />
                                    <TableCell>
                                        {formatDate(record.date)}
                                    </TableCell>
                                    <TableCell>{record.group.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            size='sm'
                                            color={STATUS_COLORS[record.status]}
                                        >
                                            {t(
                                                `attendanceStatus.${record.status}`,
                                            )}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                </>
            )}
        </DetailSection>
    );
}
