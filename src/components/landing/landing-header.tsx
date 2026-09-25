'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/** Sahifa ichidagi bo'limlar — `id` lari page.tsx dagi bo'limlarga mos. */
export const LANDING_NAV: { href: string; label: TranslationKey }[] = [
    { href: '#features', label: 'landing.navFeatures' },
    { href: '#how', label: 'landing.navHow' },
    { href: '#tariffs', label: 'landing.navTariffs' },
    { href: '#faq', label: 'landing.navFaq' },
];

export function LandingHeader({
    signedIn,
    onStart,
}: {
    signedIn: boolean;
    onStart: () => void;
}) {
    const t = useT();
    const router = useRouter();

    return (
        <header className='border-card-border bg-card-surface-area/90 sticky top-0 z-20 border-b backdrop-blur'>
            <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3'>
                <Link href='/' aria-label={t('nav.home')}>
                    <AppLogo />
                </Link>
                <nav
                    aria-label={t('landing.navLabel')}
                    className='hidden items-center gap-1 lg:flex'
                >
                    {LANDING_NAV.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className='text-text-secondary hover:text-text-primary rounded-lg px-3 py-2 text-sm font-medium transition'
                        >
                            {t(item.label)}
                        </a>
                    ))}
                </nav>
                <div className='flex items-center gap-2'>
                    <LocaleSwitcher />
                    <ThemeToggle />
                    {signedIn ? (
                        <Button size='md' onPress={onStart}>
                            {t('landing.openCabinet')}
                        </Button>
                    ) : (
                        <>
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => router.push('/login')}
                            >
                                {t('auth.signIn')}
                            </Button>
                            <Button
                                size='md'
                                className='hidden sm:flex'
                                onPress={onStart}
                            >
                                {t('landing.startFree')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
