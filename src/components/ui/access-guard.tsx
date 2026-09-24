'use client';

import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import type { Session } from '@/types/api';
import type { ReactNode } from 'react';

/**
 * Sahifani yopadi. `allow` sessiyani oladi, shuning uchun ham ruxsat
 * (`(s) => can(s, 'users.view')`), ham super admin (`isSuperAdmin`) tekshiruvi
 * bir xil yoziladi. Bu faqat interfeys to'sig'i — haqiqiy tekshiruv backendda.
 */
export function AccessGuard({
    allow,
    children,
}: {
    allow: (session: Session) => boolean;
    children: ReactNode;
}) {
    const { session } = useSession();
    const t = useT();

    if (!session) return null;

    if (!allow(session)) {
        return (
            <div className='px-5 py-16 text-center'>
                <h2 className='text-text-primary text-lg font-semibold'>
                    {t('error.noAccess')}
                </h2>
                <p className='text-text-tertiary mt-2 text-sm'>
                    {t('error.noAccessHint')}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
