'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { AccessGuard } from '@/components/ui/access-guard';
import {
    ColumnChart,
    HorizontalBars,
    Meter,
    monthColumns,
    StatTile,
    useCompactNumber,
} from '@/components/ui/charts';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { useFormat } from '@/hooks/use-format';
import { ATTENDANCE_PARAM } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getDashboard } from '@/services/api/reports';
import { LEAD_STATUSES } from '@/types/api';
import { can, canAny } from '@/utils/access';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GettingStarted } from './_components/getting-started';

export default function DashboardPage() {
    return (
        <AccessGuard allow={(session) => canAny(session, 'reports.view', 'reports.view_own')}>
            <DashboardView />
        </AccessGuard>
    );
}

function DashboardView() {
    const t = useT();
    const { formatPrice, formatNumber } = useFormat();
    const compact = useCompactNumber();
    const { session } = useSession();
    const som = t('common.som');

    const query = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

    if (query.isPending) return <TableSkeleton rows={4} columns={4} />;
    if (query.error) return <ErrorState error={query.error} />;

    const data = query.data;
    const isOwner = can(session, 'reports.view');
    const canOpenGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canMarkAttendance =
        canOpenGroups &&
        can(session, 'attendance.view') &&
        can(session, 'attendance.mark');

    return (
        <>
            <PageHeader
                title={t('dashboard.title')}
                description={
                    session?.education?.name ?? t('dashboard.subtitle')
                }
            />

            <GettingStarted setup={data.setup} />

            <div className='grid grid-cols-2 gap-3.5 px-4 sm:gap-4 sm:px-5 xl:grid-cols-4'>
                <StatTile
                    label={t('dashboard.activeStudents')}
                    value={formatNumber(data.students.active)}
                    href='/students'
                    hint={t('dashboard.joinedLeft', {
                        joined: data.students.joined_this_month,
                        left: data.students.left_this_month,
                    })}
                />
                {isOwner && (
                    <StatTile
                        label={t('dashboard.revenueThisMonth')}
                        value={formatPrice(data.revenue.this_month, som)}
                        href='/cashbox'
                        trend={
                            data.revenue.last_month > 0
                                ? Math.round(
                                      ((data.revenue.this_month -
                                          data.revenue.last_month) /
                                          data.revenue.last_month) *
                                          100,
                                  )
                                : undefined
                        }
                        hint={t('dashboard.vsLastMonth', {
                            amount: formatPrice(data.revenue.last_month, som),
                        })}
                    />
                )}
                {isOwner && (
                    <StatTile
                        label={t('dashboard.totalDebt')}
                        value={formatPrice(data.debt.total, som)}
                        href='/debtors'
                        hint={t('dashboard.debtors', {
                            count: data.debt.debtors,
                        })}
                    />
                )}
                <StatTile
                    label={t('dashboard.attendanceRate')}
                    value={
                        data.attendance.rate === null
                            ? '—'
                            : `${Math.round(data.attendance.rate * 100)}%`
                    }
                    href='/schedule'
                    hint={
                        data.attendance.rate === null
                            ? t('dashboard.noAttendance')
                            : t('dashboard.attendanceHint', {
                                  count: data.attendance.marked,
                              })
                    }
                >
                    {data.attendance.rate !== null && (
                        <Meter
                            value={data.attendance.rate}
                            label={t('dashboard.attendanceRate')}
                        />
                    )}
                </StatTile>
            </div>

            <div className='mt-5 grid items-start gap-5 px-4 sm:px-5 lg:grid-cols-[3fr_2fr]'>
                {isOwner && (
                    <SectionCard title={t('dashboard.revenueChart')}>
                        <p className='text-text-tertiary -mt-2 mb-4 text-xs'>
                            {t('dashboard.revenueChartHint')}
                        </p>
                        <ColumnChart
                            data={monthColumns(data.revenue.by_month, t)}
                            formatValue={(value) => formatPrice(value, som)}
                            formatAxis={compact}
                            caption={t('dashboard.revenueChart')}
                        />
                    </SectionCard>
                )}

                <SectionCard title={t('dashboard.todayLessons')}>
                    {data.today.length === 0 ? (
                        <p className='text-text-tertiary text-sm'>
                            {t('dashboard.noLessonsToday')}
                        </p>
                    ) : (
                        <ul className='divide-card-border -my-2 divide-y'>
                            {data.today.map((lesson) => (
                                <li
                                    key={lesson.group.id}
                                    className='flex items-start justify-between gap-3 py-2.5'
                                >
                                    <div className='min-w-0'>
                                        <p className='text-text-primary text-sm font-medium'>
                                            {canOpenGroups ? (
                                                <Link
                                                    href={`/groups/${lesson.group.id}`}
                                                    className='hover:text-brand-accent hover:underline'
                                                >
                                                    {lesson.group.name}
                                                </Link>
                                            ) : (
                                                lesson.group.name
                                            )}
                                        </p>
                                        <p className='text-text-tertiary text-xs'>
                                            {[
                                                lesson.room,
                                                lesson.teacher,
                                                t('dashboard.studentsCount', {
                                                    count: lesson.students_count,
                                                }),
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                    <div className='flex shrink-0 flex-col items-end gap-1'>
                                        <span className='text-text-secondary text-sm tabular-nums'>
                                            {lesson.lesson_start}–
                                            {lesson.lesson_end}
                                        </span>
                                        {lesson.attendance_marked ? (
                                            <Badge size='sm' color='success'>
                                                {t('attendance.marked')}
                                            </Badge>
                                        ) : canMarkAttendance ? (
                                            <Link
                                                href={`/groups/${lesson.group.id}?${ATTENDANCE_PARAM}=1`}
                                                className='text-brand-accent text-xs font-medium hover:underline'
                                            >
                                                {t('attendance.take')}
                                            </Link>
                                        ) : (
                                            <Badge size='sm' color='gray'>
                                                {t('attendance.unmarked')}
                                            </Badge>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </div>

            {isOwner && (
                <div className='mt-5 grid items-start gap-5 px-4 pb-6 sm:px-5 lg:grid-cols-[3fr_2fr]'>
                    <SectionCard title={t('dashboard.leadFunnel')}>
                        <p className='text-text-tertiary -mt-2 mb-4 text-xs'>
                            {t('dashboard.newLeads', {
                                count: data.new_leads_this_month,
                            })}
                        </p>
                        <HorizontalBars
                            rows={LEAD_STATUSES.map((status) => ({
                                key: status,
                                label: t(`leadStatus.${status}`),
                                value: data.leads[status],
                            }))}
                            formatValue={formatNumber}
                        />
                    </SectionCard>
                    <div className='grid gap-4'>
                        <StatTile
                            label={t('dashboard.expensesThisMonth')}
                            value={formatPrice(data.expenses.this_month, som)}
                            href='/expenses'
                        />
                        <StatTile
                            label={t('dashboard.profit')}
                            value={formatPrice(data.profit_this_month, som)}
                            hint={t('dashboard.profitHint')}
                        />
                        <StatTile
                            label={t('dashboard.activeGroups')}
                            value={formatNumber(data.active_groups)}
                            href='/groups'
                        />
                    </div>
                </div>
            )}
        </>
    );
}
