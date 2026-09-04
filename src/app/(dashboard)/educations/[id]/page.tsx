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
import {
    ActiveBadge,
    CenterStatusBadge,
    SubscriptionStatusBadge,
} from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import {
    getEducation,
    listEducationOwners,
    listEducationSubscriptions,
} from '@/services/api/educations';
import { fullName } from '@/utils/format';
import { ArrowLeft, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AssignTariffModal } from './_components/assign-tariff';
import { OwnerFormModal } from './_components/owner-form';

export default function EducationDetailPage() {
    return (
        <RoleGuard allow={['super_admin']}>
            <EducationDetailView />
        </RoleGuard>
    );
}

function EducationDetailView() {
    const t = useT();
    const { formatDate, formatDateTime, formatLimit, formatPrice } =
        useFormat();
    const params = useParams<{ id: string }>();
    const educationId = params.id;

    const [tariffOpen, setTariffOpen] = useState(false);
    const [ownerOpen, setOwnerOpen] = useState(false);

    const educationQuery = useQuery({
        queryKey: ['education', educationId],
        queryFn: () => getEducation(educationId),
    });

    const ownersQuery = useQuery({
        queryKey: ['education-owners', educationId],
        queryFn: () => listEducationOwners(educationId),
    });

    const subscriptionsQuery = useQuery({
        queryKey: ['education-subscriptions', educationId],
        queryFn: () => listEducationSubscriptions(educationId),
    });

    if (educationQuery.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (educationQuery.error)
        return <ErrorState error={educationQuery.error} />;

    const education = educationQuery.data;
    const subscription = education.current_subscription;

    return (
        <>
            <div className='px-5 pt-6'>
                <Link
                    href='/educations'
                    className='text-text-tertiary hover:text-text-primary inline-flex items-center gap-1.5 text-sm transition-colors'
                >
                    <ArrowLeft className='size-4' />
                    {t('educations.backToList')}
                </Link>
            </div>

            <PageHeader
                title={education.name}
                description={education.phone_number}
                actions={
                    <Button
                        appearance='outline'
                        size='md'
                        onPress={() => setTariffOpen(true)}
                    >
                        {t('educations.assignTariff')}
                    </Button>
                }
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-3'>
                <InfoCard
                    label={t('common.status')}
                    value={<CenterStatusBadge status={education.status} />}
                />
                <InfoCard
                    label={t('educations.tariff')}
                    value={
                        subscription?.tariff_name ?? t('educations.noTariff')
                    }
                />
                <InfoCard
                    label={t('educations.subscriptionEnds')}
                    value={formatDate(subscription?.ends_at)}
                />
                <InfoCard
                    label={t('tariffs.price')}
                    value={
                        subscription
                            ? formatPrice(subscription.price, t('common.som'))
                            : '—'
                    }
                />
                <InfoCard
                    label={t('tariffs.maxStudents')}
                    value={
                        subscription
                            ? formatLimit(
                                  subscription.max_students,
                                  t('common.unlimited'),
                              )
                            : '—'
                    }
                />
                <InfoCard
                    label={t('common.createdAt')}
                    value={formatDateTime(education.created_at)}
                />
            </div>

            <Section
                title={t('educations.owners')}
                action={
                    <Button
                        variant='primary'
                        appearance='fill'
                        size='md'
                        onPress={() => setOwnerOpen(true)}
                    >
                        <Plus />
                        {t('educations.addOwner')}
                    </Button>
                }
            >
                {ownersQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : ownersQuery.error ? (
                    <ErrorState error={ownersQuery.error} />
                ) : ownersQuery.data.length === 0 ? (
                    <EmptyState message={t('educations.noOwners')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.fullName')}</TableHead>
                                <TableHead>{t('common.phone')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead>{t('common.createdAt')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ownersQuery.data.map((owner) => (
                                <TableRow key={owner.id}>
                                    <TableCell primary>
                                        {fullName(owner)}
                                    </TableCell>
                                    <TableCell>{owner.phone_number}</TableCell>
                                    <TableCell>
                                        <ActiveBadge active={owner.is_active} />
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(owner.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </Section>

            <Section
                title={t('educations.centers')}
                action={
                    <Link
                        href='/education-centers'
                        className='text-brand-accent text-sm font-medium hover:underline'
                    >
                        {t('common.details')}
                    </Link>
                }
            >
                {education.centers.length === 0 ? (
                    <EmptyState message={t('educations.noCenters')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.name')}</TableHead>
                                <TableHead>{t('common.phone')}</TableHead>
                                <TableHead>{t('common.address')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {education.centers.map((center) => (
                                <TableRow key={center.id}>
                                    <TableCell>
                                        <Link
                                            href={`/education-centers/${center.id}`}
                                            className='text-brand-accent font-medium hover:underline'
                                        >
                                            {center.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{center.phone_number}</TableCell>
                                    <TableCell>
                                        {center.address ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <CenterStatusBadge
                                            status={center.status}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </Section>

            <Section title={t('educations.subscriptions')}>
                {subscriptionsQuery.isPending ? (
                    <TableSkeleton rows={2} columns={4} />
                ) : subscriptionsQuery.error ? (
                    <ErrorState error={subscriptionsQuery.error} />
                ) : subscriptionsQuery.data.length === 0 ? (
                    <EmptyState message={t('educations.noSubscriptions')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('educations.tariff')}</TableHead>
                                <TableHead>{t('educations.period')}</TableHead>
                                <TableHead numeric>
                                    {t('tariffs.price')}
                                </TableHead>
                                <TableHead numeric>
                                    {t('tariffs.maxStudents')}
                                </TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptionsQuery.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell primary>
                                        {item.tariff_name}
                                    </TableCell>
                                    <TableCell>
                                        {t('educations.periodValue', {
                                            from: formatDate(item.starts_at),
                                            to: formatDate(item.ends_at),
                                        })}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(
                                            item.price,
                                            t('common.som'),
                                        )}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatLimit(
                                            item.max_students,
                                            t('common.unlimited'),
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <SubscriptionStatusBadge
                                            status={item.status}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </Section>

            {tariffOpen && (
                <AssignTariffModal
                    education={education}
                    onClose={() => setTariffOpen(false)}
                />
            )}

            {ownerOpen && (
                <OwnerFormModal
                    educationId={educationId}
                    onClose={() => setOwnerOpen(false)}
                />
            )}
        </>
    );
}

function InfoCard({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-4'>
            <p className='text-text-tertiary text-xs'>{label}</p>
            <div className='text-text-primary mt-1.5 text-sm font-medium tabular-nums'>
                {value}
            </div>
        </div>
    );
}

function Section({
    title,
    action,
    children,
}: {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className='mt-8 px-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
                <h2 className='text-text-primary font-display text-base font-semibold'>
                    {title}
                </h2>
                {action}
            </div>
            <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                {children}
            </div>
        </section>
    );
}
