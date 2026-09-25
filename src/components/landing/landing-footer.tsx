'use client';

import { AppLogo } from '@/components/common/app-logo';
import { useT } from '@/i18n/provider';
import Link from 'next/link';
import { LANDING_NAV } from './landing-header';

/** Hisob ochish yoki savollar bo'yicha murojaat kanali. */
export const SUPPORT_TELEGRAM = 'https://t.me/edumsuz';

export function LandingFooter() {
    const t = useT();

    return (
        <footer className='border-card-border bg-card-background border-t'>
            <div className='mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr]'>
                <div>
                    <AppLogo />
                    <p className='text-text-tertiary mt-4 max-w-sm text-sm leading-6'>
                        {t('landing.footerText')}
                    </p>
                </div>
                <nav aria-label={t('landing.navLabel')}>
                    <p className='text-text-primary text-sm font-semibold'>
                        {t('landing.footerProduct')}
                    </p>
                    <ul className='mt-4 space-y-2.5 text-sm'>
                        {LANDING_NAV.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className='text-text-tertiary hover:text-text-primary transition'
                                >
                                    {t(item.label)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div>
                    <p className='text-text-primary text-sm font-semibold'>
                        {t('landing.footerAccount')}
                    </p>
                    <ul className='mt-4 space-y-2.5 text-sm'>
                        <li>
                            <Link
                                href='/register'
                                className='text-text-tertiary hover:text-text-primary transition'
                            >
                                {t('landing.startFree')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href='/login'
                                className='text-text-tertiary hover:text-text-primary transition'
                            >
                                {t('auth.signIn')}
                            </Link>
                        </li>
                        <li>
                            <a
                                href={SUPPORT_TELEGRAM}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-text-tertiary hover:text-text-primary transition'
                            >
                                {t('landing.footerTelegram')}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='border-card-border border-t'>
                <p className='text-text-tertiary mx-auto max-w-6xl px-5 py-5 text-sm'>
                    © {new Date().getFullYear()} EduMS
                </p>
            </div>
        </footer>
    );
}
