'use client';

import { useT } from '@/i18n/provider';
import { WEEKDAYS, type Weekday } from '@/types/api';
import { cn } from '@/utils/cn';

/** Hafta kunlarini belgilash — har bir kun alohida tugma (aria-pressed). */
export function WeekdayPicker({
    label,
    required,
    value,
    onChange,
}: {
    label: string;
    required?: boolean;
    value: Weekday[];
    onChange: (days: Weekday[]) => void;
}) {
    const t = useT();

    function toggle(day: Weekday) {
        onChange(
            value.includes(day)
                ? value.filter((item) => item !== day)
                : [...value, day].sort((a, b) => a - b),
        );
    }

    return (
        <fieldset className='flex flex-col gap-1.5'>
            <legend className='text-text-primary mb-1.5 text-sm font-medium'>
                {label}
                {required && <span className='text-red-500'> *</span>}
            </legend>
            <div className='flex flex-wrap gap-2'>
                {WEEKDAYS.map((day) => {
                    const selected = value.includes(day);

                    return (
                        <button
                            key={day}
                            type='button'
                            aria-pressed={selected}
                            title={t(`weekdayLong.${day}`)}
                            onClick={() => toggle(day)}
                            className={cn(
                                'min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition',
                                selected
                                    ? 'bg-brand-500 border-transparent text-white'
                                    : 'border-card-border text-text-secondary hover:text-text-primary',
                            )}
                        >
                            {t(`weekday.${day}`)}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
