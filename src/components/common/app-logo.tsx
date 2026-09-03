'use client';

import { Logo, LogoWithText, LogoWithTextDark } from '@/utils/icon';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Mavzuga qarab to'g'ri logotipni tanlaydi. Server joriy mavzuni bilmagani
 * uchun mount'gacha yorug' variant chiziladi — bu hydration mosligini saqlaydi.
 */
export function AppLogo({ collapsed = false }: { collapsed?: boolean }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (collapsed) return <Logo />;

    return mounted && resolvedTheme === 'dark' ? (
        <LogoWithTextDark />
    ) : (
        <LogoWithText />
    );
}
