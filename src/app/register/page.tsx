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
import { useT } from '@/i18n/provider';
import {
    register,
    sendRegistrationCode,
    sessionFromAuthUser,
} from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import { homeHref } from '@/utils/access';
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
    education_name: '', first_name: '', last_name: '',
    phone_number: '', password: '',
};

const STEPS_INFO: { num: string; icon: ReactNode; text: string }[] = [
    { num: '1', icon: <Buildings11 className='size-5' />, text: "Ma'lumotlarni kiriting" },
    { num: '2', icon: <Message1 className='size-5' />, text: 'SMS kodni tasdiqlang' },
    { num: '3', icon: <Send1 className='size-5' />, text: 'Markazingizni boshqaring' },
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
        setError(err instanceof ApiError ? apiErrorMessage(err, t) : t('error.unknown'));
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
                <div className='absolute -bottom-32 -right-20 size-96 rounded-full bg-white/10 blur-[80px]' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-white/5 blur-2xl' />

                {/* Grid nuqtalari */}
                <div
                    className='absolute inset-0 opacity-10'
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Logo */}
                <div className='relative'>
                    <AppLogo variant='white' />
                </div>

                {/* Asosiy kontent */}
                <div className='relative space-y-6'>
                    <h2 className='font-display text-3xl font-bold leading-tight sm:text-4xl'>
                        Bugun boshlang —<br />
                        <span className='text-white/80'>hisob ochish bepul</span>
                    </h2>

                    <p className='text-white/65 text-base leading-relaxed'>
                        Kredit karta talab qilinmaydi.
                        Sinov muddati tugagach tarif tanlaysiz.
                    </p>

                    {/* Qadamlar */}
                    <div className='space-y-3 pt-2'>
                        {STEPS_INFO.map((s, i) => (
                            <div key={s.num} className='flex items-center gap-4'>
                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all ${
                                    (step === 'details' && i === 0) || (step === 'code' && i === 1)
                                        ? 'bg-white text-brand-500 shadow-md'
                                        : 'bg-white/15 text-white'
                                }`}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${
                                        (step === 'details' && i === 0) || (step === 'code' && i === 1)
                                            ? 'text-white'
                                            : 'text-white/65'
                                    }`}>
                                        {s.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className='relative text-xs text-white/40'>
                    © {new Date().getFullYear()} EduMS. Barcha huquqlar himoyalangan.
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
                        <Link
                            href='/'
                            className='border-card-border bg-card-background text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary flex h-9 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition'
                        >
                            <svg className='size-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                                <polyline points='9 22 9 12 15 12 15 22' />
                            </svg>
                            <span className='hidden sm:inline'>{t('landing.backHome')}</span>
                        </Link>
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
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step === 'code' ? 'bg-brand-500' : 'bg-card-border'}`} />
                        </div>

                        <div className='mb-7 text-center'>
                            <h1 className='text-text-primary font-display text-2xl font-bold'>
                                {step === 'details'
                                    ? t('register.title', { days: trialDays })
                                    : "SMS kodni kiriting"}
                            </h1>
                            <p className='text-text-tertiary mt-2 text-sm'>
                                {step === 'details'
                                    ? t('register.subtitle')
                                    : `${form.phone_number} raqamiga ${codeLength} xonali kod yuborildi`}
                            </p>
                        </div>

                        {step === 'details' ? (
                            <form onSubmit={handleDetails} className='flex flex-col gap-4'>
                                <TextInput
                                    label={t('register.educationName')}
                                    required
                                    maxLength={150}
                                    placeholder={t('register.educationPlaceholder')}
                                    value={form.education_name}
                                    onChange={(e) => setForm({ ...form, education_name: e.target.value })}
                                />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextInput
                                        label={t('common.lastName')}
                                        required
                                        maxLength={100}
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    />
                                    <TextInput
                                        label={t('common.firstName')}
                                        required
                                        maxLength={100}
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                    />
                                </div>
                                <PhoneInput
                                    label={t('common.phoneNumber')}
                                    required
                                    hint={t('register.phoneHint')}
                                    value={form.phone_number}
                                    onValueChange={(phone_number) => setForm({ ...form, phone_number })}
                                />
                                <PasswordInput
                                    label={t('common.password')}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    autoComplete='new-password'
                                    hint={t('users.passwordHint')}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={pending || form.phone_number.length !== 13}
                                    className='mt-1 w-full shadow-md shadow-brand-500/20'
                                >
                                    {pending ? t('register.sending') : t('register.sendCode')}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleCode} className='flex flex-col gap-5'>
                                {/* Kod inputi */}
                                <div className='border-brand-500/20 bg-brand-500/5 rounded-2xl border p-6 text-center'>
                                    <p className='text-text-tertiary mb-4 text-xs'>
                                        Kodni kiriting:
                                    </p>
                                    <TextInput
                                        label={t('register.code')}
                                        required
                                        inputMode='numeric'
                                        autoComplete='one-time-code'
                                        maxLength={codeLength}
                                        placeholder={'_ '.repeat(codeLength).trim()}
                                        className='text-center text-3xl tracking-[0.6em] font-bold'
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                {error && <FormError message={error} />}

                                <Button
                                    type='submit'
                                    variant='primary'
                                    appearance='fill'
                                    size='lg'
                                    isDisabled={pending || code.length !== codeLength}
                                    className='w-full shadow-md shadow-brand-500/20'
                                >
                                    {pending ? t('register.creating') : t('register.submit')}
                                </Button>

                                <div className='flex items-center justify-between text-sm'>
                                    <button
                                        type='button'
                                        className='text-text-tertiary hover:text-text-primary flex items-center gap-1 transition'
                                        onClick={() => { setStep('details'); setCode(''); setError(null); }}
                                    >
                                        ← {t('register.changeDetails')}
                                    </button>
                                    <button
                                        type='button'
                                        disabled={resendIn > 0 || pending}
                                        className='text-brand-accent disabled:text-text-tertiary font-medium transition'
                                        onClick={() => void sendCode()}
                                    >
                                        {resendIn > 0
                                            ? t('register.resendIn', { seconds: resendIn })
                                            : t('register.resend')}
                                    </button>
                                </div>
                            </form>
                        )}

                        <p className='text-text-tertiary mt-6 text-center text-sm'>
                            {t('register.haveAccount')}{' '}
                            <Link href='/login' className='text-brand-accent font-semibold hover:underline'>
                                {t('auth.signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
