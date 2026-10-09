'use client';

import { DatePicker } from '@/components/ui/date-picker';
import { SelectInput } from '@/components/ui/form-field';
import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import { toISODate } from '@/utils/format';

export type DatePreset =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'this_month'
    | 'last_month'
    | 'all';

export function getPresetDateRange(preset: DatePreset): {
    from: string;
    to: string;
} {
    const now = new Date();
    const todayStr = toISODate(now);

    if (preset === 'today') {
        return { from: todayStr, to: todayStr };
    }
    if (preset === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const yStr = toISODate(y);
        return { from: yStr, to: yStr };
    }
    if (preset === 'this_week') {
        const monday = new Date(now);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        return { from: toISODate(monday), to: todayStr };
    }
    if (preset === 'this_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: toISODate(firstDay), to: todayStr };
    }
    if (preset === 'last_month') {
        const firstDayLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
        );
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
            from: toISODate(firstDayLastMonth),
            to: toISODate(lastDayLastMonth),
        };
    }
    return { from: '', to: '' };
}

export function DateRangeFilter({
    from,
    to,
    onDateChange,
    className,
    size = 'md',
}: {
    from: string;
    to: string;
    onDateChange: (range: { from: string; to: string }) => void;
    className?: string;
    size?: 'sm' | 'md';
}) {
    const t = useT();

    // Determine active preset
    const activePreset = (() => {
        if (!from && !to) return 'all';
        for (const preset of [
            'today',
            'yesterday',
            'this_week',
            'this_month',
            'last_month',
        ] as DatePreset[]) {
            const range = getPresetDateRange(preset);
            if (range.from === from && range.to === to) return preset;
        }
        return 'custom';
    })();

    const presets: { id: DatePreset; label: string }[] = [
        { id: 'today', label: t('dateRange.today') },
        { id: 'yesterday', label: t('dateRange.yesterday') },
        { id: 'this_week', label: t('dateRange.thisWeek') },
        { id: 'this_month', label: t('dateRange.thisMonth') },
        { id: 'last_month', label: t('dateRange.lastMonth') },
        { id: 'all', label: t('dateRange.all') },
    ];

    const applyPreset = (preset: DatePreset) => {
        onDateChange(getPresetDateRange(preset));
    };

    return (
        <div
            className={cn(
                'flex w-full flex-wrap items-center gap-2.5 sm:w-auto',
                className,
            )}
        >
            {/* Desktopda davr — ixcham ro'yxat: oltita tugma filtr qatorini
                ikkiga bo'lib yuborardi. Telefonda (filtr oynasida) tugmalar. */}
            <div className='hidden w-36 shrink-0 sm:block'>
                <SelectInput
                    aria-label={t('dateRange.period')}
                    options={[
                        ...presets
                            .filter((p) => p.id !== 'all')
                            .map((p) => ({ value: p.id, label: p.label })),
                        ...(activePreset === 'custom'
                            ? [
                                  {
                                      value: 'custom',
                                      label: t('dateRange.custom'),
                                  },
                              ]
                            : []),
                    ]}
                    placeholder={t('dateRange.all')}
                    value={activePreset === 'all' ? '' : activePreset}
                    onValueChange={(next) => {
                        if (next !== 'custom') {
                            applyPreset((next || 'all') as DatePreset);
                        }
                    }}
                />
            </div>

            <div className='border-card-border bg-background-gray-secondary/50 flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border p-1 shadow-xs sm:hidden'>
                {presets.map((p) => {
                    const isActive = activePreset === p.id;
                    return (
                        <button
                            key={p.id}
                            type='button'
                            onClick={() => applyPreset(p.id)}
                            className={cn(
                                'shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:py-1',
                                isActive
                                    ? 'bg-card-surface-area text-brand-accent font-semibold shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            <div className='flex w-full items-center gap-2 sm:w-auto'>
                <div
                    className={cn(
                        'min-w-0 flex-1 sm:flex-initial',
                        size === 'sm' ? 'sm:w-32' : 'sm:w-38',
                    )}
                >
                    <DatePicker
                        size={size}
                        align='left'
                        aria-label={t('common.from')}
                        title={t('common.from')}
                        value={from}
                        max={to || undefined}
                        onDateChange={(val) => onDateChange({ from: val, to })}
                    />
                </div>
                <span
                    className={cn(
                        'text-text-tertiary shrink-0 font-medium',
                        size === 'sm' ? 'text-xs' : 'text-sm',
                    )}
                >
                    —
                </span>
                <div
                    className={cn(
                        'min-w-0 flex-1 sm:flex-initial',
                        size === 'sm' ? 'sm:w-32' : 'sm:w-38',
                    )}
                >
                    <DatePicker
                        size={size}
                        align='right'
                        aria-label={t('common.to')}
                        title={t('common.to')}
                        value={to}
                        min={from || undefined}
                        onDateChange={(val) => onDateChange({ from, to: val })}
                    />
                </div>
            </div>
        </div>
    );
}
