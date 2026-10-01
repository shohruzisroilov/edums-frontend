'use client';

import { useT } from '@/i18n/provider';
import { BILLING_PERIODS, type BillingPeriod, type Tariff } from '@/types/api';
import { cn } from '@/utils/cn';

/** Tariflardagi eng katta yillik chegirma — almashtirgichdagi belgi uchun. */
export function maxYearlyDiscount(tariffs: Tariff[]): number | null {
    const discounts = tariffs
        .map((tariff) => tariff.yearly_discount_percent)
        .filter((value): value is number => value !== null);

    return discounts.length ? Math.max(...discounts) : null;
}

/**
 * "Oylik / Yillik" — tarif kartalaridagi narx shunga qarab ko'rsatiladi.
 * Hech bir tarif yillik sotilmasa, chizilmaydi.
 */
export function BillingPeriodSwitch({
    tariffs,
    value,
    onChange,
    className,
}: {
    tariffs: Tariff[];
    value: BillingPeriod;
    onChange: (period: BillingPeriod) => void;
    className?: string;
}) {
    const t = useT();
    const discount = maxYearlyDiscount(tariffs);

    if (discount === null) return null;

    return (
        <div
            role='radiogroup'
            aria-label={t('billing.periodLabel')}
            className={cn(
                'border-card-border bg-background-gray-secondary/60 inline-flex items-center gap-1 rounded-xl border p-1',
                className,
            )}
        >
            {BILLING_PERIODS.map((period) => {
                const active = value === period;

                return (
                    <button
                        key={period}
                        type='button'
                        role='radio'
                        aria-checked={active}
                        onClick={() => onChange(period)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                            active
                                ? 'bg-card-surface-area text-text-primary shadow-xs'
                                : 'text-text-tertiary hover:text-text-primary',
                        )}
                    >
                        {t(`billingPeriod.${period}`)}
                        {period === 'year' && discount > 0 && (
                            <span className='bg-badge-success-background text-badge-success-text rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums'>
                                {t('billing.upToDiscount', {
                                    percent: discount,
                                })}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
