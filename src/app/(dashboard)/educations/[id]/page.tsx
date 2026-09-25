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
import { BackLink, DetailSection, InfoCard } from '@/components/ui/detail';
import { PageHeader } from '@/components/ui/page-header';
import { ResetPasswordModal } from '@/components/ui/reset-password-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
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
import { Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
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
            <BackLink href='/educations' label={t('educations.backToList')} />

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

            <DetailSection
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
                                <RowNumberHead />
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
                            {ownersQuery.data.map((owner, index) => (
                                <TableRow key={owner.id}>
                                    <RowNumberCell index={index} />
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
            </DetailSection>

            <DetailSection title={t('billing.history')}>
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
                                <RowNumberHead />
                                <TableHead>{t('billing.tariff')}</TableHead>
                                <TableHead>{t('billing.period')}</TableHead>
                                <TableHead numeric>
                                    {t('tariffs.price')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptionsQuery.data.map((item, index) => (
                                <TableRow key={item.id}>
                                    <RowNumberCell index={index} />
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
            </DetailSection>

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
