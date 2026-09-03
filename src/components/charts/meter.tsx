'use client';

/**
 * Meter — bitta nisbatni chegaraga nisbatan ko'rsatadi.
 * Ikki bo'lakli halqa yoki diagramma o'rniga: bu yerda taqqoslanadigan
 * seriyalar yo'q, faqat "qanchasi" degan savol bor.
 */
export function Meter({
    value,
    total,
    valueLabel,
    caption,
    color,
}: {
    value: number;
    total: number;
    valueLabel: string;
    caption: string;
    color: string;
}) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className='flex flex-col'>
            <div className='flex items-baseline justify-between gap-3'>
                {/* Hero figura: oddiy sans, proporsional raqamlar. */}
                <span className='text-text-primary text-3xl font-semibold'>
                    {percent}%
                </span>
                <span className='text-text-tertiary text-sm tabular-nums'>
                    {valueLabel}
                </span>
            </div>

            <div
                role='meter'
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={caption}
                className='bg-chart-track mt-4 h-2.5 overflow-hidden rounded-full'
            >
                <div
                    className='h-full rounded-full transition-[width] duration-300'
                    style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                    }}
                />
            </div>

            <p className='text-text-tertiary mt-3 text-xs'>{caption}</p>
        </div>
    );
}
