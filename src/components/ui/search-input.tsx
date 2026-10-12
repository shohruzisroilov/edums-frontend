'use client';

import { cn } from '@/utils/cn';
import { useT } from '@/i18n/provider';
import { Search1 } from '@tailgrids/icons';
import { useEffect, useRef, useState } from 'react';

/** Qidiruv maydoni — yozishdan 350 ms keyin so'rov yuboriladi. */
export function SearchInput({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const t = useT();
    // Maydon o'z holatini yuritadi, ota komponentga esa debounce bilan uzatiladi.
    const [draft, setDraft] = useState(value);
    // Oxirgi uzatilgan qiymat. `value` undan farq qilsa, o'zgarish tashqaridan
    // kelgan (orqaga qaytish, filtrni tozalash) — maydon shunga moslashadi.
    // Yozish davomida kelgan eski qiymat esa yozilayotgan matnni o'chirmaydi.
    const sent = useRef(value);

    useEffect(() => {
        if (value === sent.current) return;
        sent.current = value;
        setDraft(value);
    }, [value]);

    useEffect(() => {
        if (draft === sent.current) return;
        const timer = setTimeout(() => {
            sent.current = draft;
            onChange(draft);
        }, 350);
        return () => clearTimeout(timer);
    }, [draft, onChange]);

    const label = placeholder ?? t('common.search');

    return (
        <div className={cn('relative w-full min-w-0 sm:max-w-64', className)}>
            <Search1
                aria-hidden='true'
                className='text-text-tertiary pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2'
            />
            {/* Placeholder yorliq o'rnini bosmaydi: yozila boshlaganda u
                yo'qoladi, ekran o'quvchi esa uni nom deb o'qimasligi mumkin. */}
            <input
                type='search'
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={label}
                aria-label={label}
                className='border-input-border bg-input-background text-title-50 placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-input-primary-focus-border/20 h-11 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition outline-none focus:ring-4'
            />
        </div>
    );
}
