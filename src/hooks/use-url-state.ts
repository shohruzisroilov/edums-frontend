'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/** `null` — parametr manzildan olib tashlanadi. */
export type UrlChanges = Record<string, string | null>;

/**
 * Sahifa holatini (filtr, qidiruv, sahifa, oy) manzilda saqlash uchun asos.
 * Manzilda turgani uchun o'quvchini ochib "orqaga" qaytilganda, sahifa
 * yangilanganda yoki havola ulashilganda holat yo'qolmaydi.
 *
 * `replace` ishlatiladi, `push` emas: har bir filtr bosilishi tarixga
 * yozilsa, "orqaga" tugmasi sahifadan chiqish o'rniga filtrlarni qaytarardi.
 */
export function useUrlParams() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Bir renderda ketma-ket ikki o'zgarish (masalan, "dan" va "gacha")
    // bir-birini yo'qotmasligi uchun oxirgi yozilgan holat shu yerda turadi.
    const latest = useRef(params.toString());
    useEffect(() => {
        latest.current = params.toString();
    }, [params]);

    const update = useCallback(
        (changes: UrlChanges) => {
            const next = new URLSearchParams(latest.current);
            for (const [key, value] of Object.entries(changes)) {
                if (value === null) next.delete(key);
                else next.set(key, value);
            }
            const query = next.toString();
            if (query === latest.current) return;
            latest.current = query;
            router.replace(query ? `${pathname}?${query}` : pathname, {
                scroll: false,
            });
        },
        [router, pathname],
    );

    return { params, update };
}

/**
 * Bitta qiymat manzilda: `const [month, setMonth] = useUrlParam('month', currentMonth())`.
 * Standart qiymat manzilga yozilmaydi — havola toza qoladi.
 */
export function useUrlParam(
    key: string,
    defaultValue: string,
): [string, (value: string) => void] {
    const { params, update } = useUrlParams();
    const value = params.get(key) ?? defaultValue;

    const setValue = useCallback(
        (next: string) =>
            update({ [key]: next === defaultValue ? null : next }),
        [update, key, defaultValue],
    );

    return [value, setValue];
}
