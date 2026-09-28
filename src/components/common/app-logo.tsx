'use client';

import { Logo, LogoWithText, LogoWithTextDark } from './logo-icons';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export interface AppLogoProps {
    collapsed?: boolean;
    className?: string;
    variant?: 'default' | 'white';
}

/**
 * Mavzuga qarab to'g'ri logotipni tanlaydi. Server joriy mavzuni bilmagani
 * uchun mount'gacha yorug' variant chiziladi — bu hydration mosligini saqlaydi.
 */
export function AppLogo({
    collapsed = false,
    className,
    variant,
}: AppLogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (collapsed) return <Logo className={className} />;

    if (variant === 'white') {
        return <LogoWithTextDark className={className} />;
    }

    return mounted && resolvedTheme === 'dark' ? (
        <LogoWithTextDark className={className} />
    ) : (
        <LogoWithText className={className} />
    );
}
