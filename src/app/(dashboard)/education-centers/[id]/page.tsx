'use client';

import { Button } from '@/components/tailgrids/core/button';
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
import { PageHeader } from '@/components/ui/page-header';
import { RoleGuard } from '@/components/ui/role-guard';
import { ActiveBadge, CenterStatusBadge } from '@/components/ui/status-badge';
import {
    getEducationCenter,
    listCenterAdmins,
} from '@/services/api/education-centers';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { fullName } from '@/utils/format';
import { ArrowLeft, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AssignTariffModal } from './_components/assign-tariff';
import { CenterAdminFormModal } from './_components/center-admin-form';

export default function EducationCenterDetailPage() {
    return (
        <RoleGuard allow={['super_admin']}>
            <CenterDetailView />
        </RoleGuard>
    );
}

function CenterDetailView() {
    const t = useT();
    const { formatDate, formatDateTime } = useFormat();
    const params = useParams<{ id: string }>();
    const centerId = params.id;

    const [tariffOpen, setTariffOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);

    const centerQuery = useQuery({
        queryKey: ['education-center', centerId],
        queryFn: () => getEducationCenter(centerId),
    });

    const adminsQuery = useQuery({
        queryKey: ['center-admins', centerId],
        queryFn: () => listCenterAdmins(centerId),
    });

    if (centerQuery.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (centerQuery.error) return <ErrorState error={centerQuery.error} />;

    const center = centerQuery.data;

    return (
        <>
            <div className='px-5 pt-6'>
                <Link
                    href='/education-centers'
                    className='text-text-tertiary hover:text-text-primary inline-flex items-center gap-1.5 text-sm transition-colors'
                >
                    <ArrowLeft className='size-4' />
                    {t('centers.backToList')}
                </Link>
            </div>

            <PageHeader
                title={center.name}
                description={center.address ?? undefined}
                actions={
                    <Button
                        appearance='outline'
                        size='md'
                        onPress={() => setTariffOpen(true)}
                    >
                        {t('centers.assignTariff')}
                    </Button>
                }
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-3'>
                <InfoCard
                    label={t('common.phone')}
                    value={center.phone_number}
                />
                <InfoCard
                    label={t('common.status')}
                    value={<CenterStatusBadge status={center.status} />}
                />
                <InfoCard
                    label={t('centers.tariff')}
                    value={center.tariff?.name ?? t('centers.noTariff')}
                />
                <InfoCard
                    label={t('centers.subscriptionEnds')}
                    value={formatDate(center.subscription_ends_at)}
                />
                <InfoCard
                    label={t('centers.telegram')}
                    value={center.telegram ?? '—'}
                />
                <InfoCard
                    label={t('centers.instagram')}
                    value={center.instagram ?? '—'}
                />
                <InfoCard
                    label={t('common.createdAt')}
                    value={formatDateTime(center.created_at)}
                />
            </div>

            <section className='mt-8 px-5'>
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-text-primary font-display text-base font-semibold'>
                        {t('centers.admins')}
                    </h2>
                    <Button
                        variant='primary'
                        appearance='fill'
                        size='md'
                        onPress={() => setAdminOpen(true)}
                    >
                        <Plus />
                        {t('centers.addAdmin')}
                    </Button>
                </div>

                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {adminsQuery.isPending ? (
                        <TableSkeleton rows={3} columns={4} />
                    ) : adminsQuery.error ? (
                        <ErrorState error={adminsQuery.error} />
                    ) : adminsQuery.data.length === 0 ? (
                        <EmptyState message={t('centers.noAdmins')} />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {t('common.fullName')}
                                    </TableHead>
                                    <TableHead>{t('common.phone')}</TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                    <TableHead>
                                        {t('common.createdAt')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adminsQuery.data.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>{fullName(admin)}</TableCell>
                                        <TableCell>
                                            {admin.phone_number}
                                        </TableCell>
                                        <TableCell>
                                            <ActiveBadge
                                                active={admin.is_active}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(admin.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>
                    )}
                </div>
            </section>

            {tariffOpen && (
                <AssignTariffModal
                    center={center}
                    onClose={() => setTariffOpen(false)}
                />
            )}

            {adminOpen && (
                <CenterAdminFormModal
                    centerId={centerId}
                    onClose={() => setAdminOpen(false)}
                />
            )}
        </>
    );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-4'>
            <p className='text-text-tertiary text-xs'>{label}</p>
            <div className='text-text-primary mt-1.5 text-sm font-medium tabular-nums'>
                {value}
            </div>
        </div>
    );
}
