'use client';

import { MenuIcon } from '@/components/common/header/icons';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { UserProfileButton } from '@/components/common/header/user-profile';
import { AppLogo } from '@/components/common/app-logo';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { useT } from '@/i18n/provider';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const t = useT();

    return (
        <header className='border-card-border bg-card-surface-area sticky top-0 z-40 w-full border-b-[0.5px] px-3 py-3 lg:px-5'>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <button
                        type='button'
                        onClick={onMenuClick}
                        aria-label={t('nav.openMenu')}
                        className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 -ml-1 flex size-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-4 xl:hidden'
                    >
                        <MenuIcon />
                    </button>

                    <span className='xl:hidden'>
                        <AppLogo />
                    </span>
                </div>

                <div className='flex items-center gap-2.5'>
                    <LocaleSwitcher />
                    <ThemeToggle />
                    <UserProfileButton />
                </div>
            </div>
        </header>
    );
}
