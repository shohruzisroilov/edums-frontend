'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import { SupportHelpButton, PhoneIcon } from '@/components/ui/support-modal';
import { SUPPORT_CONTACTS } from '@/utils/site';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const LANDING_NAV: { href: string; label: TranslationKey }[] = [
    { href: '#features', label: 'landing.navFeatures' },
    { href: '#how', label: 'landing.navHow' },
    { href: '#tariffs', label: 'landing.navTariffs' },
    { href: '#faq', label: 'landing.navFaq' },
    { href: '#contact', label: 'landing.navContact' },
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
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className='sticky top-0 z-30'>
            {/* ── Yuqori ko'zga ko'rinadigan tezkor aloqa paneli ── */}
            <div className='border-card-border bg-card-surface-area/95 border-b px-3 py-1.5 backdrop-blur-md'>
                <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs'>
                    <div className='flex items-center gap-2'>
                        <span className='relative flex size-2'>
                            <span className='bg-badge-success-text absolute inline-flex size-full animate-ping rounded-full opacity-75' />
                            <span className='bg-badge-success-text relative inline-flex size-2 rounded-full' />
                        </span>
                        <span className='text-text-primary text-xs font-medium'>
                            {t('landing.topContactPrompt')}
                        </span>
                    </div>

                    <div className='text-text-primary flex items-center gap-2.5 text-xs sm:gap-4'>
                        <a
                            href={SUPPORT_CONTACTS.phoneTel}
                            className='hover:text-brand-500 flex items-center gap-1 font-mono font-bold transition'
                        >
                            📞 {SUPPORT_CONTACTS.phoneFormatted}
                        </a>
                        <span className='text-text-tertiary opacity-40'>·</span>
                        <a
                            href={SUPPORT_CONTACTS.telegramPersonalUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-1 font-medium transition hover:text-sky-500'
                        >
                            Telegram: {SUPPORT_CONTACTS.telegramPersonal}
                        </a>
                        <span className='text-text-tertiary hidden opacity-40 sm:inline'>
                            ·
                        </span>
                        <a
                            href={SUPPORT_CONTACTS.telegramGroupUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hidden items-center gap-1 font-medium transition hover:text-indigo-500 sm:flex'
                        >
                            Guruh: {SUPPORT_CONTACTS.telegramGroup}
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Asosiy Navbar ── */}
            <div className='px-3 py-2 sm:px-4 sm:py-2.5'>
                <div className='border-card-border bg-card-surface-area/90 mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl border px-3.5 py-2 shadow-sm backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5'>
                    {/* Logo */}
                    <Link
                        href='/'
                        aria-label={t('nav.home')}
                        className='shrink-0 origin-left scale-95 sm:scale-100'
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop nav — pill shaklida o'rtada */}
                    <nav
                        aria-label={t('landing.navLabel')}
                        className='hidden items-center gap-0.5 lg:flex'
                    >
                        {LANDING_NAV.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className='text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary rounded-xl px-4 py-2 text-sm font-medium transition'
                            >
                                {t(item.label)}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
                        <div className='hidden items-center gap-2 sm:flex'>
                            <LocaleSwitcher />
                            <ThemeToggle />
                            <SupportHelpButton />
                        </div>

                        {/* Call link on wide screens */}
                        <a
                            href={SUPPORT_CONTACTS.phoneTel}
                            className='border-card-border bg-card-surface-area hover:bg-background-gray-secondary text-text-primary hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition 2xl:flex'
                        >
                            <PhoneIcon className='size-3.5 text-emerald-500' />
                            <span className='font-mono'>
                                {SUPPORT_CONTACTS.phoneFormatted}
                            </span>
                        </a>

                        {signedIn ? (
                            <Button
                                size='md'
                                onPress={onStart}
                                className='px-3 text-xs whitespace-nowrap sm:px-4 sm:text-sm'
                            >
                                {t('landing.openCabinet')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    appearance='outline'
                                    size='md'
                                    onPress={() => router.push('/login')}
                                    className='hidden whitespace-nowrap sm:flex'
                                >
                                    {t('auth.signIn')}
                                </Button>
                                <Button
                                    size='md'
                                    onPress={onStart}
                                    className='px-3 text-xs whitespace-nowrap sm:px-4 sm:text-sm'
                                >
                                    {t('landing.startFree')}
                                </Button>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            type='button'
                            className='border-card-border text-text-secondary hover:bg-background-gray-secondary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition lg:hidden'
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label={t('landing.menu')}
                        >
                            {mobileOpen ? (
                                <svg
                                    className='size-4'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M18 6 6 18M6 6l12 12' />
                                </svg>
                            ) : (
                                <svg
                                    className='size-4'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                >
                                    <path d='M4 6h16M4 12h16M4 18h16' />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className='border-card-border bg-card-surface-area/95 mx-auto mt-2 max-w-6xl rounded-2xl border p-4 shadow-lg backdrop-blur-md'>
                        <nav className='flex flex-col gap-1'>
                            {LANDING_NAV.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className='text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary rounded-xl px-4 py-3 text-sm font-medium transition'
                                >
                                    {t(item.label)}
                                </a>
                            ))}
                        </nav>

                        {/* Mobile contact card */}
                        <div className='border-card-border bg-background-gray-secondary/70 mt-3 rounded-xl border p-3.5'>
                            <p className='text-text-primary text-xs font-semibold'>
                                {t('landing.topContactPrompt')}
                            </p>
                            <div className='mt-2 flex flex-col gap-2 text-xs'>
                                <a
                                    href={SUPPORT_CONTACTS.phoneTel}
                                    className='text-text-primary hover:text-brand-500 flex items-center gap-2 font-mono font-bold'
                                >
                                    📞 {SUPPORT_CONTACTS.phoneFormatted}
                                </a>
                                <a
                                    href={SUPPORT_CONTACTS.telegramPersonalUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-text-primary flex items-center gap-2 font-medium hover:text-sky-500'
                                >
                                    💬 Telegram:{' '}
                                    {SUPPORT_CONTACTS.telegramPersonal}
                                </a>
                                <a
                                    href={SUPPORT_CONTACTS.telegramGroupUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-text-primary flex items-center gap-2 font-medium hover:text-indigo-500'
                                >
                                    👥 Guruh: {SUPPORT_CONTACTS.telegramGroup}
                                </a>
                            </div>
                        </div>

                        <div className='border-card-border mt-3 flex items-center justify-between border-t pt-3'>
                            <div className='flex items-center gap-2'>
                                <LocaleSwitcher />
                                <ThemeToggle />
                                <SupportHelpButton />
                            </div>
                            <Button
                                appearance='outline'
                                size='sm'
                                onPress={() => {
                                    router.push('/login');
                                    setMobileOpen(false);
                                }}
                            >
                                {t('auth.signIn')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
