'use client';

import { MenuIcon } from '@/components/common/header/icons';
import { navSectionsFor } from '@/components/common/sidebar/data';
import { isPathActive } from '@/components/common/sidebar/utils';
import { Modal } from '@/components/ui/modal';
import { useNewLeadsCount } from '@/hooks/use-new-leads-count';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { can, isSuperAdmin } from '@/utils/access';
import { cn } from '@/utils/cn';
import {
    Funnel1,
    Plus,
    UserCircle1,
    UserMultiple1,
    Wallet2,
} from '@tailgrids/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

interface BottomNavProps {
    onMenuClick: () => void;
}

/*
 * Pastki menyuga tushadigan bo'limlar — ustuvorlik tartibida. Ro'yxat
 * sidebar ma'lumotidan olinadi, shuning uchun ruxsati yo'q bo'lim bu yerda
 * ham chiqmaydi: bosib bo'lmaydigan xira band o'rniga keyingi bo'lim turadi.
 */
const CENTER_PRIORITY = [
    '/dashboard',
    '/students',
    '/groups',
    '/cashbox',
    '/leads',
    '/schedule',
    '/debtors',
];
const SUPER_ADMIN_PRIORITY = [
    '/overview',
    '/educations',
    '/tariffs',
    '/payments',
];

export function BottomNav({ onMenuClick }: BottomNavProps) {
    const { session } = useSession();
    const pathname = usePathname();
    const t = useT();
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const newLeadsCount = useNewLeadsCount();

    if (!session) return null;

    const isSuper = isSuperAdmin(session);

    const quickActions = isSuper
        ? []
        : [
              can(session, 'payments.create') && {
                  href: '/cashbox?new=1',
                  title: t('header.quickPayment'),
                  description: t('nav.quickPaymentDesc'),
                  icon: <Wallet2 className='size-5' />,
                  tone: 'bg-badge-success-background text-badge-success-icon-color',
              },
              can(session, 'students.create') && {
                  href: '/students?new=1',
                  title: t('header.quickStudent'),
                  description: t('nav.quickStudentDesc'),
                  icon: <UserCircle1 className='size-5' />,
                  tone: 'bg-badge-blue-background text-badge-blue-icon-color',
              },
              can(session, 'groups.create') && {
                  href: '/groups?new=1',
                  title: t('groups.new'),
                  description: t('nav.quickGroupDesc'),
                  icon: <UserMultiple1 className='size-5' />,
                  tone: 'bg-badge-violet-background text-badge-violet-icon-color',
              },
              can(session, 'leads.create') && {
                  href: '/leads?new=1',
                  title: t('header.quickLead'),
                  description: t('nav.quickLeadDesc'),
                  icon: <Funnel1 className='size-5' />,
                  tone: 'bg-badge-warning-background text-badge-warning-icon-color',
              },
          ].filter((action) => !!action);

    const hasQuickActions = quickActions.length > 0;

    const visibleLinks = navSectionsFor(session).flatMap(
        (section) => section.items,
    );
    const priority = isSuper ? SUPER_ADMIN_PRIORITY : CENTER_PRIORITY;
    const links = priority
        .map((url) => visibleLinks.find((item) => item.url === url))
        .filter((item) => !!item)
        // Markaziy "+" tugmasi bitta joyni egallaydi.
        .slice(0, hasQuickActions ? 3 : 4);

    const renderLink = (item: (typeof links)[number]) => (
        <NavItem
            key={item.url}
            href={item.url}
            label={t(item.titleKey)}
            icon={item.icon}
            badge={
                item.url === '/leads' && newLeadsCount > 0
                    ? newLeadsCount > 99
                        ? '99+'
                        : newLeadsCount
                    : undefined
            }
            isActive={isPathActive(item.url, pathname)}
        />
    );

    return (
        <>
            {quickActionsOpen && (
                <Modal
                    open={quickActionsOpen}
                    onClose={() => setQuickActionsOpen(false)}
                    title={t('nav.quickActions')}
                >
                    <div className='grid grid-cols-1 gap-2.5'>
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                onClick={() => setQuickActionsOpen(false)}
                                className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary focus-visible:ring-input-primary-focus-border/30 flex items-center gap-3.5 rounded-xl border p-3.5 transition-colors outline-none focus-visible:ring-4'
                            >
                                <span
                                    aria-hidden='true'
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                        action.tone,
                                    )}
                                >
                                    {action.icon}
                                </span>
                                <span className='min-w-0 flex-1'>
                                    <span className='text-text-primary block text-sm font-semibold'>
                                        {action.title}
                                    </span>
                                    <span className='text-text-tertiary block text-xs'>
                                        {action.description}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </Modal>
            )}

            <nav
                aria-label={t('nav.mobile')}
                className='border-card-border bg-card-surface-area/95 supports-backdrop-filter:bg-card-surface-area/85 fixed right-0 bottom-0 left-0 z-40 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md md:hidden'
                style={{
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
                }}
            >
                <div className='flex h-16 items-stretch px-1'>
                    {hasQuickActions ? (
                        <>
                            {links.slice(0, 2).map(renderLink)}
                            <div className='flex flex-1 items-center justify-center'>
                                <button
                                    type='button'
                                    onClick={() => setQuickActionsOpen(true)}
                                    aria-label={t('nav.quickActions')}
                                    aria-haspopup='dialog'
                                    className='bg-button-primary-background hover:bg-button-primary-hover-background focus-visible:ring-button-primary-focus-ring ring-card-surface-area shadow-brand-accent/25 relative -top-2.5 flex size-12 items-center justify-center rounded-full text-white shadow-lg ring-4 transition-all duration-150 outline-none hover:scale-105 active:scale-90'
                                >
                                    <Plus className='size-6 stroke-[2.2]' />
                                </button>
                            </div>
                            {links.slice(2).map(renderLink)}
                        </>
                    ) : (
                        links.map(renderLink)
                    )}

                    <button
                        type='button'
                        onClick={onMenuClick}
                        className='group text-text-tertiary hover:text-text-primary flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-1 transition-all duration-150 active:scale-95'
                    >
                        <span className='flex items-center justify-center transition-transform duration-150 group-active:scale-90'>
                            <MenuIcon />
                        </span>
                        <span className='w-full truncate text-center text-[11px] leading-tight font-medium'>
                            {t('nav.more')}
                        </span>
                        <span className='size-1 rounded-full bg-transparent' />
                    </button>
                </div>
            </nav>
        </>
    );
}

function NavItem({
    href,
    label,
    icon,
    badge,
    isActive,
}: {
    href: string;
    label: string;
    icon: ReactNode;
    badge?: ReactNode;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-1 transition-all duration-150 active:scale-95',
                isActive
                    ? 'text-brand-accent font-semibold'
                    : 'text-text-tertiary hover:text-text-primary font-medium',
            )}
        >
            <span
                className={cn(
                    'relative flex items-center justify-center transition-transform duration-150',
                    isActive && 'scale-110',
                )}
            >
                {icon}
                {badge !== undefined && badge !== null && (
                    <span className='bg-brand-accent ring-card-background absolute -top-1 -right-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white tabular-nums ring-2'>
                        {badge}
                    </span>
                )}
            </span>
            <span className='w-full truncate text-center text-[11px] leading-tight'>
                {label}
            </span>
            {isActive ? (
                <span className='bg-brand-accent size-1 rounded-full transition-all duration-200' />
            ) : (
                <span className='size-1 rounded-full bg-transparent' />
            )}
        </Link>
    );
}
