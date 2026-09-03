'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/tailgrids/core/avatar';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getMe } from '@/services/api/auth';
import { fileUrl } from '@/services/api/client';
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
    const { session, signOut } = useSession();
    const t = useT();

    // Super admin uchun /auth/me yo'q — u alohida jadvalda yashaydi,
    // shuning uchun ma'lumot sessiyadan olinadi.
    const isSuperAdmin = session?.role === 'super_admin';

    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
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

    const displayName = isSuperAdmin
        ? t('profile.superAdmin')
        : `${profile?.last_name ?? ''} ${profile?.first_name ?? ''}`.trim();

    const initials = isSuperAdmin
        ? 'SA'
        : `${profile?.last_name?.[0] ?? ''}${profile?.first_name?.[0] ?? ''}`.toUpperCase();

    const avatar = fileUrl(profile?.avatar_url ?? null);

    const roleKey = isSuperAdmin
        ? ('role.super_admin' as const)
        : (`role.${profile?.role ?? 'manager'}` as const);

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
            label: t('profile.center'),
            // Xodim o'z markazining nomini o'qiy olmaydi —
            // GET /education_centers/:id faqat super admin uchun ochiq.
            value: isSuperAdmin
                ? t('profile.allCenters')
                : t(
                      profile?.education_center_id
                          ? 'profile.attached'
                          : 'profile.notAttached',
                  ),
        },
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
