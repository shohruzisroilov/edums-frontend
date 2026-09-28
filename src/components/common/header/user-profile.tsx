'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/tailgrids/core/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { fileUrl } from '@/services/api/client';
import { useRouter } from 'next/navigation';
import { LogoutIcon, UserCircleIcon } from './icons';

export function UserProfileButton() {
    const { session, signOut } = useSession();
    const router = useRouter();
    const t = useT();

    if (!session) return null;

    const superAdmin = session.kind === 'super_admin';

    const displayName = superAdmin
        ? t('profile.superAdmin')
        : `${session.last_name} ${session.first_name}`.trim();

    const initials = superAdmin
        ? 'SA'
        : `${session.last_name[0] ?? ''}${session.first_name[0] ?? ''}`.toUpperCase();

    const avatar = fileUrl(session.avatar_url);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('nav.userMenu')}
                className='hover:bg-background-gray-secondary flex items-center gap-2.5 rounded-lg p-1 transition-colors outline-none'
            >
                <Avatar className='size-9'>
                    {avatar && <AvatarImage src={avatar} alt={displayName} />}
                    <AvatarFallback>{initials || 'U'}</AvatarFallback>
                </Avatar>
                <span className='hidden text-left sm:block'>
                    <span className='text-text-primary block text-sm font-medium'>
                        {displayName}
                    </span>
                    <span className='text-text-tertiary flex items-center gap-1.5 text-xs'>
                        <span className='truncate max-w-[120px]'>
                            {superAdmin
                                ? t('profile.superAdmin')
                                : (session.education?.name ?? '')}
                        </span>
                        {!superAdmin && session.subscription && (
                            <span className='border-brand-accent/25 bg-brand-accent/10 text-brand-accent shrink-0 inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold'>
                                {session.subscription.tariff_name ||
                                    (session.subscription.kind === 'trial'
                                        ? t('billing.trial')
                                        : t('billing.subscription'))}
                            </span>
                        )}
                    </span>
                </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='min-w-56'>
                <DropdownMenuLabel>
                    <p className='text-text-primary text-sm font-medium'>
                        {displayName}
                    </p>
                    <p className='text-text-tertiary text-xs'>
                        {session.phone_number}
                    </p>
                    {!superAdmin && session.subscription && (
                        <div className='border-card-border bg-background-gray-primary/60 mt-2.5 rounded-lg border p-2 text-xs'>
                            <div className='flex items-center justify-between'>
                                <span className='text-text-tertiary font-normal'>
                                    {t('billing.tariff')}:
                                </span>
                                <span className='text-brand-accent font-semibold'>
                                    {session.subscription.tariff_name ||
                                        (session.subscription.kind === 'trial'
                                            ? t('billing.trial')
                                            : t('billing.subscription'))}
                                </span>
                            </div>
                            <div className='text-text-tertiary mt-1 flex items-center justify-between text-[11px]'>
                                <span>{t('common.status')}:</span>
                                <span
                                    className={
                                        session.subscription.active
                                            ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                            : 'font-medium text-red-600'
                                    }
                                >
                                    {session.subscription.active
                                        ? `${session.subscription.days_left} kun qoldi`
                                        : t('billing.expired')}
                                </span>
                            </div>
                        </div>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onAction={() => router.push('/profile')}>
                    <span className='flex items-center gap-2.5 px-1.5 py-1'>
                        <UserCircleIcon />
                        {t('nav.profile')}
                    </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onAction={signOut}>
                    <span className='flex items-center gap-2.5 px-1.5 py-1 text-red-600'>
                        <LogoutIcon />
                        {t('auth.signOut')}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
