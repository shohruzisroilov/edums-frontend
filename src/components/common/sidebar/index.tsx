'use client';

import { AppLogo } from '@/components/common/app-logo';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { can, homeHref } from '@/utils/access';
import { Shield1Check } from '@tailgrids/icons';
import { navSectionsFor } from './data';
import { CloseIcon, SidebarExpandedIcon } from './icon';
import NavItem from './nav-item';

export default function Sidebar({
    isSidebarOpen,
    toggleSidebar,
    isMobileSheet = false,
    onItemClick,
}: {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isMobileSheet?: boolean;
    onItemClick?: () => void;
}) {
    const { session } = useSession();
    const t = useT();

    const sections = navSectionsFor(session);
    const home = homeHref(session);

    return (
        <div className='flex h-full flex-col overflow-hidden'>
            <div
                className={cn(
                    'text-text-primary flex items-center px-4 pt-7',
                    isSidebarOpen
                        ? 'justify-between'
                        : 'flex-col justify-center gap-4',
                )}
            >
                <Link href={home} aria-label={t('nav.home')}>
                    <AppLogo collapsed={!isSidebarOpen} />
                </Link>

                <button
                    type='button'
                    onClick={toggleSidebar}
                    aria-label={
                        isMobileSheet
                            ? t('nav.closeMenu')
                            : isSidebarOpen
                              ? t('nav.collapse')
                              : t('nav.expand')
                    }
                    className='text-icon-tertiary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-icon-primary focus-visible:ring-input-primary-focus-border/30 flex size-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-4'
                >
                    {isMobileSheet ? <CloseIcon /> : <SidebarExpandedIcon />}
                </button>
            </div>

            <nav className='mt-6 min-h-0 flex-1 scrollbar-thin space-y-6 overflow-y-auto px-4 pb-4'>
                {sections.map((section) => (
                    <div key={section.labelKey}>
                        {isSidebarOpen && (
                            <p className='text-text-tertiary/80 mb-2 px-4 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase'>
                                {t(section.labelKey)}
                            </p>
                        )}
                        <div className='space-y-1'>
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.url}
                                    label={t(item.titleKey)}
                                    href={item.url}
                                    icon={item.icon}
                                    collapsed={!isSidebarOpen}
                                    onItemClick={onItemClick}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {session?.kind === 'user' && session.subscription && (
                <div className='border-card-border mt-auto border-t p-3'>
                    {isSidebarOpen ? (
                        <div className='border-card-border bg-card-surface-area shadow-2xs space-y-2 rounded-xl border p-3'>
                            <div className='flex items-center justify-between gap-1'>
                                <div className='text-text-primary flex items-center gap-1.5 truncate text-xs font-semibold'>
                                    <Shield1Check className='text-brand-accent size-4 shrink-0' />
                                    <span className='truncate'>
                                        {session.subscription.tariff_name ||
                                            (session.subscription.kind === 'trial'
                                                ? t('billing.trial')
                                                : t('billing.subscription'))}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        session.subscription.active
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                            : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
                                    )}
                                >
                                    {session.subscription.active
                                        ? t('common.active')
                                        : t('billing.expired')}
                                </span>
                            </div>

                            <div className='text-text-tertiary flex items-center justify-between text-[11px]'>
                                <span>{t('billing.period')}:</span>
                                <span className='text-text-secondary font-medium'>
                                    {session.subscription.days_left} kun
                                </span>
                            </div>

                            {session.subscription.max_users !== null && (
                                <div className='text-text-tertiary flex items-center justify-between text-[11px]'>
                                    <span>Limit:</span>
                                    <span className='text-text-secondary font-medium'>
                                        {session.subscription.max_users} ta xodim
                                    </span>
                                </div>
                            )}

                            {can(session, 'billing.manage') && (
                                <Link
                                    href='/billing'
                                    onClick={onItemClick}
                                    className='text-brand-accent block w-full pt-1 text-center text-xs font-semibold hover:underline'
                                >
                                    {t('billing.manageSubscription')} →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link
                            href='/billing'
                            onClick={onItemClick}
                            title={`${session.subscription.tariff_name || t('billing.trial')} (${session.subscription.days_left} kun)`}
                            className='hover:bg-sidebar-navigation-nav-item-nav-hover-background text-brand-accent mx-auto flex size-9 items-center justify-center rounded-lg transition-colors'
                        >
                            <Shield1Check className='size-5' />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
