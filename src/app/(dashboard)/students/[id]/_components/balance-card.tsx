'use client';

import { Skeleton } from '@/components/tailgrids/core/skeleton';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import { getStudentBalance } from '@/services/api/student-payments';
import { cn } from '@/utils/cn';
import { balanceTone } from '@/utils/tone';
import { useQuery } from '@tanstack/react-query';

/**
 * O'quvchi sahifasining birinchi kartasi — kassir o'quvchini ochganda
 * birinchi so'raydigan savol "qarzi bormi?". Guruhlar bo'yicha tafsilot
 * pastdagi "Balans" bo'limida (`#finance`); so'rov o'sha bo'lim bilan
 * umumiy keshda.
 */
export function BalanceCard({ studentId }: { studentId: string }) {
    const t = useT();
    const { formatPrice } = useFormat();

    const query = useQuery({
        queryKey: ['student-balance', studentId],
        queryFn: () => getStudentBalance(studentId),
    });

    const balance = query.data?.balance ?? 0;
    const status =
        balance < 0
            ? t('balance.statusDebt')
            : balance > 0
              ? t('balance.statusCredit')
              : t('balance.statusClear');

    return (
        <a
            href='#finance'
            className={cn(
                'border-card-border bg-card-background hover:border-brand-accent/40 focus-visible:ring-button-outline-focus-ring block rounded-xl border p-4 transition-colors outline-none focus-visible:ring-4',
                balance < 0 && 'border-badge-error-text/30',
            )}
        >
            <p className='text-text-tertiary text-xs'>{t('balance.title')}</p>
            {query.isPending ? (
                <Skeleton className='mt-2 h-5 w-28' />
            ) : query.error ? (
                <p className='text-text-tertiary mt-1.5 text-sm'>—</p>
            ) : (
                <>
                    <p
                        className={cn(
                            'font-display mt-1 text-lg font-semibold tabular-nums',
                            balanceTone(balance) ?? 'text-text-primary',
                        )}
                    >
                        {formatPrice(balance, t('common.som'))}
                    </p>
                    <p className='text-text-tertiary text-xs'>
                        {status} · {t('balance.details')}
                    </p>
                </>
            )}
        </a>
    );
}
