'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { useT } from '@/i18n/provider';
import { Home } from '@tailgrids/icons';
import Link from 'next/link';

/**
 * Login va ro'yxatdan o'tish sahifalarining yuqori paneli — landing page
 * header'i bilan bir xil ko'rinishda, shuning uchun foydalanuvchi bosh
 * sahifaga qaytish yo'lini darhol topadi: logotip ham, tugma ham `/` ga olib boradi.
 */
export function AuthHeader() {
    const t = useT();

    return (
        <header className='border-card-border bg-card-surface-area/90 sticky top-0 z-10 border-b backdrop-blur'>
            <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3'>
                <Link href='/' aria-label={t('nav.home')}>
                    <AppLogo />
                </Link>
                <div className='flex items-center gap-2'>
                    <Link
                        href='/'
                        aria-label={t('landing.backHome')}
                        className='border-card-border bg-card-background text-text-primary hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 flex h-9.5 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition outline-none focus-visible:ring-4'
                    >
                        <Home className='size-4' />
                        <span className='hidden sm:inline'>
                            {t('landing.backHome')}
                        </span>
                    </Link>
                    <LocaleSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
