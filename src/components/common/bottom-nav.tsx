'use client';

import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { can, canAny, isSuperAdmin } from '@/utils/access';
import { cn } from '@/utils/cn';
import {
    Buildings11,
    Crown1,
    DashboardSquare1,
    Funnel1,
    Plus,
    TrendUp2,
    UserCircle1,
    UserMultiple1,
    Wallet2,
    Close,
} from '@tailgrids/icons';
import { MenuIcon } from '@/components/common/header/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface BottomNavProps {
    onMenuClick: () => void;
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
    const { session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const t = useT();
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);

    if (!session) return null;

    const isSuper = isSuperAdmin(session);

    // Permissions for center users
    const canStudents = canAny(session, 'students.view', 'students.view_own');
    const canGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canDashboard = canAny(session, 'reports.view', 'reports.view_own');
    const canCashbox = can(session, 'payments.view');

    const canAddPayment = can(session, 'payments.create');
    const canAddStudent = can(session, 'students.create');
    const canAddGroup = can(session, 'groups.create');
    const canAddLead = can(session, 'leads.create');

    const hasAnyQuickAction =
        !isSuper &&
        (canAddPayment || canAddStudent || canAddGroup || canAddLead);

    const handleActionClick = (href: string) => {
        setQuickActionsOpen(false);
        router.push(href);
    };

    return (
        <>
            {/* Quick Action Modal / Sheet */}
            {quickActionsOpen && (
                <div className='fixed inset-0 z-50 flex items-end justify-center md:hidden'>
                    <div
                        className='animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200'
                        onClick={() => setQuickActionsOpen(false)}
                    />
                    <div className='border-card-border bg-card-surface-area animate-in slide-in-from-bottom-6 relative z-10 w-full max-w-lg rounded-t-3xl border-x border-t p-5 pb-8 shadow-2xl duration-200'>
                        <div className='bg-border-primary/80 mx-auto mb-4 h-1.5 w-12 rounded-full opacity-70' />

                        <div className='mb-4 flex items-center justify-between'>
                            <h3 className='text-text-primary text-base font-semibold'>
                                {t('nav.quickActions')}
                            </h3>
                            <button
                                type='button'
                                onClick={() => setQuickActionsOpen(false)}
                                className='text-icon-tertiary hover:text-text-primary flex size-8 items-center justify-center rounded-lg transition-colors'
                            >
                                <Close className='size-4' />
                            </button>
                        </div>

                        <div className='grid grid-cols-1 gap-2.5'>
                            {canAddPayment && (
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleActionClick('/cashbox?new=1')
                                    }
                                    className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]'
                                >
                                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                                        <Wallet2 className='size-5' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-text-primary text-sm font-semibold'>
                                            {t('header.quickPayment')}
                                        </div>
                                        <div className='text-text-tertiary text-xs'>
                                            {t('nav.quickPaymentDesc')}
                                        </div>
                                    </div>
                                </button>
                            )}

                            {canAddStudent && (
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleActionClick('/students?new=1')
                                    }
                                    className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]'
                                >
                                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                                        <UserCircle1 className='size-5' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-text-primary text-sm font-semibold'>
                                            {t('header.quickStudent')}
                                        </div>
                                        <div className='text-text-tertiary text-xs'>
                                            {t('nav.quickStudentDesc')}
                                        </div>
                                    </div>
                                </button>
                            )}

                            {canAddGroup && (
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleActionClick('/groups?new=1')
                                    }
                                    className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]'
                                >
                                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                                        <UserMultiple1 className='size-5' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-text-primary text-sm font-semibold'>
                                            {t('groups.new')}
                                        </div>
                                        <div className='text-text-tertiary text-xs'>
                                            {t('nav.quickGroupDesc')}
                                        </div>
                                    </div>
                                </button>
                            )}

                            {canAddLead && (
                                <button
                                    type='button'
                                    onClick={() =>
                                        handleActionClick('/leads?new=1')
                                    }
                                    className='border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]'
                                >
                                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400'>
                                        <Funnel1 className='size-5' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-text-primary text-sm font-semibold'>
                                            {t('header.quickLead')}
                                        </div>
                                        <div className='text-text-tertiary text-xs'>
                                            {t('nav.quickLeadDesc')}
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <nav
                aria-label={t('nav.mobile')}
                className='border-card-border bg-card-surface-area/95 supports-backdrop-filter:bg-card-surface-area/85 fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur-md md:hidden'
                style={{
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
                }}
            >
                <div className='grid h-16 grid-cols-5 items-center px-1'>
                    {isSuper ? (
                        <>
                            <NavItem
                                href='/overview'
                                label={t('nav.overview')}
                                icon={<TrendUp2 className='size-5' />}
                                isActive={pathname === '/overview'}
                            />
                            <NavItem
                                href='/educations'
                                label={t('nav.educations')}
                                icon={<Buildings11 className='size-5' />}
                                isActive={pathname.startsWith('/educations')}
                            />
                            <NavItem
                                href='/tariffs'
                                label={t('nav.tariffs')}
                                icon={<Crown1 className='size-5' />}
                                isActive={pathname.startsWith('/tariffs')}
                            />
                            <NavItem
                                href='/payments'
                                label={t('nav.payments')}
                                icon={<Wallet2 className='size-5' />}
                                isActive={pathname.startsWith('/payments')}
                            />
                            <button
                                type='button'
                                onClick={onMenuClick}
                                className='text-text-tertiary hover:text-text-primary flex flex-col items-center justify-center gap-1 py-1 transition-colors'
                            >
                                <MenuIcon />
                                <span className='text-[10px] leading-none font-medium'>
                                    {t('nav.more')}
                                </span>
                            </button>
                        </>
                    ) : (
                        <>
                            {canDashboard ? (
                                <NavItem
                                    href='/dashboard'
                                    label={t('nav.dashboard')}
                                    icon={
                                        <DashboardSquare1 className='size-5' />
                                    }
                                    isActive={pathname === '/dashboard'}
                                />
                            ) : (
                                <NavItem
                                    href='/cashbox'
                                    label={t('nav.cashbox')}
                                    icon={<Wallet2 className='size-5' />}
                                    isActive={pathname.startsWith('/cashbox')}
                                />
                            )}

                            <NavItem
                                href='/students'
                                label={t('nav.students')}
                                icon={<UserCircle1 className='size-5' />}
                                isActive={pathname.startsWith('/students')}
                                disabled={!canStudents}
                            />

                            {/* Center Action Button */}
                            <div className='flex justify-center'>
                                {hasAnyQuickAction ? (
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setQuickActionsOpen(true)
                                        }
                                        aria-label={t('nav.quickActions')}
                                        className='bg-brand-accent shadow-brand-accent/30 flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:brightness-105 active:scale-90'
                                    >
                                        <Plus className='size-6 stroke-[2.2] text-white' />
                                    </button>
                                ) : (
                                    <NavItem
                                        href='/cashbox'
                                        label={t('nav.cashbox')}
                                        icon={<Wallet2 className='size-5' />}
                                        isActive={pathname.startsWith(
                                            '/cashbox',
                                        )}
                                        disabled={!canCashbox}
                                    />
                                )}
                            </div>

                            <NavItem
                                href='/groups'
                                label={t('nav.groups')}
                                icon={<UserMultiple1 className='size-5' />}
                                isActive={pathname.startsWith('/groups')}
                                disabled={!canGroups}
                            />

                            <button
                                type='button'
                                onClick={onMenuClick}
                                className='text-text-tertiary hover:text-text-primary flex flex-col items-center justify-center gap-1 py-1 transition-colors'
                            >
                                <MenuIcon />
                                <span className='text-[10px] leading-none font-medium'>
                                    {t('nav.more')}
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}

function NavItem({
    href,
    label,
    icon,
    isActive,
    disabled,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    disabled?: boolean;
}) {
    if (disabled) {
        return (
            <div className='text-text-tertiary/40 flex cursor-not-allowed flex-col items-center justify-center gap-1 py-1'>
                {icon}
                <span className='text-[10px] leading-none font-medium'>
                    {label}
                </span>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className={cn(
                'flex flex-col items-center justify-center gap-1 py-1 transition-all',
                isActive
                    ? 'text-brand-accent font-semibold'
                    : 'text-text-tertiary hover:text-text-primary',
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-center transition-transform',
                    isActive && 'scale-110',
                )}
            >
                {icon}
            </div>
            <span className='text-[10px] leading-none tracking-tight'>
                {label}
            </span>
        </Link>
    );
}
