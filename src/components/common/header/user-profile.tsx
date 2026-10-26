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
import { formatPhone } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoutIcon, UserCircleIcon } from './icons';
import {
    SupportHeadsetIcon,
    SupportModal,
} from '@/components/ui/support-modal';

export function UserProfileButton() {
    const { session, signOut } = useSession();
    const router = useRouter();
    const t = useT();
    const [supportOpen, setSupportOpen] = useState(false);

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
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={t('nav.userMenu')}
                    className='hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 flex items-center gap-2.5 rounded-lg p-1 transition-colors outline-none focus-visible:ring-4'
                >
                    <Avatar className='size-9'>
                        {avatar && (
                            <AvatarImage src={avatar} alt={displayName} />
                        )}
                        <AvatarFallback>{initials || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className='hidden text-left sm:block'>
                        <span className='text-text-primary block text-sm font-medium'>
                            {displayName}
                        </span>
                        <span className='text-text-tertiary block text-xs'>
                            {superAdmin
                                ? t('profile.superAdmin')
                                : (session.education?.name ?? '')}
                        </span>
                    </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent className='min-w-60'>
                    <DropdownMenuLabel>
                        <p className='text-text-primary text-sm font-medium'>
                            {displayName}
                        </p>
                        <p className='text-text-tertiary text-xs'>
                            {formatPhone(session.phone_number)}
                        </p>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onAction={() => router.push('/profile')}>
                        <span className='flex items-center gap-2.5 px-1.5 py-1'>
                            <UserCircleIcon />
                            {t('nav.profile')}
                        </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onAction={() => setSupportOpen(true)}>
                        <span className='flex items-center gap-2.5 px-1.5 py-1'>
                            <SupportHeadsetIcon className='size-4 text-sky-500' />
                            {t('support.title')}
                        </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onAction={signOut}>
                        <span className='text-badge-error-text flex items-center gap-2.5 px-1.5 py-1'>
                            <LogoutIcon />
                            {t('auth.signOut')}
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SupportModal
                open={supportOpen}
                onClose={() => setSupportOpen(false)}
            />
        </>
    );
}
