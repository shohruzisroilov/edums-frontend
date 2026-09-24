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
import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { ResetPasswordModal } from '@/components/ui/reset-password-modal';
import {
    ActiveBadge,
    EducationStatusBadge,
    SubscriptionBadge,
} from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import {
    getEducation,
    listEducationOwners,
    listEducationSubscriptions,
    resetEducationOwnerPassword,
} from '@/services/api/educations';
import type { User } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { fullName } from '@/utils/format';
import { ArrowLeft, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { OwnerFormModal } from './_components/owner-form';

export default function EducationDetailPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <EducationDetailView />
        </AccessGuard>
    );
}

function EducationDetailView() {
    const t = useT();
    const { formatDate, formatDateTime, formatPrice } = useFormat();
    const params = useParams<{ id: string }>();
    const educationId = params.id;

    const [ownerOpen, setOwnerOpen] = useState(false);
    const [resetting, setResetting] = useState<User | null>(null);

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
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-3'>
                <InfoCard
                    label={t('common.status')}
                    value={<EducationStatusBadge status={education.status} />}
                />
                <InfoCard
                    label={t('billing.subscription')}
                    value={
                        <SubscriptionBadge
                            subscription={education.subscription}
                        />
                    }
                />
                <InfoCard
                    label={t('common.createdAt')}
                    value={formatDateTime(education.created_at)}
                />
            </div>

            <Section
                title={t('educations.owners')}
                description={t('educations.ownersHint')}
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
                                <TableHead className='text-right'>
                                    {t('common.actions')}
                                </TableHead>
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
                                    <TableCell>
                                        <div className='flex justify-end'>
                                            <Button
                                                appearance='outline'
                                                size='md'
                                                onPress={() =>
                                                    setResetting(owner)
                                                }
                                            >
                                                {t('users.resetPassword')}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </Section>

            <Section title={t('billing.history')}>
                {subscriptionsQuery.isPending ? (
                    <TableSkeleton rows={2} columns={3} />
                ) : subscriptionsQuery.error ? (
                    <ErrorState error={subscriptionsQuery.error} />
                ) : subscriptionsQuery.data.length === 0 ? (
                    <EmptyState message={t('billing.noHistory')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('billing.tariff')}</TableHead>
                                <TableHead>{t('billing.period')}</TableHead>
                                <TableHead numeric>
                                    {t('tariffs.price')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptionsQuery.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell primary>
                                        {item.kind === 'trial'
                                            ? t('billing.trial')
                                            : item.tariff_name}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(item.starts_at)} —{' '}
                                        {formatDate(item.ends_at)}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(
                                            item.price,
                                            t('common.som'),
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </Section>

            {ownerOpen && (
                <OwnerFormModal
                    educationId={educationId}
                    onClose={() => setOwnerOpen(false)}
                />
            )}

            {resetting && (
                <ResetPasswordModal
                    user={resetting}
                    reset={(password) =>
                        resetEducationOwnerPassword(
                            educationId,
                            resetting.id,
                            password,
                        )
                    }
                    onClose={() => setResetting(null)}
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
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className='mt-8 px-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
                <div>
                    <h2 className='text-text-primary font-display text-base font-semibold'>
                        {title}
                    </h2>
                    {description && (
                        <p className='text-text-tertiary mt-1 text-sm'>
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                {children}
            </div>
        </section>
    );
}
