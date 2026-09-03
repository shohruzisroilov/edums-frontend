'use client';

import { useState } from 'react';
import type { Datum } from './chart-card';

/**
 * Halqa diagramma — butunning qismlari uchun (6 tagacha bo'lak).
 *
 * Yaqin qiymatlarni taqqoslash uchun mos emas; bu yerda vazifasi "qaysi qism
 * ustun" degan savolga bir qarashda javob berish. Aniq sonlar legendada
 * turadi, shuning uchun tooltip yagona o'qish yo'li emas.
 *
 * Bo'laklar orasida 2px yuza bo'shlig'i qoldiriladi — chegara chizilmaydi.
 */
export function DonutChart({
    data,
    total,
    centerValue,
    centerLabel,
    size = 168,
}: {
    data: Datum[];
    total: number;
    centerValue: string;
    centerLabel: string;
    size?: number;
}) {
    const [active, setActive] = useState<string | null>(null);

    const stroke = 18;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const gap = 2; // yuza bo'shlig'i, piksel

    // Har bo'lakning boshlanish nuqtasi — undan oldingilarning yig'indisi.
    // `reduce` bilan yig'amiz: render paytida o'zgaruvchini o'zgartirmaymiz.
    const arcs = data
        .filter((d) => d.value > 0)
        .reduce<(Datum & { length: number; offset: number })[]>((acc, d) => {
            const previous = acc[acc.length - 1];
            const offset = previous
                ? previous.offset + (previous.value / total) * circumference
                : 0;
            const length = (d.value / total) * circumference;
            acc.push({ ...d, length: Math.max(0, length - gap), offset });
            return acc;
        }, []);

    return (
        <div
            className='relative mx-auto'
            style={{ width: size, height: size }}
            onMouseLeave={() => setActive(null)}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role='img'
                aria-label={`${centerLabel}: ${centerValue}`}
            >
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill='none'
                        strokeWidth={stroke}
                        className='stroke-chart-track'
                    />
                    {arcs.map((arc) => (
                        <circle
                            key={arc.key}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill='none'
                            stroke={arc.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                            strokeDashoffset={-arc.offset}
                            strokeLinecap='butt'
                            className='cursor-default transition-opacity duration-150'
                            style={{
                                opacity:
                                    active && active !== arc.key ? 0.35 : 1,
                            }}
                            onMouseEnter={() => setActive(arc.key)}
                        />
                    ))}
                </g>
            </svg>

            {/* Markazdagi son — hero figura: oddiy sans, tabular emas. */}
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-text-primary text-2xl font-semibold'>
                    {active
                        ? (data.find((d) => d.key === active)?.value ??
                          centerValue)
                        : centerValue}
                </span>
                <span className='text-text-tertiary mt-0.5 max-w-[7.5rem] truncate px-2 text-center text-xs'>
                    {active
                        ? (data.find((d) => d.key === active)?.label ??
                          centerLabel)
                        : centerLabel}
                </span>
            </div>
        </div>
    );
}
