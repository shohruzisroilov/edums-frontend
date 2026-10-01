'use client';

import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { BillingPeriod, Tariff } from '@/types/api';
import { Check } from '@tailgrids/icons';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

/** Yillik narxdagi kun soni — backenddagi YEAR_DAYS bilan bir xil. */
const YEAR_DAYS = 365;

/** Tarif yillik tanlansa, haqiqatda yillik sotiladimi. */
export function isYearly(tariff: Tariff, period: BillingPeriod): boolean {
    return period === 'year' && tariff.yearly_price !== null;
}

/**
 * Bitta tarif kartasi — landing page va tarif tanlash sahifasida bir xil
 * ko'rinishda. `action` — kartaning pastidagi tugma. `period` — "Yillik"
 * tanlangan bo'lsa, yillik narx, 12 oylik to'liq narx va tejalgan summa.
 */
export function TariffCard({
    tariff,
    action,
    isCurrent = false,
    period = 'month',
}: {
    tariff: Tariff;
    action: ReactNode;
    isCurrent?: boolean;
    period?: BillingPeriod;
}) {
    const t = useT();
    const { formatPrice } = useFormat();
    const som = t('common.som');

    const yearly = isYearly(tariff, period);
    const price = yearly ? (tariff.yearly_price as number) : tariff.price;
    // 12 oylik to'liq narx — tarif davri 30 kun bo'lmasa ham oyga keltiriladi.
    const twelveMonths = Math.round(
        (tariff.price * 30 * 12) / tariff.duration_days,
    );
    const savings = yearly ? twelveMonths - price : 0;

    const studentLimit = tariff.max_students ?? tariff.max_users ?? null;
    const features = [
        t('tariffs.durationValue', {
            days: yearly ? YEAR_DAYS : tariff.duration_days,
        }),
        studentLimit === null
            ? t('tariffs.studentsUnlimited')
            : t('tariffs.studentsLimit', { count: studentLimit }),
    ];

    return (
        <div
            className={cn(
                'bg-card-background relative flex h-full flex-col rounded-2xl p-6 transition-all',
                isCurrent
                    ? 'border-brand-accent ring-brand-accent/15 bg-brand-accent/[0.02] border-2 shadow-md ring-2'
                    : 'border-card-border border',
            )}
        >
            {isCurrent && (
                <div className='bg-brand-accent absolute -top-3 right-5 flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-xs'>
                    <Check className='size-3 shrink-0' />
                    <span>{t('billing.currentPlan')}</span>
                </div>
            )}
            <h3 className='text-text-primary font-display text-lg font-semibold'>
                {tariff.name}
            </h3>
            {tariff.description && (
                <p className='text-text-tertiary mt-1.5 text-sm'>
                    {tariff.description}
                </p>
            )}
            {yearly && savings > 0 ? (
                <p className='text-text-tertiary mt-5 text-sm tabular-nums line-through'>
                    {formatPrice(twelveMonths, som)}
                </p>
            ) : null}
            <p
                className={cn(
                    'text-text-primary text-3xl font-semibold tabular-nums',
                    yearly && savings > 0 ? 'mt-0.5' : 'mt-5',
                )}
            >
                {formatPrice(price, som)}
            </p>
            <p className='text-text-tertiary mt-1 text-xs'>
                {yearly
                    ? t('tariffs.perYear', {
                          monthly: formatPrice(Math.round(price / 12), som),
                      })
                    : t('tariffs.perPeriod', { days: tariff.duration_days })}
            </p>
            {yearly && savings > 0 && (
                <p className='bg-badge-success-background text-badge-success-text mt-2 self-start rounded-md px-2 py-0.5 text-xs font-semibold'>
                    {t('tariffs.yearlySavings', {
                        amount: formatPrice(savings, som),
                        percent: tariff.yearly_discount_percent ?? 0,
                    })}
                </p>
            )}
            {period === 'year' && !yearly && (
                <p className='text-text-tertiary mt-2 text-xs'>
                    {t('tariffs.monthlyOnly')}
                </p>
            )}
            <ul className='mt-5 flex flex-1 flex-col gap-2.5'>
                {features.map((feature) => (
                    <li
                        key={feature}
                        className='text-text-secondary flex items-center gap-2 text-sm'
                    >
                        <Check className='text-brand-accent size-4 shrink-0' />
                        {feature}
                    </li>
                ))}
            </ul>
            <div className='mt-6'>{action}</div>
        </div>
    );
}
