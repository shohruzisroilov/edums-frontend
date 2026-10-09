'use client';

import { AccessGuard } from '@/components/ui/access-guard';
import { ResponsiveMoney } from '@/components/ui/charts';
import {
    AttendanceRadialCard,
    FinancialComparisonChart,
    KpiStatCard,
    LeadFunnelCard,
    StudentDynamicsCard,
} from '@/components/ui/dashboard-charts';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { useFormat } from '@/hooks/use-format';
import { ATTENDANCE_PARAM } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getDashboard } from '@/services/api/reports';
import type { Dashboard } from '@/types/api';
import { can, canAny } from '@/utils/access';
import {
    CalendarTime,
    CheckCircle1,
    ErrorCircle1,
    SackDollar,
    UserMultiple1,
    Wallet2,
} from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GettingStarted } from './_components/getting-started';

export default function DashboardPage() {
    return (
        <AccessGuard
            allow={(session) =>
                canAny(session, 'reports.view', 'reports.view_own')
            }
        >
            <DashboardView />
        </AccessGuard>
    );
}

function DashboardView() {
    const t = useT();
    const { formatPrice, formatNumber } = useFormat();
    const { session } = useSession();
    const som = t('common.som');

    const query = useQuery({
        queryKey: ['dashboard', session?.id, session?.education?.id],
        queryFn: getDashboard,
        staleTime: 10_000,
    });

    if (query.isPending) return <TableSkeleton rows={4} columns={4} />;
    if (query.error) return <ErrorState error={query.error} />;

    const data = query.data;
    const isOwner = can(session, 'reports.view');
    const canOpenGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canMarkAttendance =
        canOpenGroups &&
        canAny(session, 'attendance.view', 'attendance.view_own') &&
        canAny(session, 'attendance.mark', 'attendance.mark_own');

    // Revenue trend % vs last month
    const revenueTrend =
        data.revenue.last_month > 0
            ? Math.round(
                  ((data.revenue.this_month - data.revenue.last_month) /
                      data.revenue.last_month) *
                      100,
              )
            : undefined;

    // Profit margin %
    const profitMargin =
        data.revenue.this_month > 0
            ? Math.round(
                  (data.profit_this_month / data.revenue.this_month) * 100,
              )
            : undefined;

    return (
        <div className='w-full max-w-full min-w-0 overflow-x-hidden'>
            <PageHeader
                title={t('dashboard.title')}
                description={
                    session?.education?.name ?? t('dashboard.subtitle')
                }
            />

            <GettingStarted setup={data.setup} />

            {/* 1. TOP KPI BENTO CARDS */}
            <div className='grid grid-cols-1 gap-3.5 px-4 sm:grid-cols-2 sm:gap-4 sm:px-5 xl:grid-cols-4'>
                {/* 1.1 Active Students */}
                <KpiStatCard
                    label={t('dashboard.activeStudents')}
                    value={formatNumber(data.students.active)}
                    href='/students'
                    icon={<UserMultiple1 className='size-5' />}
                    colorScheme='blue'
                    badgeText={
                        data.students.joined_this_month > 0
                            ? `+${data.students.joined_this_month}`
                            : undefined
                    }
                    hint={t('dashboard.joinedLeft', {
                        joined: data.students.joined_this_month,
                        left: data.students.left_this_month,
                    })}
                />

                {isOwner ? (
                    <>
                        {/* 1.2 Revenue this month */}
                        <KpiStatCard
                            label={t('dashboard.revenueThisMonth')}
                            value={
                                <ResponsiveMoney
                                    value={data.revenue.this_month}
                                />
                            }
                            href='/cashbox'
                            trend={revenueTrend}
                            icon={<Wallet2 className='size-5' />}
                            colorScheme='emerald'
                            hint={t('dashboard.vsLastMonth', {
                                amount: formatPrice(
                                    data.revenue.last_month,
                                    som,
                                ),
                            })}
                        />

                        {/* 1.3 Net Profit this month */}
                        <KpiStatCard
                            label={t('dashboard.profit')}
                            value={
                                <ResponsiveMoney
                                    value={data.profit_this_month}
                                />
                            }
                            href='/expenses'
                            badgeText={
                                profitMargin !== undefined
                                    ? `${profitMargin}% marja`
                                    : undefined
                            }
                            icon={<SackDollar className='size-5' />}
                            colorScheme='violet'
                            hint={
                                <span>
                                    {t('dashboard.expensesThisMonth')}:{' '}
                                    <span className='font-semibold tabular-nums'>
                                        {formatPrice(
                                            data.expenses.this_month,
                                            som,
                                        )}
                                    </span>
                                </span>
                            }
                        />

                        {/* 1.4 Debtors / Total Debt */}
                        <KpiStatCard
                            label={t('dashboard.totalDebt')}
                            value={<ResponsiveMoney value={data.debt.total} />}
                            href='/debtors'
                            badgeText={t('dashboard.debtors', {
                                count: data.debt.debtors,
                            })}
                            icon={<ErrorCircle1 className='size-5' />}
                            colorScheme='rose'
                            hint={
                                data.debt.debtors > 0
                                    ? t('nav.debtors')
                                    : t('debtors.empty')
                            }
                        />
                    </>
                ) : (
                    <>
                        {/* Non-owner: Active Groups */}
                        <KpiStatCard
                            label={t('dashboard.activeGroups')}
                            value={formatNumber(data.active_groups)}
                            href='/groups'
                            icon={<UserMultiple1 className='size-5' />}
                            colorScheme='violet'
                            hint={t('nav.groups')}
                        />

                        {/* Non-owner: Attendance */}
                        <KpiStatCard
                            label={t('dashboard.attendanceRate')}
                            value={
                                data.attendance.rate === null
                                    ? '—'
                                    : `${Math.round(data.attendance.rate * 100)}%`
                            }
                            href='/schedule'
                            icon={<CheckCircle1 className='size-5' />}
                            colorScheme='emerald'
                            hint={t('dashboard.attendanceHint', {
                                count: data.attendance.marked,
                            })}
                        />

                        {/* Non-owner: Today lessons */}
                        <KpiStatCard
                            label={t('dashboard.todayLessons')}
                            value={formatNumber(data.today.length)}
                            href='/schedule'
                            icon={<CalendarTime className='size-5' />}
                            colorScheme='amber'
                            hint={
                                data.today.length > 0
                                    ? t('dashboard.todayProgress', {
                                          marked: data.today.filter(
                                              (l) => l.attendance_marked,
                                          ).length,
                                          total: data.today.length,
                                      })
                                    : t('dashboard.noLessonsToday')
                            }
                        />
                    </>
                )}
            </div>

            {/* 2. MAIN VISUAL ANALYTICS ROW (Financial Chart + Today's Lessons) */}
            <div className='mt-5 grid items-stretch gap-5 px-4 sm:px-5 xl:grid-cols-[3fr_2fr]'>
                {/* 2.1 Comparative Financial Analytics Chart (Owner) */}
                {isOwner ? (
                    <FinancialComparisonChart
                        revenueByMonth={data.revenue.by_month}
                        expensesByMonth={data.expenses.by_month}
                    />
                ) : (
                    <AttendanceRadialCard
                        rate={data.attendance.rate}
                        marked={data.attendance.marked}
                        present={data.attendance.present}
                        late={data.attendance.late}
                        absent={data.attendance.absent}
                    />
                )}

                {/* 2.2 Today's Schedule & Attendance Monitor */}
                <TodayLessonsCard
                    lessons={data.today}
                    canOpenGroups={canOpenGroups}
                    canMarkAttendance={canMarkAttendance}
                />
            </div>

            {/* 3. DEEP ANALYTICS ROW (Attendance Radial + Leads Funnel + Student Dynamics) */}
            <div className='mt-5 grid min-w-0 grid-cols-1 items-stretch gap-5 px-4 pb-8 sm:px-5 md:grid-cols-2 lg:grid-cols-3'>
                {/* 3.1 Attendance Distribution Gauge */}
                {isOwner && (
                    <AttendanceRadialCard
                        rate={data.attendance.rate}
                        marked={data.attendance.marked}
                        present={data.attendance.present}
                        late={data.attendance.late}
                        absent={data.attendance.absent}
                    />
                )}

                {/* 3.2 Leads Pipeline & Conversion Funnel */}
                {isOwner && (
                    <LeadFunnelCard
                        leads={data.leads}
                        newLeadsThisMonth={data.new_leads_this_month}
                    />
                )}

                {/* 3.3 Student Inflow/Outflow & Capacity Dynamics */}
                <StudentDynamicsCard
                    activeStudents={data.students.active}
                    joinedThisMonth={data.students.joined_this_month}
                    leftThisMonth={data.students.left_this_month}
                    activeGroups={data.active_groups}
                />
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
 * TODAY'S SCHEDULE & ATTENDANCE CARD
 * ────────────────────────────────────────────────────────────────────────── */

function TodayLessonsCard({
    lessons,
    canOpenGroups,
    canMarkAttendance,
}: {
    lessons: Dashboard['today'];
    canOpenGroups: boolean;
    canMarkAttendance: boolean;
}) {
    const t = useT();
    const markedCount = lessons.filter((l) => l.attendance_marked).length;
    const totalCount = lessons.length;
    const progressPct =
        totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;

    return (
        <div className='border-card-border bg-card-background/95 flex h-full flex-col justify-between rounded-2xl border p-4.5 sm:p-5.5'>
            <div>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <span className='flex size-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                            <CalendarTime className='size-4' />
                        </span>
                        <h2 className='text-text-primary font-display text-base font-semibold'>
                            {t('dashboard.todayLessons')}
                        </h2>
                    </div>

                    {totalCount > 0 && (
                        <span className='border-card-border/80 bg-background-gray-secondary/70 text-text-secondary rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums'>
                            {t('dashboard.todayProgress', {
                                marked: markedCount,
                                total: totalCount,
                            })}
                        </span>
                    )}
                </div>

                {/* Progress bar if there are lessons */}
                {totalCount > 0 && (
                    <div className='mt-3.5'>
                        <div className='bg-card-surface-area ring-card-border/40 h-1.5 w-full overflow-hidden rounded-full ring-1'>
                            <div
                                style={{ width: `${progressPct}%` }}
                                className='h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500'
                            />
                        </div>
                    </div>
                )}

                {/* Lessons list or empty state */}
                <div className='mt-4'>
                    {totalCount === 0 ? (
                        <div className='border-card-border/60 bg-background-gray-primary/40 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center'>
                            <div className='bg-card-surface-area text-text-tertiary flex size-11 items-center justify-center rounded-full shadow-2xs'>
                                <CalendarTime className='size-5' />
                            </div>
                            <p className='text-text-primary mt-2.5 text-sm font-semibold'>
                                {t('dashboard.noLessonsToday')}
                            </p>
                            <p className='text-text-tertiary mt-0.5 text-xs'>
                                {t('attendance.noLessons')}
                            </p>
                        </div>
                    ) : (
                        <ul className='divide-card-border/60 space-y-2.5'>
                            {lessons.map((lesson) => (
                                <li
                                    key={lesson.group.id}
                                    className='border-card-border/70 bg-card-surface-area/40 hover:bg-card-surface-area/80 flex min-w-0 flex-col items-start justify-between gap-2.5 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center sm:gap-3'
                                >
                                    <div className='w-full min-w-0 sm:w-auto sm:flex-1'>
                                        <div className='flex min-w-0 items-center gap-2'>
                                            <p className='text-text-primary text-sm font-bold break-words'>
                                                {canOpenGroups ? (
                                                    <Link
                                                        href={`/groups/${lesson.group.id}`}
                                                        className='hover:text-brand-accent transition-colors hover:underline'
                                                    >
                                                        {lesson.group.name}
                                                    </Link>
                                                ) : (
                                                    lesson.group.name
                                                )}
                                            </p>
                                        </div>

                                        <div className='text-text-tertiary mt-1 flex flex-wrap items-center gap-1.5 text-xs'>
                                            {lesson.room && (
                                                <span className='bg-card-surface-area border-card-border/60 text-text-secondary shrink-0 rounded-md border px-1.5 py-0.5 font-medium'>
                                                    {lesson.room}
                                                </span>
                                            )}
                                            {lesson.teacher && (
                                                <span className='break-words'>
                                                    {lesson.teacher}
                                                </span>
                                            )}
                                            <span>·</span>
                                            <span className='shrink-0'>
                                                {t('dashboard.studentsCount', {
                                                    count: lesson.students_count,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex w-full items-center justify-between gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:gap-1.5'>
                                        <span className='bg-card-surface-area border-card-border/80 text-text-primary shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums'>
                                            {lesson.lesson_start}–
                                            {lesson.lesson_end}
                                        </span>

                                        {lesson.attendance_marked ? (
                                            <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                                                <CheckCircle1 className='size-3' />
                                                {t('attendance.marked')}
                                            </span>
                                        ) : canMarkAttendance ? (
                                            <Link
                                                href={`/groups/${lesson.group.id}?${ATTENDANCE_PARAM}=1`}
                                                className='bg-brand-accent hover:bg-brand-accent/90 inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition-colors'
                                            >
                                                <span>
                                                    {t('dashboard.quickMark')}
                                                </span>
                                                <span>→</span>
                                            </Link>
                                        ) : (
                                            <span className='bg-background-gray-secondary/80 text-text-tertiary shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium'>
                                                {t('attendance.unmarked')}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Footer link to schedule */}
            <div className='border-card-border/60 mt-4 border-t pt-3'>
                <Link
                    href='/schedule'
                    className='text-brand-accent hover:text-brand-accent/80 flex items-center justify-between text-xs font-semibold'
                >
                    <span>{t('nav.schedule')}</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}
