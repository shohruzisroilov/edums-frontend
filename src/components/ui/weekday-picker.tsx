'use client';

import { useT } from '@/i18n/provider';
import { WEEKDAYS, type Weekday } from '@/types/api';
import { cn } from '@/utils/cn';
import { useId } from 'react';

/**
 * Dars kunlari — bir nechta kun tanlanadi. Har bir kun alohida checkbox:
 * tugma ko'rinishida bo'lsa ham holati ekran o'quvchiga aniq aytiladi va
 * klaviatura bilan bir xil ishlaydi.
 */
export function WeekdayPicker({
    label,
    hint,
    value,
    onChange,
    disabled,
}: {
    label: string;
    hint?: string;
    value: Weekday[];
    onChange: (value: Weekday[]) => void;
    disabled?: boolean;
}) {
    const groupId = useId();

    function toggle(day: Weekday) {
        onChange(
            value.includes(day)
                ? value.filter((item) => item !== day)
                : // Backend tartibiga rioya qilamiz — kunlar hafta bo'ylab.
                  WEEKDAYS.filter(
                      (item) => item === day || value.includes(item),
                  ),
        );
    }

    return (
        <fieldset className='flex flex-col gap-1.5' disabled={disabled}>
            <legend
                id={groupId}
                className='text-text-primary mb-1.5 text-sm font-medium'
            >
                {label}
            </legend>

            <div className='flex flex-wrap gap-2'>
                {WEEKDAYS.map((day) => (
                    <WeekdayChip
                        key={day}
                        day={day}
                        checked={value.includes(day)}
                        onToggle={() => toggle(day)}
                    />
                ))}
            </div>

            {hint && <p className='text-text-tertiary text-xs'>{hint}</p>}
        </fieldset>
    );
}

function WeekdayChip({
    day,
    checked,
    onToggle,
}: {
    day: Weekday;
    checked: boolean;
    onToggle: () => void;
}) {
    const t = useT();
    const id = useId();

    return (
        <div className='relative'>
            {/*
                Checkbox ko'rinmaydi, lekin DOM'da qoladi: fokus halqasi
                `peer-focus-visible` orqali yorliqda chiziladi.
            */}
            <input
                id={id}
                type='checkbox'
                checked={checked}
                onChange={onToggle}
                className='peer sr-only'
            />
            <label
                htmlFor={id}
                title={t(`weekday.${day}`)}
                className={cn(
                    'border-card-border flex h-9.5 min-w-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors select-none',
                    'peer-focus-visible:ring-input-primary-focus-border/30 peer-focus-visible:ring-4',
                    checked
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                        : 'bg-input-background text-text-secondary hover:text-text-primary',
                )}
            >
                {t(`weekdayShort.${day}`)}
            </label>
        </div>
    );
}
