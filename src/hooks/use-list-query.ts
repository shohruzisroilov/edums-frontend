'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUrlParams } from './use-url-state';

const DEFAULT_LIMIT = 20;
/** Backend `PaginationDto` chegarasi — qo'lda yozilgan manzil 400 bermasin. */
const MAX_LIMIT = 200;

/** Manzildagi nomlar: `?q=ali&status=active&page=3&limit=50`. */
const SEARCH_PARAM = 'q';
const PAGE_PARAM = 'page';
const LIMIT_PARAM = 'limit';

/**
 * Ro'yxat sahifalari uchun umumiy holat: qidiruv, filtrlar va limit/offset.
 * Hammasi manzilda saqlanadi (`useUrlParams`): o'quvchini ochib "orqaga"
 * qaytilsa, qidiruv, filtr va sahifa joyida qoladi.
 *
 * Filtr yoki qidiruv o'zgarganda sahifa birinchisiga qaytadi — aks holda
 * foydalanuvchi bo'sh sahifada qolib ketardi. Standart qiymatlar manzilga
 * yozilmaydi; standartdan farqli bo'sh qiymat ("barcha holatlar") esa
 * `status=` ko'rinishida yoziladi.
 */
export function useListQuery<TFilters extends Record<string, string>>(
    initialFilters: TFilters,
) {
    const { params, update } = useUrlParams();
    // Chaqiruvchi har renderda yangi obyekt beradi — birinchisi yetarli.
    const [defaults] = useState(initialFilters);

    const search = params.get(SEARCH_PARAM) ?? '';
    const limit = Math.min(
        positiveInt(params.get(LIMIT_PARAM)) ?? DEFAULT_LIMIT,
        MAX_LIMIT,
    );
    const page = positiveInt(params.get(PAGE_PARAM)) ?? 1;
    const offset = (page - 1) * limit;

    const query = params.toString();
    const filters = useMemo(() => {
        const current = new URLSearchParams(query);
        const result: Record<string, string> = { ...defaults };
        for (const key of Object.keys(defaults)) {
            const value = current.get(key);
            if (value !== null) result[key] = value;
        }
        return result as TFilters;
    }, [query, defaults]);

    const setSearch = useCallback(
        (value: string) =>
            update({ [SEARCH_PARAM]: value || null, [PAGE_PARAM]: null }),
        [update],
    );

    const setFilter = useCallback(
        <K extends keyof TFilters>(key: K, value: TFilters[K]) =>
            update({
                [key as string]: value === defaults[key] ? null : value,
                [PAGE_PARAM]: null,
            }),
        [update, defaults],
    );

    const setFilters = useCallback(
        (values: Partial<TFilters>) => {
            const changes: Record<string, string | null> = {
                [PAGE_PARAM]: null,
            };
            for (const [key, value] of Object.entries(values)) {
                changes[key] =
                    value === undefined || value === defaults[key]
                        ? null
                        : (value as string);
            }
            update(changes);
        },
        [update, defaults],
    );

    const setLimit = useCallback(
        (value: number) =>
            update({
                [LIMIT_PARAM]: value === DEFAULT_LIMIT ? null : String(value),
                [PAGE_PARAM]: null,
            }),
        [update],
    );

    const setOffset = useCallback(
        (value: number) => {
            const next = Math.floor(value / limit) + 1;
            update({ [PAGE_PARAM]: next === 1 ? null : String(next) });
        },
        [update, limit],
    );

    return {
        search,
        setSearch,
        filters,
        setFilter,
        setFilters,
        limit,
        setLimit,
        offset,
        setOffset,
    };
}

function positiveInt(value: string | null): number | null {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

/**
 * Sahifa ro'yxat oxiridan o'tib ketsa — oxirgi sahifadagi yagona yozuv
 * o'chirilgan yoki manzilda `?page=99` — oxirgi mavjud sahifaga qaytaradi.
 * Aks holda yozuvlar bor bo'lsa ham "hech narsa yo'q" ko'rinib, sahifalash
 * ham yashirinib qolardi.
 */
export function useOffsetInRange(
    count: number | undefined,
    offset: number,
    limit: number,
    setOffset: (offset: number) => void,
) {
    useEffect(() => {
        if (count === undefined || offset === 0 || offset < count) return;
        setOffset(count === 0 ? 0 : Math.floor((count - 1) / limit) * limit);
    }, [count, offset, limit, setOffset]);
}
