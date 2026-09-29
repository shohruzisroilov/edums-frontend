'use client';

import { TextInput } from '@/components/ui/form-field';
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
}: {
    from: string;
    to: string;
    onDateChange: (range: { from: string; to: string }) => void;
    className?: string;
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
        { id: 'today', label: 'Bugun' },
        { id: 'yesterday', label: 'Kechagi' },
        { id: 'this_week', label: 'Shu hafta' },
        { id: 'this_month', label: 'Shu oy' },
        { id: 'last_month', label: "O'tgan oy" },
        { id: 'all', label: 'Barchasi' },
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
            {/* Presets Bar */}
            <div className='border-card-border bg-background-gray-secondary/50 flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border p-1 shadow-xs sm:flex-wrap'>
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

            {/* Custom Range Inputs */}
            <div className='flex w-full items-center gap-2 sm:w-auto'>
                <div className='flex-1 sm:w-40 sm:flex-none'>
                    <TextInput
                        type='date'
                        aria-label={t('common.from')}
                        title={t('common.from')}
                        placeholder={t('common.from')}
                        value={from}
                        onChange={(e) =>
                            onDateChange({ from: e.target.value, to })
                        }
                    />
                </div>
                <span className='text-text-tertiary shrink-0 text-xs font-medium'>
                    —
                </span>
                <div className='flex-1 sm:w-40 sm:flex-none'>
                    <TextInput
                        type='date'
                        aria-label={t('common.to')}
                        title={t('common.to')}
                        placeholder={t('common.to')}
                        value={to}
                        onChange={(e) =>
                            onDateChange({ from, to: e.target.value })
                        }
                    />
                </div>
            </div>
        </div>
    );
}
