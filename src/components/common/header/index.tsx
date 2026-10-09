'use client';

import { AppLogo } from '@/components/common/app-logo';
import { GlobalSearchModal } from '@/components/common/header/global-search-modal';
import { MenuIcon } from '@/components/common/header/icons';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { UserProfileButton } from '@/components/common/header/user-profile';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { LinkButton } from '@/components/ui/link-button';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { can } from '@/utils/access';
import { Funnel1, Search1, UserCircle1, Wallet2 } from '@tailgrids/icons';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

/** Mac'da Ctrl emas, Cmd bosiladi — yorliq ham shunga mos bo'lishi kerak. */
function isApplePlatform() {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const t = useT();
    const { session } = useSession();
    const [searchOpen, setSearchOpen] = useState(false);
    const [shortcut] = useState(() => (isApplePlatform() ? '⌘K' : 'Ctrl+K'));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const canAddPayment = can(session, 'payments.create');
    const canAddStudent = can(session, 'students.create');
    const canAddLead = can(session, 'leads.create');

    return (
        <header className='border-card-border bg-card-surface-area sticky top-0 z-40 w-full border-b-[0.5px] px-3 py-2.5 sm:py-3 lg:px-5'>
            <div className='flex items-center justify-between gap-2 sm:gap-3'>
                <div className='flex items-center gap-2 sm:gap-3'>
                    <button
                        type='button'
                        onClick={onMenuClick}
                        aria-label={t('nav.openMenu')}
                        className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 -ml-1 flex size-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-4 md:hidden'
                    >
                        <MenuIcon />
                    </button>

                    <Link
                        href='/'
                        className='flex shrink-0 items-center md:hidden'
                        aria-label='EDUMS'
                    >
                        <span className='sm:hidden'>
                            <AppLogo collapsed className='size-8' />
                        </span>
                        <span className='hidden sm:inline-block'>
                            <AppLogo />
                        </span>
                    </Link>

                    {/* Global Search Trigger */}
                    <button
                        type='button'
                        onClick={() => setSearchOpen(true)}
                        className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary hover:border-input-primary-focus-border focus-visible:ring-brand-accent/30 group hidden items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all outline-none focus-visible:ring-2 sm:flex'
                    >
                        <Search1 className='text-icon-tertiary group-hover:text-text-secondary size-4 transition-colors' />
                        <span className='text-text-tertiary group-hover:text-text-secondary text-xs font-medium transition-colors'>
                            {t('header.searchPlaceholder')}
                        </span>
                        <kbd className='border-card-border bg-card-surface-area text-text-tertiary group-hover:text-text-secondary rounded-md border px-1.5 text-xs font-semibold tracking-tight shadow-xs transition-colors'>
                            {shortcut}
                        </kbd>
                    </button>
                </div>

                {/* Right Actions */}
                <div className='flex items-center gap-2 sm:gap-2.5'>
                    {/* Tez amallar: md–xl oralig'ida faqat ikonka (nomi
                        tooltip va aria-label'da), keng ekranda — yozuv bilan. */}
                    <div className='hidden items-center gap-2 md:flex'>
                        {canAddPayment && (
                            <QuickAction
                                href='/cashbox?new=1'
                                label={t('header.quickPayment')}
                                icon={<Wallet2 />}
                            />
                        )}
                        {canAddStudent && (
                            <QuickAction
                                href='/students?new=1'
                                label={t('header.quickStudent')}
                                icon={<UserCircle1 />}
                            />
                        )}
                        {canAddLead && (
                            <QuickAction
                                href='/leads?new=1'
                                label={t('header.quickLead')}
                                icon={<Funnel1 />}
                            />
                        )}
                    </div>

                    {/* Mobile Search Button */}
                    <button
                        type='button'
                        onClick={() => setSearchOpen(true)}
                        aria-label={t('header.searchPlaceholder')}
                        className='border-card-border bg-card-background text-icon-primary hover:bg-background-gray-secondary focus-visible:border-input-primary-focus-border focus-visible:ring-input-primary-focus-border/20 flex size-11 items-center justify-center rounded-lg border shadow-xs transition-colors outline-none focus-visible:ring-4 sm:hidden'
                    >
                        <Search1 className='size-5' />
                    </button>

                    <div className='hidden items-center gap-1.5 sm:flex'>
                        <LocaleSwitcher />
                        <ThemeToggle />
                    </div>
                    <UserProfileButton />
                </div>
            </div>

            <GlobalSearchModal
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </header>
    );
}

function QuickAction({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: ReactNode;
}) {
    return (
        <LinkButton
            href={href}
            title={label}
            className='h-9 px-2.5 text-xs xl:px-3 [&>svg]:size-4'
        >
            {icon}
            <span className='sr-only xl:not-sr-only'>{label}</span>
        </LinkButton>
    );
}
