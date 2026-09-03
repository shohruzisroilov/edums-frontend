'use client';

import { useT } from '@/i18n/provider';
import { Search1 } from '@tailgrids/icons';
import { useEffect, useState } from 'react';

/** Qidiruv maydoni — yozishdan 350 ms keyin so'rov yuboriladi. */
export function SearchInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    const t = useT();
    // Maydon o'z holatini yuritadi, ota komponentga esa debounce bilan uzatiladi.
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        if (draft === value) return;
        const timer = setTimeout(() => onChange(draft), 350);
        return () => clearTimeout(timer);
    }, [draft, value, onChange]);

    return (
        <div className='relative w-full sm:max-w-64'>
            <Search1 className='text-text-tertiary pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2' />
            <input
                type='search'
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder ?? t('common.search')}
                className='border-card-border bg-input-background text-title-50 placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-input-primary-focus-border/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition outline-none focus:ring-4'
            />
        </div>
    );
}
