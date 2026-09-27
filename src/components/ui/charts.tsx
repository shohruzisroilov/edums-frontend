'use client';

import { formatMonth } from '@/components/ui/month-switcher';
import { useFormat } from '@/hooks/use-format';
import { useT, type Translate } from '@/i18n/provider';
import type { MonthAmount } from '@/types/api';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import type { ReactNode } from 'react';

/*
 * Kutubxonasiz, oddiy HTML grafiklar — bitta seriya, bitta brend rangi
 * (legenda kerak emas: sarlavha nima chizilganini aytadi). Qoidalar:
 * ustun ≤ 24px, yuqori uchi 4px yumaloq, asosda to'g'ri; qo'shni ustunlar
 * orasida bo'shliq; faqat oxirgi qiymat yozib qo'yiladi, qolgani — hover va
 * fokusdagi tooltip hamda ekran o'quvchilar uchun jadvalda. Matn hech qachon
 * seriya rangida emas — faqat text-* tokenlari.
 */

/** 12 400 000 → "12,4 mln" — joriy tilning birliklari bilan. */
export function useCompactNumber() {
    const t = useT();
    const { formatNumber } = useFormat();

    return (value: number): string => {
        const abs = Math.abs(value);
        const units: [number, Parameters<typeof t>[0]][] = [
            [1e9, 'units.billion'],
            [1e6, 'units.million'],
            [1e3, 'units.thousand'],
        ];

        for (const [size, unit] of units) {
            if (abs >= size) {
                const scaled = Math.round((value / size) * 10) / 10;
                // Kasr qismi vergul bilan: 12,4 — o'zbek, rus va ingliz
                // matnlarida ham tushunarli, minglik ajratgich bilan adashmaydi.
                return `${String(scaled).replace('.', ',')} ${t(unit)}`;
            }
        }

        return formatNumber(value);
    };
}

