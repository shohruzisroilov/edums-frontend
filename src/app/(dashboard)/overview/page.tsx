'use client';

import { AccessGuard } from '@/components/ui/access-guard';
import {
    ColumnChart,
    monthColumns,
    StatTile,
    useCompactNumber,
} from '@/components/ui/charts';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { getPlatformStats } from '@/services/api/reports';
import { isSuperAdmin } from '@/utils/access';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function OverviewPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <OverviewView />
        </AccessGuard>
    );
}

function OverviewView() {
    const t = useT();
    const { formatPrice, formatNumber } = useFormat();
    const compact = useCompactNumber();
    const som = t('common.som');

    const query = useQuery({
        queryKey: ['platform-stats'],
        queryFn: getPlatformStats,
    });

    if (query.isPending) return <TableSkeleton rows={4} columns={4} />;
    if (query.error) return <ErrorState error={query.error} />;

    const data = query.data;

    return (
        <>
            <PageHeader
                title={t('overview.title')}
                description={t('overview.subtitle')}
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-4'>
                <StatTile
                    label={t('overview.educations')}
                    value={formatNumber(data.educations.total)}
                    hint={t('overview.educationsHint', data.educations)}
                />
                <StatTile
                    label={t('overview.subscriptions')}
                    value={formatNumber(
                        data.subscriptions.trial + data.subscriptions.paid,
                    )}
                    hint={t('overview.subscriptionsHint', data.subscriptions)}
                />
                <StatTile
                    label={t('overview.mrr')}
                    value={formatPrice(data.mrr, som)}
                    hint={t('overview.mrrHint')}
                />
                <StatTile
                    label={t('overview.pending')}
                    value={formatNumber(data.pending_requests)}
                    hint={
                        data.pending_requests > 0 ? (
                            <Link
                                href='/payments'
                                className='text-brand-accent hover:underline'
                            >
                                {t('nav.payments')} →
                            </Link>
                        ) : undefined
                    }
                />
            </div>

            <div className='mt-5 grid items-start gap-5 px-5 pb-6 lg:grid-cols-2'>
                <SectionCard title={t('overview.revenueChart')}>
                    <ColumnChart
                        data={monthColumns(data.revenue.by_month, t)}
                        formatValue={(value) => formatPrice(value, som)}
                        formatAxis={compact}
                        caption={t('overview.revenueChart')}
                    />
                </SectionCard>
                <SectionCard title={t('overview.registrationsChart')}>
                    <ColumnChart
                        data={monthColumns(
                            data.registrations_by_month.map((row) => ({
                                month: row.month,
                                amount: row.count,
                            })),
                            t,
                        )}
                        formatValue={formatNumber}
                        // Soni — butun; kasr o'rta chiziq yorliqsiz qoladi.
                        formatAxis={(value) =>
                            Number.isInteger(value) ? formatNumber(value) : ''
                        }
                        caption={t('overview.registrationsChart')}
                    />
                </SectionCard>
            </div>
        </>
    );
}
