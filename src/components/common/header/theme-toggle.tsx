'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useT } from '@/i18n/provider';
import { MoonHalfLeft5, Sun1 } from '@tailgrids/icons';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const t = useT();

    // Server joriy mavzuni bilmaydi, shuning uchun mount'gacha ikonka
    // ko'rsatilmaydi — aks holda hydration mos kelmay qolardi.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === 'dark';

    return (
        <Button
            iconOnly
            appearance='outline'
            aria-label={t('theme.toggle')}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            className='border-card-border bg-card-background text-icon-primary focus-visible:border-input-primary-focus-border focus-visible:ring-input-primary-focus-border/20 size-10 rounded-lg border shadow-xs outline-none focus-visible:ring-4'
        >
            {/* Tungi mavzuda quyosh ko'rsatiladi — bosilganda nima bo'lishini bildiradi. */}
            {mounted ? (
                isDark ? (
                    <Sun1 className='size-5' />
                ) : (
                    <MoonHalfLeft5 className='size-5' />
                )
            ) : (
                <span className='size-5' />
            )}
        </Button>
    );
}
