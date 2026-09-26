'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** Havolaga qo'shilsa, sahifa yaratish oynasi ochiq holda ochiladi. */
export const NEW_PARAM = 'new';

/** `/students` → `/students?new=1`. */
export function withNewParam(href: string): string {
    return `${href}${href.includes('?') ? '&' : '?'}${NEW_PARAM}=1`;
}

/**
 * `?new=1` bilan ochilgan sahifada yaratish oynasini darhol ochadi — dashboard
 * qadamlari va tez amallar shu yo'l bilan to'g'ridan-to'g'ri formaga olib
 * boradi. Parametr keyin manzildan olib tashlanadi: aks holda sahifa
 * yangilanganda yoki orqaga qaytilganda oyna yana ochilardi.
 */
export function useOpenOnNewParam(
    open: () => void,
    enabled = true,
    param = NEW_PARAM,
) {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const requested = params.get(param) === '1';

    useEffect(() => {
        if (!enabled || !requested) return;
        open();

        const next = new URLSearchParams(params.toString());
        next.delete(param);
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
        });
        // `open` har renderda yangi funksiya — faqat parametr kuzatiladi.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, requested]);
}
