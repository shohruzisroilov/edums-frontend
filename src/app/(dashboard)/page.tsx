'use client';

import { BarChart } from '@/components/charts/bar-chart';
import {
    ChartCard,
    ChartEmpty,
    ChartLegend,
    type Datum,
} from '@/components/charts/chart-card';
import { DonutChart } from '@/components/charts/donut-chart';
import { Meter } from '@/components/charts/meter';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { RoleGuard } from '@/components/ui/role-guard';
import { StatCard } from '@/components/ui/stat-card';
import { CenterStatusBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { getSystemStatistics } from '@/services/api/statistics';
import type { AccessRole, EducationStatus } from '@/types/api';
import { Buildings11, Shop, UserMultiple1, Wallet2 } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';

/*
 * Backend faqat joriy kesimni beradi — tarixiy qatorlar yo'q, shuning uchun
 * bu yerda trend chizig'i ham yo'q. Barcha diagrammalar tarkib va
 * taqqoslashga qurilgan.
 *
 * Ranglar `--chart-*` tokenlaridan: ular dataviz validatoridan o'tgan
 * (CVD ajralishi, yorqinlik oralig'i, yuzaga nisbatan kontrast).
 * Tashkilot holati esa alohida — u status palitrasi, u hech qachon
 * seriya rangi sifatida ishlatilmaydi.
 */
const CAT = ['var(--chart-cat-1)', 'var(--chart-cat-2)', 'var(--chart-cat-3)'];

const STATUS_COLOR: Record<EducationStatus, string> = {
    active: 'var(--status-good)',
    suspended: 'var(--status-warning)',
    inactive: 'var(--chart-neutral)',
};

export default function DashboardPage() {
    return (
        <RoleGuard allow={['super_admin']}>
            <StatisticsView />
        </RoleGuard>
    );
}

function StatisticsView() {
    const t = useT();
    const { formatDateTime, formatNumber } = useFormat();

    const { data, isPending, error } = useQuery({
        queryKey: ['statistics'],
        queryFn: getSystemStatistics,
    });

    if (isPending) return <TableSkeleton rows={6} columns={4} />;
    if (error) return <ErrorState error={error} />;

    const educations: Datum[] = (
        ['active', 'suspended', 'inactive'] as EducationStatus[]
    ).map((status) => ({
        key: status,
        label: t(`centerStatus.${status}`),
        value: data.educations[status],
        color: STATUS_COLOR[status],
    }));

    /*
     * Rollar qat'iy tartibda va faqat uchtasi seriya rangini oladi: to'rtinchi
     * rol paydo bo'lsa u neytral rangga tushadi, chunki kategorik palitra
     * aylanmaydi.
     */
    const staff: Datum[] = Object.entries(data.users.by_role).map(
        ([role, count], index) => ({
            key: role,
            label: t(`role.${role as AccessRole}`),
            value: count,
            color: CAT[index] ?? 'var(--chart-neutral)',
        }),
    );

    const tariffs: Datum[] = [...data.educations_by_tariff]
        .sort((a, b) => b.count - a.count)
        .map((row) => ({
            key: row.tariff_name,
            label:
                row.tariff_name === 'no_tariff'
                    ? t('dashboard.noTariff')
                    : row.tariff_name,
            value: row.count,
            color: 'var(--chart-accent)',
        }));

    return (
        <>
            <PageHeader
                title={t('dashboard.title')}
                description={t('dashboard.generatedAt', {
                    time: formatDateTime(data.generated_at),
                })}
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-4'>
                <StatCard
                    label={t('dashboard.educations')}
                    value={data.educations.total}
                    hint={t('dashboard.educationsHint', {
                        active: formatNumber(data.educations.active),
                        suspended: formatNumber(data.educations.suspended),
                        inactive: formatNumber(data.educations.inactive),
                    })}
                    icon={<Buildings11 className='size-5' />}
                />
                <StatCard
                    label={t('dashboard.centers')}
                    value={data.education_centers.total}
                    hint={t('dashboard.centersHint', {
                        average: formatNumber(
                            data.education_centers.average_per_education,
                        ),
                    })}
                    icon={<Shop className='size-5' />}
                />
                <StatCard
                    label={t('dashboard.tariffs')}
                    value={data.tariffs.total}
                    hint={t('dashboard.tariffsHint', {
                        active: formatNumber(data.tariffs.active),
                        inactive: formatNumber(data.tariffs.inactive),
                    })}
                    icon={<Wallet2 className='size-5' />}
                />
                <StatCard
                    label={t('dashboard.students')}
                    value={data.students.total}
                    hint={t('dashboard.studentsHint', {
                        active: formatNumber(data.students.active),
                    })}
                    icon={<UserMultiple1 className='size-5' />}
                />
            </div>

            {data.subscriptions.expiring_soon > 0 && (
                <div className='mt-4 px-5'>
                    <div className='border-card-border rounded-xl border bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'>
                        {t('dashboard.expiring', {
                            days: formatNumber(
                                data.subscriptions.expiring_within_days,
                            ),
                            count: formatNumber(
                                data.subscriptions.expiring_soon,
                            ),
                        })}
                    </div>
                </div>
            )}

            <div className='mt-5 grid gap-5 px-5 lg:grid-cols-2 xl:grid-cols-3'>
                <ChartCard title={t('dashboard.educationsChart')}>
                    {data.educations.total === 0 ? (
                        <ChartEmpty message={t('dashboard.noData')} />
                    ) : (
                        <>
                            <DonutChart
                                data={educations}
                                total={data.educations.total}
                                centerValue={formatNumber(
                                    data.educations.total,
                                )}
                                centerLabel={t('dashboard.educations')}
                            />
                            <ChartLegend
                                items={educations}
                                total={data.educations.total}
                                formatValue={formatNumber}
                            />
                        </>
                    )}
                </ChartCard>

                <ChartCard title={t('dashboard.staffChart')}>
                    {data.users.total === 0 ? (
                        <ChartEmpty message={t('dashboard.noData')} />
                    ) : (
                        <>
                            <DonutChart
                                data={staff}
                                total={data.users.total}
                                centerValue={formatNumber(data.users.total)}
                                centerLabel={t('dashboard.users')}
                            />
                            <ChartLegend
                                items={staff}
                                total={data.users.total}
                                formatValue={formatNumber}
                            />
                        </>
                    )}
                </ChartCard>

                <ChartCard title={t('dashboard.recentEducations')}>
                    {data.recent_educations.length === 0 ? (
                        <ChartEmpty message={t('dashboard.noEducations')} />
                    ) : (
                        <TableRoot fullBleed className='border-0'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.recent_educations.map((education) => (
                                    <TableRow key={education.id}>
                                        <TableCell primary>
                                            {education.name}
                                        </TableCell>
                                        <TableCell>
                                            <CenterStatusBadge
                                                status={
                                                    education.status as EducationStatus
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>
                    )}
                </ChartCard>

                <ChartCard
                    title={t('dashboard.byTariff')}
                    className='lg:col-span-2'
                >
                    {tariffs.length === 0 ? (
                        <ChartEmpty message={t('dashboard.noData')} />
                    ) : (
                        <BarChart data={tariffs} formatValue={formatNumber} />
                    )}
                </ChartCard>

                <ChartCard title={t('dashboard.studentsChart')}>
                    <Meter
                        value={data.students.active}
                        total={data.students.total}
                        color='var(--status-good)'
                        valueLabel={t('dashboard.ofTotal', {
                            total: formatNumber(data.students.total),
                        })}
                        caption={t('dashboard.studentsMeter', {
                            active: formatNumber(data.students.active),
                            total: formatNumber(data.students.total),
                        })}
                    />
                </ChartCard>
            </div>
        </>
    );
}
