'use client';

import { useState } from 'react';
import type { Datum } from './chart-card';

/**
 * Gorizontal ustunli diagramma — magnitudani taqqoslash uchun.
 * Nomlar uzun bo'lgani va soni oldindan nomaʼlum bo'lgani uchun gorizontal:
 * vertikal ustunlarda yorliqlar qiyshayib ketardi.
 *
 * Ranglar: barcha ustunlar bitta ohangda — uzunlikning o'zi qiyoslash
 * vositasi, rang qo'shimcha ma'no tashimaydi.
 */
export function BarChart({
    data,
    formatValue,
    emphasisKey,
}: {
    data: Datum[];
    formatValue: (value: number) => string;
    /** Ajratib ko'rsatiladigan qator; qolganlari xiralashadi. */
    emphasisKey?: string;
}) {
    const [active, setActive] = useState<string | null>(null);
    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <ul
            className='flex flex-col gap-4'
            onMouseLeave={() => setActive(null)}
        >
            {data.map((item) => {
                const dimmed =
                    (active && active !== item.key) ||
                    (!active && emphasisKey && emphasisKey !== item.key);

                return (
                    <li
                        key={item.key}
                        onMouseEnter={() => setActive(item.key)}
                        className='transition-opacity duration-150'
                        style={{ opacity: dimmed ? 0.45 : 1 }}
                    >
                        <div className='mb-1.5 flex items-baseline justify-between gap-3 text-sm'>
                            <span className='text-text-secondary truncate'>
                                {item.label}
                            </span>
                            <span className='text-text-primary shrink-0 font-medium tabular-nums'>
                                {formatValue(item.value)}
                            </span>
                        </div>
                        {/* Yo'lak va to'ldirish — ingichka marka, 4px yumaloq uchi. */}
                        <div className='bg-chart-track h-2 overflow-hidden rounded'>
                            <div
                                className='h-full rounded transition-[width] duration-300'
                                style={{
                                    width: `${(item.value / max) * 100}%`,
                                    backgroundColor: item.color,
                                }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
