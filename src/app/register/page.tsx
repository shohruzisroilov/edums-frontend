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
import { useTrialDays } from '@/hooks/use-trial-days';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { useT } from '@/i18n/provider';
import {
    register,
    sendRegistrationCode,
    sessionFromAuthUser,
} from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import { homeHref } from '@/utils/access';
import { isValidUzbekMobile } from '@/utils/format';
import { Buildings11, Message1, Send1 } from '@tailgrids/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode, type FormEvent } from 'react';

interface FormState {
    education_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
}

const EMPTY: FormState = {
    education_name: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
};

const STEPS_INFO: { num: string; icon: ReactNode; text: TranslationKey }[] = [
    {
        num: '1',
        icon: <Buildings11 className='size-5' />,
        text: 'register.step1',
    },
    {
        num: '2',
        icon: <Message1 className='size-5' />,
        text: 'register.step2',
    },
    {
        num: '3',
        icon: <Send1 className='size-5' />,
        text: 'register.step3',
    },
];

export default function RegisterPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();
    const trialDays = useTrialDays();

    const [form, setForm] = useState<FormState>(EMPTY);
    const [step, setStep] = useState<'details' | 'code'>('details');
    const [code, setCode] = useState('');
    const [codeLength, setCodeLength] = useState(4);
    const [resendIn, setResendIn] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!loading && session) router.replace(homeHref(session));
    }, [loading, session, router]);

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
            const res = await sendRegistrationCode(form.phone_number);
            setResendIn(res.resend_in);
            setCodeLength(res.code_length);
            setStep('code');
        } catch (err) {
            showError(err);
        } finally {
            setPending(false);
        }
    }

    async function handleDetails(event: FormEvent) {
        event.preventDefault();
        await sendCode();
    }

    async function handleCode(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setPending(true);
        try {
            const res = await register({
                ...form,
                education_name: form.education_name.trim(),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                code,
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
                        {t('register.hero.line1')}
                        <br />
                        <span className='text-white/80'>
                            {t('register.hero.line2')}
                        </span>
                    </h2>

                    <p className='text-base leading-relaxed text-white/65'>
                        {t('register.hero.text')}
                    </p>

                    {/* Qadamlar */}
                    <div className='space-y-3 pt-2'>
                        {STEPS_INFO.map((s, i) => (
                            <div
                                key={s.num}
                                className='flex items-center gap-4'
                            >
                                <div
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all ${
                                        (step === 'details' && i === 0) ||
                                        (step === 'code' && i === 1)
                                            ? 'text-brand-500 bg-white shadow-md'
                                            : 'bg-white/15 text-white'
                                    }`}
                                >
                                    {s.icon}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            (step === 'details' && i === 0) ||
                                            (step === 'code' && i === 1)
                                                ? 'text-white'
                                                : 'text-white/65'
                                        }`}
                                    >
                                        {t(s.text)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
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
                    <div className='w-full max-w-md'>
                        {/* Step indicator */}
                        <div className='mb-6 flex items-center gap-2'>
                            <div className='bg-brand-500 h-1.5 flex-1 rounded-full' />
                            <div
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step === 'code' ? 'bg-brand-500' : 'bg-card-border'}`}
                            />
                        </div>

                        <div className='mb-7 text-center'>
                            <h1 className='text-text-primary font-display text-2xl font-bold'>
                                {step === 'details'
                                    ? t('register.title', { days: trialDays })
                                    : t('register.codeTitle')}
                            </h1>
                            <p className='text-text-tertiary mt-2 text-sm'>
                                {step === 'details'
                                    ? t('register.subtitle')
                                    : t('register.codeSent', {
                                          phone: form.phone_number,
                                          length: codeLength,
                                      })}
                            </p>
                        </div>

                        {step === 'details' ? (
                            <form
                                onSubmit={handleDetails}
                                className='flex flex-col gap-4'
                            >
                                <TextInput
                                    label={t('register.educationName')}
                                    required
                                    maxLength={150}
                                    placeholder={t(
                                        'register.educationPlaceholder',
                                    )}
                                    value={form.education_name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            education_name: e.target.value,
                                        })
                                    }
                                />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextInput
                                        label={t('common.lastName')}
                                        required
                                        maxLength={100}
                                        value={form.last_name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                last_name: e.target.value,
                                            })
                                        }
                                    />
                                    <TextInput
                                        label={t('common.firstName')}
                                        required
                                        maxLength={100}
                                        value={form.first_name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                first_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <PhoneInput
                                    label={t('common.phoneNumber')}
                                    required
                                    hint={
                                        form.phone_number.length === 13 &&
                                        !isValidUzbekMobile(form.phone_number)
                                            ? t('error.notUzbekMobile')
                                            : t('register.phoneHint')
                                    }
                                    value={form.phone_number}
                                    onValueChange={(phone_number) =>
                                        setForm({ ...form, phone_number })
                                    }
                                />
                                <PasswordInput
                                    label={t('common.password')}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    autoComplete='new-password'
                                    hint={t('users.passwordHint')}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                />

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={
                                        pending ||
                                        !isValidUzbekMobile(form.phone_number)
                                    }
                                    className='shadow-brand-500/20 mt-1 w-full shadow-md'
                                >
                                    {pending
                                        ? t('register.sending')
                                        : t('register.sendCode')}
                                </Button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleCode}
                                className='flex flex-col gap-5'
                            >
                                {/* Kod inputi */}
                                <div className='border-brand-500/20 bg-brand-500/5 rounded-2xl border p-6 text-center'>
                                    <TextInput
                                        label={t('register.code')}
                                        required
                                        inputMode='numeric'
                                        autoComplete='one-time-code'
                                        maxLength={codeLength}
                                        placeholder={'_ '
                                            .repeat(codeLength)
                                            .trim()}
                                        className='text-center text-3xl font-bold tracking-[0.6em]'
                                        value={code}
                                        onChange={(e) =>
                                            setCode(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                    />
                                </div>

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={
                                        pending || code.length !== codeLength
                                    }
                                    className='shadow-brand-500/20 w-full shadow-md'
                                >
                                    {pending
                                        ? t('register.creating')
                                        : t('register.submit')}
                                </Button>

                                <div className='flex items-center justify-between text-sm'>
                                    <button
                                        type='button'
                                        className='text-text-tertiary hover:text-text-primary flex items-center gap-1 transition'
                                        onClick={() => {
                                            setStep('details');
                                            setCode('');
                                            setError(null);
                                        }}
                                    >
                                        {t('register.changeDetails')}
                                    </button>
                                    <button
                                        type='button'
                                        disabled={resendIn > 0 || pending}
                                        className='text-brand-accent disabled:text-text-tertiary font-medium transition'
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

                        <p className='text-text-tertiary mt-6 text-center text-sm'>
                            {t('register.haveAccount')}{' '}
                            <Link
                                href='/login'
                                className='text-brand-accent font-semibold hover:underline'
                            >
                                {t('auth.signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
