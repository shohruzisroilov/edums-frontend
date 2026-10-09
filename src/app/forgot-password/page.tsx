'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import { FormError } from '@/components/ui/form-error';
import { TextInput } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    resetForgottenPassword,
    sendPasswordResetCode,
    sessionFromAuthUser,
} from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import { homeHref } from '@/utils/access';
import { isValidUzbekMobile } from '@/utils/format';
import { SUPPORT_CONTACTS } from '@/utils/site';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

const STEPS = ['forgot.step1', 'forgot.step2', 'forgot.step3'] as const;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();

    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [code, setCode] = useState('');
    const [codeLength, setCodeLength] = useState(4);
    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [resendIn, setResendIn] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!loading && session) router.replace(homeHref(session));
    }, [loading, session, router]);

    // Qayta yuborish tugmasi uchun teskari sanoq
    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendIn]);

    function showError(err: unknown) {
        setError(
            err instanceof ApiError
                ? apiErrorMessage(err, t)
                : t('error.unknown'),
        );
    }

    async function sendCode() {
        setError(null);
        setPending(true);
        try {
            const res = await sendPasswordResetCode(phone);
            setResendIn(res.resend_in);
            setCodeLength(res.code_length);
            setStep('code');
        } catch (err) {
            showError(err);
        } finally {
            setPending(false);
        }
    }

    async function handlePhone(event: FormEvent) {
        event.preventDefault();
        await sendCode();
    }

    async function handleReset(event: FormEvent) {
        event.preventDefault();
        if (password !== repeat) {
            setError(t('profile.passwordMismatch'));
            return;
        }
        setError(null);
        setPending(true);
        try {
            const res = await resetForgottenPassword({
                phone_number: phone,
                code,
                new_password: password,
            });
            const next = sessionFromAuthUser(res.token, res.user);
            signIn(next);
            router.replace(homeHref(next));
        } catch (err) {
            showError(err);
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
                        {t('forgot.hero.line1')}
                        <br />
                        <span className='relative inline-block'>
                            {t('forgot.hero.highlight')}
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
                        </span>
                    </h2>

                    <p className='text-base leading-relaxed text-white/70'>
                        {t('forgot.hero.text')}
                    </p>

                    <ul className='space-y-3 pt-1'>
                        {STEPS.map((item) => (
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
                                {t(item)}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className='relative text-xs text-white/40'>
                    {t('common.copyright', {
                        year: new Date().getFullYear(),
                    })}
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
                        {/* Step indicator */}
                        <div className='mb-6 flex items-center gap-2'>
                            <div className='bg-brand-500 h-1.5 flex-1 rounded-full' />
                            <div
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                    step === 'code'
                                        ? 'bg-brand-500'
                                        : 'bg-card-border'
                                }`}
                            />
                        </div>

                        <div className='mb-8 text-center'>
                            <h1 className='text-text-primary font-display text-2xl font-bold'>
                                {t('forgot.title')}
                            </h1>
                            <p className='text-text-tertiary mt-2 text-sm'>
                                {step === 'phone'
                                    ? t('forgot.subtitle')
                                    : t('register.codeSent', {
                                          phone,
                                          length: codeLength,
                                      })}
                            </p>
                        </div>

                        {step === 'phone' ? (
                            <form
                                onSubmit={handlePhone}
                                className='flex flex-col gap-4'
                            >
                                <PhoneInput
                                    label={t('common.phoneNumber')}
                                    required
                                    hint={
                                        phone.length === 13 &&
                                        !isValidUzbekMobile(phone)
                                            ? t('error.notUzbekMobile')
                                            : t('forgot.phoneHint')
                                    }
                                    value={phone}
                                    onValueChange={setPhone}
                                />

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={
                                        pending || !isValidUzbekMobile(phone)
                                    }
                                    className='shadow-brand-500/20 w-full shadow-md'
                                >
                                    {pending
                                        ? t('register.sending')
                                        : t('register.sendCode')}
                                </Button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleReset}
                                className='flex flex-col gap-4'
                            >
                                <TextInput
                                    label={t('register.code')}
                                    required
                                    inputMode='numeric'
                                    autoComplete='one-time-code'
                                    maxLength={codeLength}
                                    placeholder={'•'.repeat(codeLength)}
                                    className='text-center text-lg tracking-[0.5em]'
                                    value={code}
                                    onChange={(e) =>
                                        setCode(
                                            e.target.value.replace(/\D/g, ''),
                                        )
                                    }
                                />
                                <PasswordInput
                                    label={t('users.newPassword')}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    autoComplete='new-password'
                                    hint={t('users.passwordHint')}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <PasswordInput
                                    label={t('profile.repeatPassword')}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    autoComplete='new-password'
                                    value={repeat}
                                    onChange={(e) => setRepeat(e.target.value)}
                                />

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={
                                        pending ||
                                        code.length !== codeLength ||
                                        password.length < 8
                                    }
                                    className='shadow-brand-500/20 w-full shadow-md'
                                >
                                    {pending
                                        ? t('common.saving')
                                        : t('forgot.submit')}
                                </Button>

                                <div className='flex items-center justify-between text-sm'>
                                    <button
                                        type='button'
                                        className='text-text-tertiary hover:text-text-primary transition-colors'
                                        onClick={() => {
                                            setStep('phone');
                                            setCode('');
                                            setError(null);
                                        }}
                                    >
                                        {t('forgot.changePhone')}
                                    </button>
                                    <button
                                        type='button'
                                        disabled={resendIn > 0 || pending}
                                        className='text-brand-accent disabled:text-text-tertiary font-medium transition-colors hover:underline'
                                        onClick={() => void sendCode()}
                                    >
                                        {resendIn > 0
                                            ? t('register.resendIn', {
                                                  seconds: resendIn,
                                              })
                                            : t('register.resend')}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className='mt-8 space-y-3 text-center'>
                            <p className='text-text-secondary text-sm'>
                                {t('forgot.remember')}{' '}
                                <Link
                                    href='/login'
                                    className='text-brand-accent font-semibold hover:underline'
                                >
                                    {t('auth.signIn')}
                                </Link>
                            </p>
                            <div className='border-card-border bg-card-surface-area/60 text-text-tertiary mt-6 rounded-xl border p-3 text-center text-xs'>
                                <p className='text-text-secondary font-medium'>
                                    {t('auth.contact')}
                                </p>
                                <div className='mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5'>
                                    <a
                                        href={SUPPORT_CONTACTS.phoneTel}
                                        className='text-brand-accent font-medium hover:underline'
                                    >
                                        📞 {SUPPORT_CONTACTS.phoneFormatted}
                                    </a>
                                    <span className='opacity-40'>·</span>
                                    <a
                                        href={
                                            SUPPORT_CONTACTS.telegramPersonalUrl
                                        }
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-brand-accent font-medium hover:underline'
                                    >
                                        Telegram:{' '}
                                        {SUPPORT_CONTACTS.telegramPersonal}
                                    </a>
                                    <span className='opacity-40'>·</span>
                                    <a
                                        href={SUPPORT_CONTACTS.telegramGroupUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-brand-accent font-medium hover:underline'
                                    >
                                        Guruh: {SUPPORT_CONTACTS.telegramGroup}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
