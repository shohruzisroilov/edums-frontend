'use client';

import { useCompactNumber } from '@/components/ui/charts';
import { formatMonth } from '@/components/ui/month-switcher';
import { useFormat } from '@/hooks/use-format';
import { useT } from '@/i18n/provider';
import type { LeadStats, LeadStatus, MonthAmount } from '@/types/api';
import { cn } from '@/utils/cn';
import {
    BarChart2,
    PieChart1,
    Target3,
    TrendUp2,
    UserMultiple1,
} from '@tailgrids/icons';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';

/* ──────────────────────────────────────────────────────────────────────────
 * 1. PREMIUM KPI STAT CARD
 * ────────────────────────────────────────────────────────────────────────── */

interface KpiStatCardProps {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    href?: string;
    trend?: number;
    icon: ReactNode;
    colorScheme: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
    badgeText?: string;
    children?: ReactNode;
}

const colorStyles: Record<
    KpiStatCardProps['colorScheme'],
    {
        bg: string;
        border: string;
        text: string;
        glow: string;
        indicator: string;
    }
> = {
    blue: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        border: 'border-blue-500/20 dark:border-blue-400/30',
        text: 'text-blue-600 dark:text-blue-400',
        glow: 'from-blue-500/10 to-transparent',
        indicator: 'bg-blue-500',
    },
    emerald: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/20 dark:border-emerald-400/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        glow: 'from-emerald-500/10 to-transparent',
        indicator: 'bg-emerald-500',
    },
    violet: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/15',
        border: 'border-purple-500/20 dark:border-purple-400/30',
        text: 'text-purple-600 dark:text-purple-400',
        glow: 'from-purple-500/10 to-transparent',
        indicator: 'bg-purple-500',
    },
    amber: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        border: 'border-amber-500/20 dark:border-amber-400/30',
        text: 'text-amber-600 dark:text-amber-400',
        glow: 'from-amber-500/10 to-transparent',
        indicator: 'bg-amber-500',
    },
    rose: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        border: 'border-rose-500/20 dark:border-rose-400/30',
        text: 'text-rose-600 dark:text-rose-400',
        glow: 'from-rose-500/10 to-transparent',
        indicator: 'bg-rose-500',
    },
};

