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
                <div className='mx-auto flex max-w-6xl items-center justify-between px-5 py-5'>
                    <p className='text-text-tertiary text-sm'>
                        © {new Date().getFullYear()} EduMS. Barcha huquqlar
                        himoyalangan.
                    </p>
                    <button
                        type='button'
                        onClick={() => {
                            document
                                .getElementById('page-top')
                                ?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className='border-card-border text-text-tertiary hover:text-text-primary hover:bg-card-border flex size-9 items-center justify-center rounded-lg border transition'
                        aria-label='Yuqoriga chiqish'
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <path d='M18 15l-6-6-6 6' />
                        </svg>
                    </button>
                </div>
            </div>
        </footer>
    );
}
