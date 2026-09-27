'use client';

import { getPublicPlatformSettings } from '@/services/api/platform-settings';
import { useQuery } from '@tanstack/react-query';

/** Backenddagi standart qiymat — javob kelguncha shu ko'rsatiladi. */
const DEFAULT_TRIAL_DAYS = 30;

/**
 * Bepul sinov muddati (kun). Uni super admin platforma sozlamalarida
 * o'zgartiradi, shuning uchun landing va ro'yxatdan o'tish matnlari raqamni
 * lug'atdan emas, backenddan oladi.
 */
export function useTrialDays(): number {
    const query = useQuery({
        queryKey: ['platform-settings', 'public'],
        queryFn: getPublicPlatformSettings,
        staleTime: 60 * 1000,
    });

    return query.data?.trial_days ?? DEFAULT_TRIAL_DAYS;
}
