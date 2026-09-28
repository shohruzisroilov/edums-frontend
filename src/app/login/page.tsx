'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import { FormError } from '@/components/ui/form-error';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useTrialDays } from '@/hooks/use-trial-days';
import { useT } from '@/i18n/provider';
import {
    loginSuperAdmin,
    loginUser,
    sessionFromAuthUser,
} from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import type { Session } from '@/types/api';
import { homeHref } from '@/utils/access';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

const SUPPORT_TELEGRAM = 'https://t.me/edumsuz';

async function signInWithPhone(
    phone_number: string,
    password: string,
): Promise<Session> {
    try {
        const res = await loginSuperAdmin({ phone_number, password });
        return {
            token: res.token,
            kind: 'super_admin',
            id: res.super_admin.id,
            phone_number: res.super_admin.phone_number,
            first_name: 'Super',
            last_name: 'Admin',
            avatar_url: null,
            education: null,
            roles: [],
            is_owner: false,
            permissions: [],
            subscription: null,
        };
    } catch (superAdminError) {
        if (
            superAdminError instanceof ApiError &&
            superAdminError.statusCode === 429
        ) {
            throw superAdminError;
        }
        try {
            const res = await loginUser({ phone_number, password });
            return sessionFromAuthUser(res.token, res.user);
        } catch (userError) {
            if (userError instanceof ApiError && userError.statusCode === 429) {
                throw userError;
            }
            throw userError;
        }
    }
}

const FEATURES = [
    "O'quvchilar va guruhlar boshqaruvi",
    "To'lovlar va moliyaviy hisobotlar",
    'Davomat va dars jadvali',
    'Lidlar va CRM tizimi',
];

export default function LoginPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();
    const trialDays = useTrialDays();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (loading || !session) return;
        router.replace(homeHref(session));
    }, [loading, session, router]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setPending(true);
        try {
            const next = await signInWithPhone(phone, password);
            signIn(next);
            router.replace(homeHref(next));
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? apiErrorMessage(err, t)
                    : t('auth.failed'),
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <div className='bg-background-gray-secondary_alt_2 flex h-full overflow-hidden'>
            {/* ── Chap: brend paneli ── */}
            <div className='bg-brand-500 relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex lg:w-[45%]'>
                {/* Gradient nurlar */}
                <div className='absolute -top-32 -left-32 size-96 rounded-full bg-white/10 blur-[80px]' />
                <div className='absolute -right-20 -bottom-32 size-96 rounded-full bg-white/10 blur-[80px]' />
                <div className='absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl' />

                {/* Grid nuqtalari */}
                <div
                    className='absolute inset-0 opacity-10'
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Logo */}
                <div className='relative'>
                    <Link
                        href='/'
                        className='inline-block transition-opacity hover:opacity-90'
                    >
                        <AppLogo variant='white' />
                    </Link>
                </div>

                {/* Asosiy kontent */}
                <div className='relative space-y-6'>
                    <h2 className='font-display text-3xl leading-tight font-bold sm:text-4xl'>
                        O&apos;quv markazingizni
                        <br />
                        <span className='relative inline-block'>
                            bir joyda
                            <svg
                                className='absolute -bottom-1 left-0 w-full'
                                viewBox='0 0 120 8'
                                fill='none'
                            >
                                <path
                                    d='M2 6 C30 2, 90 2, 118 6'
                                    stroke='white'
                                    strokeWidth='2.5'
                                    strokeLinecap='round'
                                    opacity='0.5'
                                />
                            </svg>
                        </span>{' '}
                        boshqaring
                    </h2>

                    <p className='text-base leading-relaxed text-white/70'>
                        Guruhlar, to&apos;lovlar, davomat va lidlar — hammasi
                        bitta tizimda.
                    </p>

                    <ul className='space-y-3 pt-1'>
                        {FEATURES.map((item) => (
                            <li
                                key={item}
                                className='flex items-center gap-3 text-sm text-white/85'
                            >
                                <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20'>
                                    <svg
                                        className='size-3'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='3'
                                    >
                                        <path d='M20 6 9 17l-5-5' />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className='relative text-xs text-white/40'>
                    © {new Date().getFullYear()} EduMS. Barcha huquqlar
                    himoyalangan.
                </p>
            </div>

            {/* ── O'ng: forma ── */}
            <div className='flex flex-1 flex-col overflow-y-auto'>
                {/* Header */}
                <header className='flex items-center justify-between px-6 py-4'>
                    <Link href='/' className='lg:hidden'>
                        <AppLogo />
                    </Link>
                    <div className='ml-auto flex items-center gap-2'>
                        <LocaleSwitcher />
                        <ThemeToggle />
                    </div>
                </header>

                {/* Forma */}
                <div className='flex flex-1 items-center justify-center p-6'>
                    <div className='w-full max-w-sm'>
                        <div className='mb-8 text-center'>
                            <h1 className='text-text-primary font-display text-2xl font-bold'>
                                {t('auth.title')}
                            </h1>
                            <p className='text-text-tertiary mt-2 text-sm'>
                                {t('auth.subtitle')}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className='flex flex-col gap-4'
                        >
                            <PhoneInput
                                label={t('common.phoneNumber')}
                                required
                                value={phone}
                                onValueChange={setPhone}
                            />
                            <PasswordInput
                                label={t('common.password')}
                                required
                                autoComplete='current-password'
                                placeholder='••••••••'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && <FormError message={error} />}

                            <Link
                                href='/forgot-password'
                                className='text-brand-accent -mt-1 self-end text-sm font-medium hover:underline'
                            >
                                {t('auth.forgotPassword')}
                            </Link>

                            <Button
                                type='submit'
                                variant='primary'
                                appearance='fill'
                                size='lg'
                                isDisabled={pending}
                                className='shadow-brand-500/20 w-full shadow-md'
                            >
                                {pending
                                    ? t('auth.signingIn')
                                    : t('auth.signIn')}
                            </Button>
                        </form>

                        <div className='mt-6 space-y-3 text-center'>
                            <p className='text-text-secondary text-sm'>
                                {t('auth.noAccount')}{' '}
                                <Link
                                    href='/register'
                                    className='text-brand-accent font-semibold hover:underline'
                                >
                                    {t('auth.tryFree', { days: trialDays })}
                                </Link>
                            </p>
                            <p className='text-text-tertiary text-xs'>
                                {t('auth.contact')}{' '}
                                <a
                                    href={SUPPORT_TELEGRAM}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-brand-accent font-medium hover:underline'
                                >
                                    @edumsuz
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
