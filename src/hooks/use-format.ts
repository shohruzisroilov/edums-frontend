'use client';

import { useLocale } from '@/i18n/provider';
import { createFormatters } from '@/utils/format';
import { useMemo } from 'react';

/** Joriy tilga bog'langan sana/son formatlagichlari. */
export function useFormat() {
    const { locale } = useLocale();
    return useMemo(() => createFormatters(locale), [locale]);
}
