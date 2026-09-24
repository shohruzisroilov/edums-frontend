'use client';

import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { Tariff } from '@/types/api';
import { Check } from '@tailgrids/icons';
import type { ReactNode } from 'react';

/**
 * Bitta tarif kartasi — landing page va tarif tanlash sahifasida bir xil
 * ko'rinishda. `action` — kartaning pastidagi tugma.
 */
export function TariffCard({
    tariff,
    action,
}: {
    tariff: Tariff;
    action: ReactNode;
}) {
    const t = useT();
    const { formatPrice } = useFormat();

    const features = [
        t('tariffs.durationValue', { days: tariff.duration_days }),
        tariff.max_users === null
            ? t('tariffs.usersUnlimited')
            : t('tariffs.usersLimit', { count: tariff.max_users }),
    ];

    return (
        <div className='border-card-border bg-card-background flex flex-col rounded-2xl border p-6'>
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
