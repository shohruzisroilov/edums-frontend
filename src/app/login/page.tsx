'use client';

import { AuthHeader } from '@/components/common/auth-header';
import { Button } from '@/components/tailgrids/core/button';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { apiErrorMessage } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
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

/** Hisob ochish yoki savollar bo'yicha murojaat kanali. */
const SUPPORT_TELEGRAM = 'https://t.me/edumsuz';

/**
 * Backendda ikkita login endpointi bor: markaz foydalanuvchilari uchun /auth/login va
 * super admin uchun /super_admin/login. Foydalanuvchidan turini so'ramaymiz —
 * avval foydalanuvchi sifatida urinib ko'ramiz, 401 kelsa super admin sifatida.
 */
async function signInWithPhone(
    phone_number: string,
    password: string,
): Promise<Session> {
    try {
        const res = await loginUser({ phone_number, password });

        return sessionFromAuthUser(res.token, res.user);
    } catch (userError) {
        // Faqat "hisob topilmadi / parol xato" holatida ikkinchi endpointga
        // o'tamiz; tarmoq yoki validatsiya xatosi bo'lsa darhol qaytaramiz.
        if (!(userError instanceof ApiError) || userError.statusCode !== 401) {
            throw userError;
        }

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
            // 429 — shu raqam uchun urinishlar limiti tugagan: kutish kerakligini
            // aytmasak, odam to'g'ri parolni ham "xato" deb o'ylab qoladi.
            if (
                superAdminError instanceof ApiError &&
                superAdminError.statusCode === 429
            ) {
                throw superAdminError;
            }
            // Ikkalasi ham rad etdi. Foydalanuvchi endpointining xabari to'liqroq
            // (nofaol hisob haqida ham aytadi), shuning uchun o'shani beramiz.
            throw userError;
        }
    }
}

export default function LoginPage() {
    const router = useRouter();
    const { session, loading, signIn } = useSession();
    const t = useT();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    // Allaqachon kirgan bo'lsa login sahifasida ushlab turishning ma'nosi yo'q.
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
        <div className='bg-background-gray-secondary_alt_2 flex h-full flex-col overflow-y-auto'>
            <AuthHeader />

            <div className='flex flex-1 items-center justify-center p-4 py-8'>
                <div className='border-card-border bg-card-surface-area w-full max-w-md rounded-2xl border p-8 shadow-sm'>
                    <div className='mb-7 flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-text-primary font-display text-xl font-semibold'>
                            {t('auth.title')}
                        </h1>
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

                        <PasswordInput
                            label={t('common.password')}
                            required
                            autoComplete='current-password'
                            placeholder='••••••••'
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />

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

                    <p className='text-text-secondary mt-6 text-center text-sm'>
                        {t('auth.noAccount')}{' '}
                        <Link
                            href='/register'
                            className='text-brand-accent font-medium hover:underline'
                        >
                            {t('auth.tryFree')}
                        </Link>
                    </p>

                    <p className='text-text-tertiary mt-3 text-center text-xs'>
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
