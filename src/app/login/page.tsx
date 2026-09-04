'use client';

import { AppLogo } from '@/components/common/app-logo';
import { homeHrefForRole } from '@/components/common/sidebar/data';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import { TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/formatted-input';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { loginStaff, loginSuperAdmin } from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import type { Session } from '@/types/api';
import { Eye, EyeDisabled } from '@tailgrids/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

/** Hisob ochish yoki savollar bo'yicha murojaat kanali. */
const SUPPORT_TELEGRAM = 'https://t.me/edumsuz';

/**
 * Backendda ikkita login endpointi bor: xodimlar uchun /auth/login va
 * super admin uchun /super_admin/login. Foydalanuvchidan turini so'ramaymiz —
 * avval xodim sifatida urinib ko'ramiz, 401 kelsa super admin sifatida.
 */
async function signInWithPhone(
    phone_number: string,
    password: string,
): Promise<Session> {
    try {
        const res = await loginStaff({ phone_number, password });

        return {
            token: res.token,
            role: res.user.role,
            id: res.user.id,
            phone_number: res.user.phone_number,
            first_name: res.user.first_name,
            last_name: res.user.last_name,
            education_id: res.user.education_id,
            education_center_ids: res.user.education_center_ids ?? [],
            avatar_url: res.user.avatar_url,
        };
    } catch (staffError) {
        // Faqat "hisob topilmadi / parol xato" holatida ikkinchi endpointga
        // o'tamiz; tarmoq yoki validatsiya xatosi bo'lsa darhol qaytaramiz.
        if (
            !(staffError instanceof ApiError) ||
            staffError.statusCode !== 401
        ) {
            throw staffError;
        }

        try {
            const res = await loginSuperAdmin({ phone_number, password });

            return {
                token: res.token,
                role: 'super_admin',
                id: res.super_admin.id,
                phone_number: res.super_admin.phone_number,
                first_name: 'Super',
                last_name: 'Admin',
                education_id: null,
                education_center_ids: [],
                avatar_url: null,
            };
        } catch {
            // Ikkalasi ham rad etdi. Xodim endpointining xabari to'liqroq
            // (nofaol hisob haqida ham aytadi), shuning uchun o'shani beramiz.
            throw staffError;
        }
    }
}

export default function LoginPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    // Allaqachon kirgan bo'lsa login sahifasida ushlab turishning ma'nosi yo'q.
    useEffect(() => {
        if (loading || !session) return;
        router.replace(homeHrefForRole(session.role));
    }, [loading, session, router]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setPending(true);

        try {
            const next = await signInWithPhone(phone, password);
            signIn(next);
            router.replace(homeHrefForRole(next.role));
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
        <div className='bg-background-gray-secondary_alt_2 flex h-full flex-col overflow-y-auto p-4'>
            <div className='flex justify-end gap-2.5 pb-2'>
                <LocaleSwitcher />
                <ThemeToggle />
            </div>

            <div className='flex flex-1 items-center justify-center'>
                <div className='border-card-border bg-card-surface-area w-full max-w-md rounded-2xl border p-8 shadow-sm'>
                    <div className='mb-7 flex flex-col items-center gap-3 text-center'>
                        <AppLogo />
                        <p className='text-text-tertiary text-sm'>
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

                        <div className='relative'>
                            <TextInput
                                label={t('common.password')}
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete='current-password'
                                placeholder='••••••••'
                                className='pr-11'
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={t(
                                    showPassword
                                        ? 'auth.hidePassword'
                                        : 'auth.showPassword',
                                )}
                                className='text-text-tertiary hover:text-text-primary focus-visible:ring-input-primary-focus-border/30 absolute top-7.5 right-1.5 flex size-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-4'
                            >
                                {showPassword ? (
                                    <EyeDisabled className='size-5' />
                                ) : (
                                    <Eye className='size-5' />
                                )}
                            </button>
                        </div>

                        {error && (
                            <div
                                role='alert'
                                className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
                            >
                                {error}
                            </div>
                        )}

                        <Button
                            type='submit'
                            variant='primary'
                            appearance='fill'
                            size='lg'
                            isDisabled={pending}
                            className='mt-1 w-full'
                        >
                            {pending ? t('auth.signingIn') : t('auth.signIn')}
                        </Button>
                    </form>

                    <p className='text-text-tertiary mt-6 text-center text-xs'>
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
    );
}
