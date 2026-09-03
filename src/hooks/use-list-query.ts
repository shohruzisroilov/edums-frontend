'use client';

import { useCallback, useState } from 'react';

/**
 * Ro'yxat sahifalari uchun umumiy holat: qidiruv, filtrlar va limit/offset.
 * Filtr yoki qidiruv o'zgarganda offset avtomatik 0 ga qaytadi — aks holda
 * foydalanuvchi bo'sh sahifada qolib ketardi.
 */
export function useListQuery<TFilters extends Record<string, string>>(
    initialFilters: TFilters,
) {
    const [search, setSearchValue] = useState('');
    const [filters, setFiltersValue] = useState<TFilters>(initialFilters);
    const [limit, setLimitValue] = useState(20);
    const [offset, setOffset] = useState(0);

    const setSearch = useCallback((value: string) => {
        setSearchValue(value);
        setOffset(0);
    }, []);

    const setFilter = useCallback(
        <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
            setFiltersValue((prev) => ({ ...prev, [key]: value }));
            setOffset(0);
        },
        [],
    );

    const setLimit = useCallback((value: number) => {
        setLimitValue(value);
        setOffset(0);
    }, []);

    return {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    };
}
