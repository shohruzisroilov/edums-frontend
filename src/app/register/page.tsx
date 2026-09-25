'use client';

import { AuthHeader } from '@/components/common/auth-header';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

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

/**
 * O'zi ro'yxatdan o'tish: 1) ma'lumotlar + telefonga SMS kod, 2) kodni
 * kiritish. Muvaffaqiyatli bo'lsa markaz, uning Owner roli va sinov muddati
 * ochiladi va foydalanuvchi darhol tizimga kiradi.
 */
export default function RegisterPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();
    const trialDays = useTrialDays();

    const [form, setForm] = useState<FormState>(EMPTY);
    const [step, setStep] = useState<'details' | 'code'>('details');
    const [code, setCode] = useState('');
    const [codeLength, setCodeLength] = useState(6);
    const [resendIn, setResendIn] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    // Allaqachon kirgan bo'lsa ro'yxatdan o'tishning ma'nosi yo'q.
    useEffect(() => {
        if (!loading && session) router.replace(homeHref(session));
    }, [loading, session, router]);

    // Qayta yuborish tugmasi uchun teskari sanoq.
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
        <div className='bg-background-gray-secondary_alt_2 flex h-full flex-col overflow-y-auto'>
            <AuthHeader />

            <div className='flex flex-1 items-center justify-center p-4 py-8'>
                <div className='border-card-border bg-card-surface-area w-full max-w-lg rounded-2xl border p-8 shadow-sm'>
                    <div className='mb-7 flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-text-primary font-display text-xl font-semibold'>
                            {t('register.title', { days: trialDays })}
                        </h1>
                        <p className='text-text-tertiary text-sm'>
                            {step === 'details'
                                ? t('register.subtitle')
                                : t('register.codeSent', {
                                      phone: form.phone_number,
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
                                placeholder={t('register.educationPlaceholder')}
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
                                hint={t('register.phoneHint')}
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
                                    pending || form.phone_number.length !== 13
                                }
                                className='mt-1 w-full'
                            >
                                {pending
                                    ? t('register.sending')
                                    : t('register.sendCode')}
                            </Button>
                        </form>
                    ) : (
                        <form
                            onSubmit={handleCode}
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
                                    setCode(e.target.value.replace(/\D/g, ''))
                                }
                            />

                            {error && <FormError message={error} />}

                            <Button
                                type='submit'
                                variant='primary'
                                appearance='fill'
                                size='lg'
                                isDisabled={
                                    pending || code.length !== codeLength
                                }
                                className='w-full'
                            >
                                {pending
                                    ? t('register.creating')
                                    : t('register.submit')}
                            </Button>

                            <div className='flex items-center justify-between text-sm'>
                                <button
                                    type='button'
                                    className='text-text-tertiary hover:text-text-primary'
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
                                    className='text-brand-accent disabled:text-text-tertiary font-medium'
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
                            className='text-brand-accent font-medium hover:underline'
                        >
                            {t('auth.signIn')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
