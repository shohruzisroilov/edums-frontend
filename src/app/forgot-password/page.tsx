'use client';

import { AuthHeader } from '@/components/common/auth-header';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

/**
 * "Parolni unutdim": 1) login telefoniga SMS kod, 2) kod va yangi parol.
 * Muvaffaqiyatli bo'lsa backend login javobini qaytaradi — foydalanuvchi
 * darhol tizimga kiradi. Faqat markaz foydalanuvchilari uchun.
 */
export default function ForgotPasswordPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();

    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [code, setCode] = useState('');
    const [codeLength, setCodeLength] = useState(6);
    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [resendIn, setResendIn] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

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
        <div className='bg-background-gray-secondary_alt_2 flex h-full flex-col overflow-y-auto'>
            <AuthHeader />

            <div className='flex flex-1 items-center justify-center p-4 py-8'>
                <div className='border-card-border bg-card-surface-area w-full max-w-md rounded-2xl border p-8 shadow-sm'>
                    <div className='mb-7 flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-text-primary font-display text-xl font-semibold'>
                            {t('forgot.title')}
                        </h1>
                        <p className='text-text-tertiary text-sm'>
                            {step === 'phone'
                                ? t('forgot.subtitle')
                                : t('register.codeSent', { phone })}
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
                                hint={t('forgot.phoneHint')}
                                value={phone}
                                onValueChange={setPhone}
                            />

                            {error && <FormError message={error} />}

                            <Button
                                type='submit'
                                variant='primary'
                                appearance='fill'
                                size='lg'
                                isDisabled={pending || phone.length !== 13}
                                className='mt-1 w-full'
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
                                    setCode(e.target.value.replace(/\D/g, ''))
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
                                onChange={(e) => setPassword(e.target.value)}
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
                                className='w-full'
                            >
                                {pending
                                    ? t('common.saving')
                                    : t('forgot.submit')}
                            </Button>

                            <div className='flex items-center justify-between text-sm'>
                                <button
                                    type='button'
                                    className='text-text-tertiary hover:text-text-primary'
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
                        <Link
                            href='/login'
                            className='text-brand-accent font-medium hover:underline'
                        >
                            {t('forgot.backToLogin')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
