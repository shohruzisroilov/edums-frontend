'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/tailgrids/core/avatar';
import { Button } from '@/components/tailgrids/core/button';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getMe } from '@/services/api/auth';
import { fileUrl } from '@/services/api/client';
import { listEducationCenters } from '@/services/api/education-centers';
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
    const { session, signOut } = useSession();
    const t = useT();
    const { formatNumber } = useFormat();

    // Super admin uchun /auth/me yo'q — u alohida jadvalda yashaydi,
    // shuning uchun ma'lumot sessiyadan olinadi.
    const isSuperAdmin = session?.role === 'super_admin';

    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        enabled: !!session && !isSuperAdmin,
    });

    /*
     * /auth/me faqat id'larni beradi. Nomlarni GET /education_centers
     * qaytaradi va u har bir rolga o'z ko'lamini beradi, shuning uchun
     * qo'shimcha huquq talab qilmaydi.
     */
    const centersQuery = useQuery({
        queryKey: ['education-centers', 'profile'],
        queryFn: () => listEducationCenters({ limit: 200 }),
        enabled: !!session && !isSuperAdmin,
    });

    if (!session) return null;

    if (!isSuperAdmin && meQuery.isPending) {
        return <TableSkeleton rows={4} columns={2} />;
    }

    if (!isSuperAdmin && meQuery.error) {
        return <ErrorState error={meQuery.error} />;
    }

    const profile = meQuery.data;
    const centers = centersQuery.data?.data ?? [];

    const displayName = isSuperAdmin
        ? t('profile.superAdmin')
        : `${profile?.last_name ?? ''} ${profile?.first_name ?? ''}`.trim();

    const initials = isSuperAdmin
        ? 'SA'
        : `${profile?.last_name?.[0] ?? ''}${profile?.first_name?.[0] ?? ''}`.toUpperCase();

    const avatar = fileUrl(profile?.avatar_url ?? null);

    const roleKey = isSuperAdmin
        ? ('role.super_admin' as const)
        : (`role.${profile?.role ?? 'teacher'}` as const);

    // Owner filialga biriktirilmaydi — u tashkilotning hammasini qamraydi.
    const isOwner = profile?.role === 'owner';

    const centersValue = isSuperAdmin
        ? t('profile.allCenters')
        : isOwner
          ? t('profile.centersCount', { count: formatNumber(centers.length) })
          : centers.length > 0
            ? centers.map((center) => center.name).join(', ')
            : t('profile.notAttached');

    const rows: { label: string; value: string }[] = [
        { label: t('profile.nameRow'), value: displayName },
        {
            label: t('common.phoneNumber'),
            value: isSuperAdmin
                ? session.phone_number
                : (profile?.phone_number ?? '—'),
        },
        { label: t('users.role'), value: t(roleKey) },
        {
            label: t('profile.education'),
            value: isSuperAdmin
                ? '—'
                : (centers[0]?.education?.name ?? t('profile.notAttached')),
        },
        { label: t('profile.centers'), value: centersValue },
    ];

    return (
        <>
            <PageHeader
                title={t('profile.title')}
                description={t('profile.subtitle')}
                actions={
                    <Button
                        variant='danger'
                        appearance='outline'
                        size='md'
                        onPress={signOut}
                    >
                        {t('auth.signOut')}
                    </Button>
                }
            />

            <div className='px-5'>
                <div className='border-card-border bg-card-background rounded-xl border p-6'>
                    <div className='flex items-center gap-4'>
                        <Avatar className='size-16'>
                            {avatar && (
                                <AvatarImage src={avatar} alt={displayName} />
                            )}
                            <AvatarFallback>{initials || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className='text-text-primary font-display text-lg font-semibold'>
                                {displayName}
                            </p>
                            <p className='text-text-tertiary text-sm'>
                                {t(roleKey)}
                            </p>
                        </div>
                    </div>

                    <dl className='divide-card-border border-card-border mt-6 divide-y border-t'>
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className='flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center'
                            >
                                <dt className='text-text-tertiary text-sm sm:w-56'>
                                    {row.label}
                                </dt>
                                <dd className='text-text-primary text-sm font-medium'>
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className='text-text-tertiary mt-6 text-xs'>
                        {t('profile.readOnly')}
                    </p>
                </div>
            </div>
        </>
    );
}