export function KpiStatCard({
    label,
    value,
    hint,
    href,
    trend,
    icon,
    colorScheme,
    badgeText,
    children,
}: KpiStatCardProps) {
    const style = colorStyles[colorScheme];

    const cardContent = (
        <div
            className={cn(
                'group relative flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-4.5 transition-all duration-200 sm:p-5',
                'border-card-border bg-card-background/90 shadow-xs backdrop-blur-xs',
                'hover:border-card-border/80 hover:shadow-md',
                href && 'cursor-pointer hover:-translate-y-0.5',
            )}
        >
            {/* Top Glow Ambient Gradient */}
            <div
                className={cn(
                    'pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition-opacity group-hover:opacity-100',
                    style.glow,
                )}
            />

            <div className='min-w-0'>
                {/* Header Row: Icon + Trend/Badge */}
                <div className='flex min-w-0 items-center justify-between gap-2'>
                    <div
                        className={cn(
                            'flex size-10.5 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105',
                            style.bg,
                            style.border,
                            style.text,
                        )}
                    >
                        {icon}
                    </div>

                    <div className='flex min-w-0 shrink-0 items-center gap-1.5'>
                        {badgeText && (
                            <span
                                className={cn(
                                    'truncate rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums',
                                    style.bg,
                                    style.text,
                                    'border',
                                    style.border,
                                )}
                            >
                                {badgeText}
                            </span>
                        )}

                        {trend !== undefined && trend !== 0 && (
                            <span
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                                    trend > 0
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
                                )}
                            >
                                {trend > 0 ? `↑ +${trend}%` : `↓ ${trend}%`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Metric Label & Value */}
                <div className='mt-3.5 min-w-0'>
                    <p className='text-text-tertiary truncate text-xs font-medium tracking-wide uppercase'>
                        {label}
                    </p>
                    <p className='text-text-primary font-display sm:text-2.5xl mt-1 text-2xl font-bold tracking-tight break-words tabular-nums min-[1400px]:text-3xl xl:text-2xl'>
                        {value}
                    </p>
                </div>
            </div>

            {/* Bottom Row / Extra / Hint */}
            <div className='border-card-border/60 mt-3 min-w-0 border-t pt-2.5'>
                {children}
                {hint && (
                    <p className='text-text-tertiary text-xs leading-relaxed break-words tabular-nums'>
                        {hint}
                    </p>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className='focus-visible:ring-brand-accent/30 block h-full rounded-2xl outline-none focus-visible:ring-4'
            >
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. FINANCIAL COMPARISON & MULTI-SERIES CHART
 * ────────────────────────────────────────────────────────────────────────── */

interface FinancialComparisonChartProps {
    revenueByMonth: MonthAmount[];
    expensesByMonth: MonthAmount[];
}

export function FinancialComparisonChart({
    revenueByMonth,
    expensesByMonth,
}: FinancialComparisonChartProps) {
    const t = useT();
    const { formatPrice } = useFormat();
    const compact = useCompactNumber();
    const som = t('common.som');

    const [filterMode, setFilterMode] = useState<
        'all' | 'revenue' | 'expenses' | 'profit'
    >('all');
    const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

    // Merge revenue and expenses by month
    const combinedData = useMemo(() => {
        const monthMap = new Map<
            string,
            { revenue: number; expenses: number; profit: number }
        >();

        for (const item of revenueByMonth) {
            monthMap.set(item.month, {
                revenue: item.amount,
                expenses: 0,
                profit: item.amount,
            });
        }

        for (const item of expensesByMonth) {
            const current = monthMap.get(item.month) ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
            };
            current.expenses = item.amount;
            current.profit = current.revenue - item.amount;
            monthMap.set(item.month, current);
        }

        const sortedMonths = Array.from(monthMap.keys()).sort();

        return sortedMonths.map((m) => {
            const data = monthMap.get(m)!;
            return {
                month: m,
                label: t(
                    `monthShort.${Number(m.slice(5))}` as Parameters<
                        typeof t
                    >[0],
                ),
                fullMonth: formatMonth(m, t),
                revenue: data.revenue,
                expenses: data.expenses,
                profit: data.profit,
            };
        });
    }, [revenueByMonth, expensesByMonth, t]);

    // Totals for top badge bar
    const totals = useMemo(() => {
        const totalRevenue = combinedData.reduce(
            (acc, d) => acc + d.revenue,
            0,
        );
        const totalExpenses = combinedData.reduce(
            (acc, d) => acc + d.expenses,
            0,
        );
        const totalProfit = totalRevenue - totalExpenses;
        const profitMargin =
            totalRevenue > 0
                ? Math.round((totalProfit / totalRevenue) * 100)
                : 0;

        return {
            totalRevenue,
            totalExpenses,
            totalProfit,
            profitMargin,
        };
    }, [combinedData]);

    // Maximum value for axis scaling
    const maxVal = useMemo(() => {
        let max = 0;
        for (const d of combinedData) {
            if (filterMode === 'all') {
                max = Math.max(max, d.revenue, d.expenses);
            } else if (filterMode === 'revenue') {
                max = Math.max(max, d.revenue);
            } else if (filterMode === 'expenses') {
                max = Math.max(max, d.expenses);
            } else if (filterMode === 'profit') {
                max = Math.max(max, Math.abs(d.profit));
            }
        }
        return Math.max(max, 1000);
    }, [combinedData, filterMode]);

    const ticks = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

    return (
        <div className='border-card-border bg-card-background/95 min-w-0 rounded-2xl border p-4.5 sm:p-6'>
            {/* Header with Title and Mode Switcher */}
            <div className='flex min-w-0 flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between'>
                <div className='min-w-0'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <span className='bg-brand-accent/10 text-brand-accent flex size-8 shrink-0 items-center justify-center rounded-lg'>
                            <BarChart2 className='size-4' />
                        </span>
                        <h2 className='text-text-primary font-display truncate text-base font-semibold sm:text-lg'>
                            {t('dashboard.financialAnalytics')}
                        </h2>
                    </div>
                    <p className='text-text-tertiary mt-1 text-xs'>
                        {t('dashboard.financialAnalyticsHint')}
                    </p>
                </div>

                {/* Filter Selector Tabs */}
                <div className='w-full max-w-full scrollbar-none overflow-x-auto py-0.5 lg:w-auto'>
                    <div className='border-card-border bg-background-gray-secondary/60 inline-flex min-w-max items-center rounded-xl border p-0.5 text-xs font-semibold whitespace-nowrap'>
                        <button
                            type='button'
                            onClick={() => setFilterMode('all')}
                            className={cn(
                                'shrink-0 rounded-lg px-2.5 py-1.5 transition-colors',
                                filterMode === 'all'
                                    ? 'bg-card-surface-area text-text-primary shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            {t('dashboard.allSeries')}
                        </button>
                        <button
                            type='button'
                            onClick={() => setFilterMode('revenue')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors',
                                filterMode === 'revenue'
                                    ? 'bg-card-surface-area text-emerald-600 shadow-xs dark:text-emerald-400'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <span className='size-2 shrink-0 rounded-full bg-emerald-500' />
                            {t('dashboard.revenueOnly')}
                        </button>
                        <button
                            type='button'
                            onClick={() => setFilterMode('expenses')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors',
                                filterMode === 'expenses'
                                    ? 'bg-card-surface-area text-rose-600 shadow-xs dark:text-rose-400'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <span className='size-2 shrink-0 rounded-full bg-rose-500' />
                            {t('dashboard.expensesOnly')}
                        </button>
                        <button
                            type='button'
                            onClick={() => setFilterMode('profit')}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors',
                                filterMode === 'profit'
                                    ? 'bg-card-surface-area text-brand-accent shadow-xs'
                                    : 'text-text-tertiary hover:text-text-primary',
                            )}
                        >
                            <span className='bg-brand-accent size-2 shrink-0 rounded-full' />
                            {t('dashboard.profitOnly')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className='border-card-border/70 bg-background-gray-primary/40 mt-4 grid grid-cols-2 gap-2.5 rounded-xl border p-2.5 sm:grid-cols-4 sm:p-3'>
                <div className='min-w-0 px-1 sm:px-2'>
                    <p className='text-text-tertiary truncate text-[11px] font-medium'>
                        {t('dashboard.sixMonthTotal')}
                    </p>
                    <p className='text-text-primary mt-0.5 truncate text-sm font-bold tabular-nums sm:text-base'>
                        {compact(totals.totalRevenue)} {som}
                    </p>
                </div>
                <div className='min-w-0 px-1 sm:px-2'>
                    <p className='text-text-tertiary truncate text-[11px] font-medium'>
                        {t('dashboard.sixMonthExpenses')}
                    </p>
                    <p className='text-text-primary mt-0.5 truncate text-sm font-bold tabular-nums sm:text-base'>
                        {compact(totals.totalExpenses)} {som}
                    </p>
                </div>
                <div className='min-w-0 px-1 sm:px-2'>
                    <p className='text-text-tertiary truncate text-[11px] font-medium'>
                        {t('dashboard.sixMonthProfit')}
                    </p>
                    <p
                        className={cn(
                            'mt-0.5 truncate text-sm font-bold tabular-nums sm:text-base',
                            totals.totalProfit >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400',
                        )}
                    >
                        {compact(totals.totalProfit)} {som}
                    </p>
                </div>
                <div className='min-w-0 px-1 sm:px-2'>
                    <p className='text-text-tertiary truncate text-[11px] font-medium'>
                        {t('dashboard.profitMargin')}
                    </p>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                        <span className='text-text-primary text-sm font-bold tabular-nums sm:text-base'>
                            {totals.profitMargin}%
                        </span>
                        <span className='inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400'>
                            <TrendUp2 className='size-3.5' />
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Graphic Area */}
            <div className='mt-6 min-w-0'>
                <div className='flex gap-2.5 sm:gap-3'>
                    {/* Y-Axis scale numbers */}
                    <div
                        aria-hidden
                        className='text-text-tertiary flex h-52 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums select-none sm:text-xs'
                    >
                        {ticks.map((val, idx) => (
                            <span
                                key={idx}
                                className='-translate-y-1/2 first:translate-y-0 last:translate-y-0'
                            >
                                {compact(val)}
                            </span>
                        ))}
                    </div>

                    {/* Chart Columns Area */}
                    <div className='relative min-w-0 flex-1'>
                        {/* Grid lines */}
                        <div
                            aria-hidden
                            className='absolute inset-0 flex flex-col justify-between'
                        >
                            {ticks.map((_, idx) => (
                                <div
                                    key={idx}
                                    className='border-card-border/60 border-t border-dashed'
                                />
                            ))}
                        </div>

                        {/* Bars Container */}
                        <div className='relative flex h-52 items-end gap-1.5 sm:gap-3'>
                            {combinedData.map((d) => {
                                const revH = Math.min(
                                    (d.revenue / maxVal) * 100,
                                    100,
                                );
                                const expH = Math.min(
                                    (d.expenses / maxVal) * 100,
                                    100,
                                );
                                const profH = Math.min(
                                    (Math.abs(d.profit) / maxVal) * 100,
                                    100,
                                );
                                const isHovered = hoveredMonth === d.month;

                                return (
                                    <div
                                        key={d.month}
                                        onMouseEnter={() =>
                                            setHoveredMonth(d.month)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredMonth(null)
                                        }
                                        className='group relative flex h-full flex-1 flex-col items-center justify-end rounded-lg p-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                                    >
                                        {/* Floating Tooltip */}
                                        {isHovered && (
                                            <div
                                                role='tooltip'
                                                className='border-card-border bg-card-surface-area/95 pointer-events-none absolute bottom-[105%] left-1/2 z-30 min-w-44 -translate-x-1/2 rounded-xl border p-2.5 shadow-xl backdrop-blur-md transition-all'
                                            >
                                                <p className='text-text-primary border-card-border/60 border-b pb-1 text-xs font-bold'>
                                                    {d.fullMonth}
                                                </p>
                                                <div className='mt-1.5 space-y-1 text-xs'>
                                                    <div className='flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400'>
                                                        <span className='flex items-center gap-1.5'>
                                                            <span className='size-2 rounded-full bg-emerald-500' />
                                                            {t(
                                                                'dashboard.revenueOnly',
                                                            )}
                                                        </span>
                                                        <span className='font-semibold tabular-nums'>
                                                            {formatPrice(
                                                                d.revenue,
                                                                som,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center justify-between gap-3 text-rose-600 dark:text-rose-400'>
                                                        <span className='flex items-center gap-1.5'>
                                                            <span className='size-2 rounded-full bg-rose-500' />
                                                            {t(
                                                                'dashboard.expensesOnly',
                                                            )}
                                                        </span>
                                                        <span className='font-semibold tabular-nums'>
                                                            {formatPrice(
                                                                d.expenses,
                                                                som,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className='border-card-border/60 text-text-primary flex items-center justify-between gap-3 border-t pt-1'>
                                                        <span className='font-medium'>
                                                            {t(
                                                                'dashboard.profitOnly',
                                                            )}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'font-bold tabular-nums',
                                                                d.profit >= 0
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-rose-600 dark:text-rose-400',
                                                            )}
                                                        >
                                                            {formatPrice(
                                                                d.profit,
                                                                som,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bars Group */}
                                        <div className='flex h-full w-full items-end justify-center gap-1'>
                                            {/* Revenue Bar */}
                                            {(filterMode === 'all' ||
                                                filterMode === 'revenue') && (
                                                <div
                                                    className={cn(
                                                        'max-w-4 flex-1 rounded-t-md transition-all duration-200 sm:max-w-6',
                                                        'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 shadow-2xs',
                                                        'group-hover:brightness-110',
                                                    )}
                                                    style={{
                                                        height: `${revH}%`,
                                                        minHeight:
                                                            d.revenue > 0
                                                                ? 3
                                                                : 0,
                                                    }}
                                                />
                                            )}

                                            {/* Expenses Bar */}
                                            {(filterMode === 'all' ||
                                                filterMode === 'expenses') && (
                                                <div
                                                    className={cn(
                                                        'max-w-4 flex-1 rounded-t-md transition-all duration-200 sm:max-w-6',
                                                        'bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 shadow-2xs',
                                                        'group-hover:brightness-110',
                                                    )}
                                                    style={{
                                                        height: `${expH}%`,
                                                        minHeight:
                                                            d.expenses > 0
                                                                ? 3
                                                                : 0,
                                                    }}
                                                />
                                            )}

                                            {/* Profit Bar */}
                                            {filterMode === 'profit' && (
                                                <div
                                                    className={cn(
                                                        'max-w-5 flex-1 rounded-t-md shadow-2xs transition-all duration-200 sm:max-w-8',
                                                        d.profit >= 0
                                                            ? 'bg-gradient-to-t from-blue-600 to-teal-400'
                                                            : 'bg-gradient-to-t from-red-600 to-orange-400',
                                                        'group-hover:brightness-110',
                                                    )}
                                                    style={{
                                                        height: `${profH}%`,
                                                        minHeight:
                                                            Math.abs(d.profit) >
                                                            0
                                                                ? 3
                                                                : 0,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* X-Axis Month Labels */}
                <div
                    aria-hidden
                    className='mt-2.5 flex min-w-0 gap-2.5 sm:gap-3'
                >
                    <span className='invisible shrink-0 text-xs tabular-nums select-none'>
                        {compact(maxVal)}
                    </span>
                    <div className='flex min-w-0 flex-1 gap-1.5 sm:gap-3'>
                        {combinedData.map((d) => (
                            <span
                                key={d.month}
                                className={cn(
                                    'flex-1 truncate px-0.5 text-center text-xs font-medium transition-colors',
                                    hoveredMonth === d.month
                                        ? 'text-brand-accent font-bold'
                                        : 'text-text-tertiary',
                                )}
                            >
                                {d.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. ATTENDANCE RADIAL & DISTRIBUTION CARD
 * ────────────────────────────────────────────────────────────────────────── */

interface AttendanceRadialCardProps {
    rate: number | null;
    marked: number;
    present: number;
    late: number;
    absent: number;
}

export function AttendanceRadialCard({
    rate,
    marked,
    present,
    late,
    absent,
}: AttendanceRadialCardProps) {
    const t = useT();

    const percentage = rate !== null ? Math.round(rate * 100) : 0;
    const totalEntries = present + late + absent || 1;

    const presentPct = Math.round((present / totalEntries) * 100);
    const latePct = Math.round((late / totalEntries) * 100);
    const absentPct = Math.round((absent / totalEntries) * 100);

    // SVG Circular Meter Math
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className='border-card-border bg-card-background/95 @container flex h-full min-w-0 flex-col justify-between rounded-2xl border p-4.5 sm:p-5.5'>
            <div className='min-w-0'>
                {/* Header */}
                <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                            <PieChart1 className='size-4' />
                        </span>
                        <h2 className='text-text-primary font-display truncate text-base font-semibold'>
                            {t('dashboard.attendanceDistribution')}
                        </h2>
                    </div>
                    <span className='border-card-border bg-background-gray-secondary/70 text-text-tertiary shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums'>
                        {t('dashboard.attendanceHint', { count: marked })}
                    </span>
                </div>

                {/* Circular Gauge + Hero Stats */}
                <div className='mt-5 flex min-w-0 flex-col items-center justify-center gap-4 @[340px]:flex-row @[340px]:gap-6'>
                    {/* SVG Radial Progress Ring */}
                    <div className='relative size-24 shrink-0 sm:size-26'>
                        <svg
                            className='size-full -rotate-90 transform'
                            viewBox='0 0 96 96'
                        >
                            <circle
                                cx='48'
                                cy='48'
                                r={radius}
                                stroke='currentColor'
                                strokeWidth='8'
                                fill='transparent'
                                className='text-card-surface-area'
                            />
                            <circle
                                cx='48'
                                cy='48'
                                r={radius}
                                stroke='url(#attendanceGradient)'
                                strokeWidth='8'
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap='round'
                                fill='transparent'
                                className='transition-all duration-700 ease-out'
                            />
                            <defs>
                                <linearGradient
                                    id='attendanceGradient'
                                    x1='0%'
                                    y1='0%'
                                    x2='100%'
                                    y2='100%'
                                >
                                    <stop offset='0%' stopColor='#10b981' />
                                    <stop offset='100%' stopColor='#06b6d4' />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Center Percentage Display */}
                        <div className='absolute inset-0 flex flex-col items-center justify-center'>
                            <span className='text-text-primary font-display text-xl font-bold tabular-nums sm:text-2xl'>
                                {rate !== null ? `${percentage}%` : '—'}
                            </span>
                            <span className='text-text-tertiary text-[10px] font-medium uppercase'>
                                {t('dashboard.attendanceRate')}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown Pill Cards */}
                    <div className='flex w-full min-w-0 flex-1 flex-col gap-2'>
                        <div className='flex min-w-0 items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 dark:bg-emerald-500/10'>
                            <div className='flex items-center gap-1.5 truncate'>
                                <span className='size-2 shrink-0 rounded-full bg-emerald-500' />
                                <span className='truncate text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                                    {t('attendanceStatus.present')}
                                </span>
                            </div>
                            <span className='ml-2 shrink-0 text-xs font-bold text-emerald-800 tabular-nums dark:text-emerald-200'>
                                {present} ({presentPct}%)
                            </span>
                        </div>

                        <div className='flex min-w-0 items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 dark:bg-amber-500/10'>
                            <div className='flex items-center gap-1.5 truncate'>
                                <span className='size-2 shrink-0 rounded-full bg-amber-500' />
                                <span className='truncate text-xs font-medium text-amber-700 dark:text-amber-300'>
                                    {t('attendanceStatus.late')}
                                </span>
                            </div>
                            <span className='ml-2 shrink-0 text-xs font-bold text-amber-800 tabular-nums dark:text-amber-200'>
                                {late} ({latePct}%)
                            </span>
                        </div>

                        <div className='flex min-w-0 items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 dark:bg-rose-500/10'>
                            <div className='flex items-center gap-1.5 truncate'>
                                <span className='size-2 shrink-0 rounded-full bg-rose-500' />
                                <span className='truncate text-xs font-medium text-rose-700 dark:text-rose-300'>
                                    {t('attendanceStatus.absent')}
                                </span>
                            </div>
                            <span className='ml-2 shrink-0 text-xs font-bold text-rose-800 tabular-nums dark:text-rose-200'>
                                {absent} ({absentPct}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stacked Proportional Bar */}
                <div className='mt-5'>
                    <div className='bg-card-surface-area ring-card-border/60 flex h-2.5 w-full overflow-hidden rounded-full ring-1'>
                        <div
                            style={{ width: `${presentPct}%` }}
                            className='bg-emerald-500 transition-all duration-500'
                            title={`${t('attendanceStatus.present')}: ${presentPct}%`}
                        />
                        <div
                            style={{ width: `${latePct}%` }}
                            className='bg-amber-500 transition-all duration-500'
                            title={`${t('attendanceStatus.late')}: ${latePct}%`}
                        />
                        <div
                            style={{ width: `${absentPct}%` }}
                            className='bg-rose-500 transition-all duration-500'
                            title={`${t('attendanceStatus.absent')}: ${absentPct}%`}
                        />
                    </div>
                </div>
            </div>

            {/* Footer link to schedule */}
            <div className='border-card-border/60 mt-4 border-t pt-3'>
                <Link
                    href='/schedule'
                    className='text-brand-accent hover:text-brand-accent/80 flex items-center justify-between text-xs font-semibold'
                >
                    <span>{t('nav.schedule')}</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. LEADS CONVERSION FUNNEL & PIPELINE
 * ────────────────────────────────────────────────────────────────────────── */

interface LeadFunnelCardProps {
    leads: LeadStats;
    newLeadsThisMonth: number;
}

const STAGE_CONFIG: {
    status: LeadStatus;
    color: string;
    barColor: string;
    textColor: string;
}[] = [
    {
        status: 'new',
        color: 'bg-blue-500',
        barColor: 'from-blue-600 to-blue-400',
        textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        status: 'contacted',
        color: 'bg-amber-500',
        barColor: 'from-amber-600 to-amber-400',
        textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
        status: 'trial',
        color: 'bg-purple-500',
        barColor: 'from-purple-600 to-purple-400',
        textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        status: 'won',
        color: 'bg-emerald-500',
        barColor: 'from-emerald-600 to-emerald-400',
        textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        status: 'lost',
        color: 'bg-slate-400 dark:bg-slate-500',
        barColor: 'from-slate-500 to-slate-400',
        textColor: 'text-slate-500 dark:text-slate-400',
    },
];

export function LeadFunnelCard({
    leads,
    newLeadsThisMonth,
}: LeadFunnelCardProps) {
    const t = useT();

    const totalLeads = useMemo(() => {
        return Object.values(leads).reduce((sum, val) => sum + val, 0);
    }, [leads]);

    const maxStageVal = useMemo(() => {
        return Math.max(...Object.values(leads), 1);
    }, [leads]);

    const conversionRate = useMemo(() => {
        if (totalLeads === 0) return 0;
        return Math.round((leads.won / totalLeads) * 100);
    }, [leads, totalLeads]);

    return (
        <div className='border-card-border bg-card-background/95 @container flex h-full min-w-0 flex-col justify-between rounded-2xl border p-4.5 sm:p-5.5'>
            <div className='min-w-0'>
                {/* Header */}
                <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                            <Target3 className='size-4' />
                        </span>
                        <h2 className='text-text-primary font-display truncate text-base font-semibold'>
                            {t('dashboard.leadFunnel')}
                        </h2>
                    </div>

                    <div className='flex shrink-0 items-center gap-2'>
                        <span className='rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 tabular-nums dark:text-emerald-300'>
                            {t('dashboard.conversionRate')}: {conversionRate}%
                        </span>
                    </div>
                </div>

                <p className='text-text-tertiary mt-1 text-xs'>
                    {t('dashboard.newLeads', { count: newLeadsThisMonth })}
                </p>

                {/* Funnel Bars */}
                <div className='mt-4.5 space-y-2.5'>
                    {STAGE_CONFIG.map((cfg) => {
                        const count = leads[cfg.status] ?? 0;
                        const pctOfTotal =
                            totalLeads > 0
                                ? Math.round((count / totalLeads) * 100)
                                : 0;
                        const barWidth = Math.max(
                            Math.round((count / maxStageVal) * 100),
                            count > 0 ? 4 : 0,
                        );

                        return (
                            <div
                                key={cfg.status}
                                className='group flex flex-col gap-1'
                            >
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='text-text-secondary flex items-center gap-2 font-medium'>
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                cfg.color,
                                            )}
                                        />
                                        {t(`leadStatus.${cfg.status}`)}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-text-tertiary tabular-nums'>
                                            {pctOfTotal}%
                                        </span>
                                        <span className='text-text-primary font-bold tabular-nums'>
                                            {count}
                                        </span>
                                    </div>
                                </div>

                                <div className='bg-card-surface-area ring-card-border/40 h-2 w-full overflow-hidden rounded-full ring-1'>
                                    <div
                                        style={{ width: `${barWidth}%` }}
                                        className={cn(
                                            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                                            cfg.barColor,
                                        )}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer link to leads */}
            <div className='border-card-border/60 mt-4 border-t pt-3'>
                <Link
                    href='/leads'
                    className='text-brand-accent hover:text-brand-accent/80 flex items-center justify-between text-xs font-semibold'
                >
                    <span>{t('nav.leads')}</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5. STUDENT DYNAMICS & FLOW CARD
 * ────────────────────────────────────────────────────────────────────────── */

interface StudentDynamicsCardProps {
    activeStudents: number;
    joinedThisMonth: number;
    leftThisMonth: number;
    activeGroups: number;
}

export function StudentDynamicsCard({
    activeStudents,
    joinedThisMonth,
    leftThisMonth,
    activeGroups,
}: StudentDynamicsCardProps) {
    const t = useT();

    const netGrowth = joinedThisMonth - leftThisMonth;
    const retentionRate =
        activeStudents > 0
            ? Math.min(
                  Math.max(
                      Math.round(
                          ((activeStudents - leftThisMonth) / activeStudents) *
                              100,
                      ),
                      0,
                  ),
                  100,
              )
            : 100;

    const avgGroupCapacity =
        activeGroups > 0 ? Math.round(activeStudents / activeGroups) : 0;

    return (
        <div className='border-card-border bg-card-background/95 @container flex h-full min-w-0 flex-col justify-between rounded-2xl border p-4.5 sm:p-5.5'>
            <div className='min-w-0'>
                {/* Header */}
                <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                            <UserMultiple1 className='size-4' />
                        </span>
                        <h2 className='text-text-primary font-display truncate text-base font-semibold'>
                            {t('dashboard.studentFlow')}
                        </h2>
                    </div>

                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums',
                            netGrowth >= 0
                                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                        )}
                    >
                        {t('dashboard.netGrowth')}:{' '}
                        {netGrowth >= 0 ? `+${netGrowth}` : netGrowth}
                    </span>
                </div>

                <p className='text-text-tertiary mt-1 text-xs'>
                    {t('dashboard.studentFlowHint')}
                </p>

                {/* 2-box Inflow vs Outflow grid */}
                <div className='mt-4 grid grid-cols-2 gap-2.5'>
                    <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-500/10'>
                        <div className='flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                            <TrendUp2 className='size-3.5' />
                            <span>+{joinedThisMonth}</span>
                        </div>
                        <p className='text-text-primary mt-1 text-lg font-bold tabular-nums'>
                            +{joinedThisMonth}
                        </p>
                        <p className='text-text-tertiary text-[11px]'>
                            {
                                t('dashboard.joinedLeft', {
                                    joined: joinedThisMonth,
                                    left: 0,
                                }).split(',')[0]
                            }
                        </p>
                    </div>

                    <div className='rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 dark:bg-rose-500/10'>
                        <div className='flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>
                            <span className='size-3.5 rotate-180'>
                                <TrendUp2 className='size-3.5' />
                            </span>
                            <span>−{leftThisMonth}</span>
                        </div>
                        <p className='text-text-primary mt-1 text-lg font-bold tabular-nums'>
                            −{leftThisMonth}
                        </p>
                        <p className='text-text-tertiary text-[11px]'>
                            {t('dashboard.joinedLeft', {
                                joined: 0,
                                left: leftThisMonth,
                            }).split(',')[1] ?? ''}
                        </p>
                    </div>
                </div>

                {/* Retention & Groups Metrics */}
                <div className='mt-4 space-y-3'>
                    <div>
                        <div className='flex items-center justify-between text-xs'>
                            <span className='text-text-secondary font-medium'>
                                {t('dashboard.retentionRate')}
                            </span>
                            <span className='text-text-primary font-bold tabular-nums'>
                                {retentionRate}%
                            </span>
                        </div>
                        <div className='bg-card-surface-area ring-card-border/40 mt-1.5 h-2 w-full overflow-hidden rounded-full ring-1'>
                            <div
                                style={{ width: `${retentionRate}%` }}
                                className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500'
                            />
                        </div>
                    </div>

                    <div className='border-card-border/70 bg-background-gray-primary/40 flex items-center justify-between rounded-xl border p-2.5 text-xs'>
                        <span className='text-text-secondary font-medium'>
                            {t('dashboard.avgGroupSize')}
                        </span>
                        <span className='text-text-primary font-bold tabular-nums'>
                            ≈ {avgGroupCapacity}{' '}
                            {t('dashboard.studentsCount', { count: '' }).trim()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer link to students */}
            <div className='border-card-border/60 mt-4 border-t pt-3'>
                <Link
                    href='/students'
                    className='text-brand-accent hover:text-brand-accent/80 flex items-center justify-between text-xs font-semibold'
                >
                    <span>{t('nav.students')}</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}
