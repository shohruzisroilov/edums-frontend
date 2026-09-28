'use client';

import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { Tariff } from '@/types/api';
import { Check } from '@tailgrids/icons';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

/**
 * Bitta tarif kartasi — landing page va tarif tanlash sahifasida bir xil
 * ko'rinishda. `action` — kartaning pastidagi tugma.
 */
export function TariffCard({
    tariff,
    action,
    isCurrent = false,
}: {
    tariff: Tariff;
    action: ReactNode;
    isCurrent?: boolean;
}) {
    const t = useT();
    const { formatPrice } = useFormat();

    const studentLimit = tariff.max_students ?? tariff.max_users ?? null;
    const features = [
        t('tariffs.durationValue', { days: tariff.duration_days }),
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
            <p className='text-text-primary mt-5 text-3xl font-semibold'>
                {formatPrice(tariff.price, t('common.som'))}
            </p>
            <p className='text-text-tertiary mt-1 text-xs'>
                {t('tariffs.perPeriod', { days: tariff.duration_days })}
            </p>
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