/** Bitta asosiy raqam: yorliq, qiymat va ostida izoh. */
export function StatTile({
    label,
    value,
    hint,
    href,
    trend,
    children,
}: {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    href?: string;
    trend?: number;
    /** Qiymat ostidagi qo'shimcha — masalan, shkala. */
    children?: ReactNode;
}) {
    const content = (
        <div
            className={cn(
                'border-card-border bg-card-background flex flex-col rounded-xl border p-4 transition-colors',
                href && 'hover:border-input-primary-focus-border hover:shadow-sm cursor-pointer',
            )}
        >
            <div className='flex items-center justify-between gap-2'>
                <p className='text-text-tertiary text-xs'>{label}</p>
                {trend !== undefined && trend !== 0 && (
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
                            trend > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400',
                        )}
                    >
                        {trend > 0 ? `↑${trend}%` : `↓${Math.abs(trend)}%`}
                    </span>
                )}
            </div>
            <p className='text-text-primary font-display mt-1.5 text-2xl font-semibold'>
                {value}
            </p>
            {children}
            {hint && (
                <p className='text-text-tertiary mt-1 text-xs tabular-nums'>
                    {hint}
                </p>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

/** 0–1 ulush uchun shkala: iz — o'sha rangning och qadami. */
export function Meter({ value, label }: { value: number; label: string }) {
    const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);

    return (
        <div
            role='meter'
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className='bg-brand-accent/15 mt-2 h-1.5 w-full overflow-hidden rounded-full'
        >
            <div
                className='bg-brand-accent h-full rounded-full'
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

/** Oy qatorlari → ustunlar: o'qda qisqa nom, tooltip va jadvalda to'liq. */
export function monthColumns(rows: MonthAmount[], t: Translate): ColumnDatum[] {
    return rows.map((row) => ({
        key: row.month,
        label: t(
            `monthShort.${Number(row.month.slice(5))}` as Parameters<Translate>[0],
        ),
        fullLabel: formatMonth(row.month, t),
        value: row.amount,
    }));
}

/** O'qdagi toza qadam: 1, 2, 5 × 10ⁿ — eng katta qiymatdan kichik emas. */
function niceMax(value: number): number {
    if (value <= 0) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 5, 10].find((m) => m * magnitude >= value) ?? 10;
    return step * magnitude;
}

export interface ColumnDatum {
    key: string;
    /** O'qdagi qisqa yorliq. */
    label: string;
    /** Tooltip va jadvaldagi to'liq yorliq. */
    fullLabel: string;
    value: number;
}

/**
 * Bitta seriyali ustunli grafik (vaqt bo'yicha). Oxirgi ustun qiymati
 * ustiga yoziladi; boshqalari — tooltip va jadvalda.
 */
export function ColumnChart({
    data,
    formatValue,
    formatAxis,
    caption,
}: {
    data: ColumnDatum[];
    /** Tooltip, oxirgi ustun va jadval uchun. */
    formatValue: (value: number) => string;
    /** Y-o'q uchun ixcham ko'rinish. */
    formatAxis: (value: number) => string;
    /** Jadval sarlavhasi (ekran o'quvchilar uchun). */
    caption: string;
}) {
    const t = useT();
    const max = niceMax(Math.max(...data.map((datum) => datum.value), 0));
    const ticks = [max, max / 2, 0];

    return (
        <figure>
            <div className='flex gap-3'>
                {/* Y-o'q: uchta toza qiymat va ular bo'ylab ingichka chiziqlar. */}
                <div
                    aria-hidden
                    className='text-text-tertiary flex h-44 flex-col justify-between text-right text-[11px] tabular-nums'
                >
                    {ticks.map((tick) => (
                        <span
                            key={tick}
                            className='-translate-y-1/2 first:translate-y-0 last:translate-y-0'
                        >
                            {formatAxis(tick)}
                        </span>
                    ))}
                </div>

                <div className='relative flex-1'>
                    <div
                        aria-hidden
                        className='absolute inset-0 flex flex-col justify-between'
                    >
                        {ticks.map((tick) => (
                            <div
                                key={tick}
                                className='border-card-border border-t'
                            />
                        ))}
                    </div>

                    <div className='relative flex h-44 items-end gap-0.5'>
                        {data.map((datum, index) => {
                            const isLast = index === data.length - 1;
                            const height = (datum.value / max) * 100;

                            return (
                                <div
                                    key={datum.key}
                                    tabIndex={0}
                                    aria-label={`${datum.fullLabel}: ${formatValue(datum.value)}`}
                                    className='group relative flex h-full flex-1 items-end justify-center outline-none'
                                >
                                    {isLast && datum.value > 0 && (
                                        <span
                                            className='text-text-secondary absolute left-1/2 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap tabular-nums'
                                            style={{
                                                bottom: `calc(${height}% + 4px)`,
                                            }}
                                        >
                                            {formatAxis(datum.value)}
                                        </span>
                                    )}
                                    <div
                                        className='bg-brand-accent w-full max-w-6 rounded-t transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80'
                                        style={{
                                            height: `${height}%`,
                                            // Nol bo'lmagan qiymat ko'rinsin.
                                            minHeight: datum.value > 0 ? 2 : 0,
                                        }}
                                    />
                                    <div
                                        role='tooltip'
                                        className='border-card-border bg-card-background pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg border px-2.5 py-1.5 shadow-sm group-hover:block group-focus-visible:block'
                                    >
                                        <p className='text-text-primary text-xs font-semibold whitespace-nowrap tabular-nums'>
                                            {formatValue(datum.value)}
                                        </p>
                                        <p className='text-text-tertiary text-[11px] whitespace-nowrap'>
                                            {datum.fullLabel}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div aria-hidden className='mt-2 flex gap-3'>
                {/* Y-o'q kengligiga teng bo'sh joy — yorliqlar ustunlar ostida. */}
                <span className='invisible text-[11px] tabular-nums'>
                    {formatAxis(max)}
                </span>
                <div className='flex flex-1 gap-0.5'>
                    {data.map((datum) => (
                        <span
                            key={datum.key}
                            className='text-text-tertiary flex-1 text-center text-[11px]'
                        >
                            {datum.label}
                        </span>
                    ))}
                </div>
            </div>

            <table className='sr-only'>
                <caption>{caption}</caption>
                <thead>
                    <tr>
                        <th scope='col'>{t('chart.month')}</th>
                        <th scope='col'>{t('chart.value')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((datum) => (
                        <tr key={datum.key}>
                            <th scope='row'>{datum.fullLabel}</th>
                            <td>{formatValue(datum.value)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}

/** Gorizontal chiziqlar (masalan, voronka): yorliq, chiziq, uchida qiymat. */
export function HorizontalBars({
    rows,
    formatValue,
}: {
    rows: { key: string; label: string; value: number }[];
    formatValue: (value: number) => string;
}) {
    const max = Math.max(...rows.map((row) => row.value), 1);

    return (
        <ul className='flex flex-col gap-2.5'>
            {rows.map((row) => (
                <li
                    key={row.key}
                    className='grid grid-cols-[7rem_1fr_auto] items-center gap-3'
                >
                    <span className='text-text-secondary truncate text-sm'>
                        {row.label}
                    </span>
                    <div className='h-3'>
                        <div
                            className='bg-brand-accent h-full rounded-r'
                            style={{
                                width: `${(row.value / max) * 100}%`,
                                minWidth: row.value > 0 ? 2 : 0,
                            }}
                        />
                    </div>
                    <span className='text-text-primary text-sm font-medium tabular-nums'>
                        {formatValue(row.value)}
                    </span>
                </li>
            ))}
        </ul>
    );
}
