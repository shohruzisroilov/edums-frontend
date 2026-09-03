'use client';

import { AppLogo } from '@/components/common/app-logo';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { navSectionsForRole } from './data';
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

    const sections = navSectionsForRole(session?.role);
    // Super admin uchun bosh sahifa statistika, xodimlar uchun o'quvchilar ro'yxati.
    const homeHref = session?.role === 'super_admin' ? '/' : '/students';

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
                <Link href={homeHref} aria-label={t('nav.home')}>
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
        </div>
    );
}
