'use client';

import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { can, homeHref } from '@/utils/access';
import { cn } from '@/utils/cn';
import { Funnel1, Layout20, UserCircle1, Wallet2, Plus } from '@tailgrids/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PaymentModal } from '@/components/ui/payment-modal';

export function MobileBottomNav() {
    const t = useT();
    const pathname = usePathname();
    const { session } = useSession();
    const [quickPaymentOpen, setQuickPaymentOpen] = useState(false);

    if (!session) return null;

    const home = homeHref(session);
    const canStudents = can(session, 'students.view');
    const canCashbox = can(session, 'payments.view');
    const canLeads = can(session, 'leads.view');
    const canPay = can(session, 'payments.create') && can(session, 'students.view');

    const navItems = [
        { href: home, label: t('nav.dashboard'), icon: Layout20 },
        ...(canStudents ? [{ href: '/students', label: t('nav.students'), icon: UserCircle1 }] : []),
        ...(canCashbox ? [{ href: '/cashbox', label: t('nav.cashbox'), icon: Wallet2 }] : []),
        ...(canLeads ? [{ href: '/leads', label: t('nav.leads'), icon: Funnel1 }] : []),
    ];

    return (
        <>
            <div className='border-card-border bg-card-surface-area/95 backdrop-blur-md fixed bottom-0 left-0 right-0 z-40 border-t py-1.5 px-3 md:hidden shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom))]'>
                <div className='flex items-center justify-around gap-1'>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 transition-all min-w-[56px] active:scale-95 touch-manipulation',
                                    isActive
                                        ? 'text-brand-accent font-semibold'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                <Icon className={cn('size-5 transition-transform', isActive && 'scale-110')} />
                                <span className='text-[10px] leading-none tracking-tight truncate max-w-[64px]'>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {canPay && (
                        <button
                            type='button'
                            onClick={() => setQuickPaymentOpen(true)}
                            aria-label={t('cashbox.new')}
                            className='bg-brand-accent text-white flex size-10 items-center justify-center rounded-full shadow-md active:scale-95 transition-transform'
                        >
                            <Plus className='size-5' />
                        </button>
                    )}
                </div>
            </div>

            {quickPaymentOpen && (
                <PaymentModal onClose={() => setQuickPaymentOpen(false)} />
            )}
        </>
    );
}
