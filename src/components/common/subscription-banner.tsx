'use client';

import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Shu kundan kam qolganda pulli tarifda ham ogohlantiriladi. */
const WARN_DAYS = 3;

/**
 * Sahifa tepasidagi obuna eslatmasi: sinov muddati davomida har doim,
 * pulli tarifda — tugashiga oz qolganda, tugagan bo'lsa — qizil.
 * Ma'lumot sessiyadan olinadi; u har kirishda /auth/me dan yangilanadi.
 */
export function SubscriptionBanner() {
    const { session } = useSession();
    const pathname = usePathname();
    const t = useT();

    const subscription = session?.subscription;
    if (session?.kind !== 'user' || !subscription) return null;

    const expired = !subscription.active;
    // Pulli tarifga obuna bo'lganmi (kind === 'paid' yoki tariff_name mavjud bo'lsa)
    const isPaid =
        subscription.kind === 'paid' || Boolean(subscription.tariff_name);

    // Bepul sinov banneri FAQAT pulli tarifga obuna bo'lmagan markazlarga chiqadi
    const trial = !isPaid && subscription.kind === 'trial';

    // Pulli tarifda esa faqat tugashiga oz (3 kun yoki kam) qolganda ogohlantirish chiqadi
    const ending = isPaid && subscription.days_left <= WARN_DAYS;

    if (!expired && !trial && !ending) return null;

    const message = expired
        ? t('billing.bannerExpired')
        : trial
          ? t('billing.bannerTrial', { days: subscription.days_left })
          : t('billing.bannerEnding', { days: subscription.days_left });

    const showLink = can(session, 'billing.manage') && pathname !== '/billing';

    return (
        <div className='px-5 pt-4'>
            <div
                role='status'
                className={cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
                    expired || ending
                        ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
                        : 'border-card-border bg-card-background text-text-primary',
                )}
            >
                <span>{message}</span>
                {showLink && (
                    <Link
                        href='/billing'
                        className='text-brand-accent font-semibold hover:underline'
                    >
                        {t('billing.chooseTariff')}
                    </Link>
                )}
            </div>
        </div>
    );
}
