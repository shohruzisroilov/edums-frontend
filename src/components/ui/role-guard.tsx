'use client';

import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import type { AccessRole } from '@/types/api';
import type { ReactNode } from 'react';

/**
 * Sahifani rol bo'yicha yopadi. Bu faqat interfeys darajasidagi to'siq —
 * haqiqiy tekshiruv backend guard'larida.
 */
export function RoleGuard({
    allow,
    children,
}: {
    allow: AccessRole[];
    children: ReactNode;
}) {
    const { session } = useSession();
    const t = useT();

    if (!session) return null;

    if (!allow.includes(session.role)) {
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
