'use client';

import { AppLogo } from '@/components/common/app-logo';
import ThemeToggle from '@/components/common/header/theme-toggle';
import { LocaleSwitcher } from '@/components/common/locale-switcher';
import { Button } from '@/components/tailgrids/core/button';
import { TariffCard } from '@/components/ui/tariff-card';
import { useSession } from '@/hooks/use-session';
import { useTrialDays } from '@/hooks/use-trial-days';
import { useT } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { listPublicTariffs } from '@/services/api/tariffs';
import { homeHref } from '@/utils/access';
import {
    Globe2,
    Locked3,
    Rocket1,
    Shield1Check,
    UserMultiple4,
    Wallet2,
} from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/** Hisob ochish yoki savollar bo'yicha murojaat kanali. */
const SUPPORT_TELEGRAM = 'https://t.me/edumsuz';

/**
 * Bu yerda faqat tizimda hozir haqiqatan bor imkoniyatlar sanaladi — yangi
 * modul qo'shilganda ro'yxat ham kengayadi.
 */
const FEATURES: {
    icon: ReactNode;
    title: TranslationKey;
    text: TranslationKey;
}[] = [
    {
        icon: <UserMultiple4 className='size-5' />,
        title: 'landing.featureUsersTitle',
        text: 'landing.featureUsersText',
    },
    {
        icon: <Shield1Check className='size-5' />,
        title: 'landing.featureRolesTitle',
        text: 'landing.featureRolesText',
    },
    {
        icon: <Locked3 className='size-5' />,
        title: 'landing.featureSecurityTitle',
        text: 'landing.featureSecurityText',
    },
    {
        icon: <Globe2 className='size-5' />,
        title: 'landing.featureLanguagesTitle',
        text: 'landing.featureLanguagesText',
    },
];

const STEPS: { title: TranslationKey; text: TranslationKey }[] = [
    { title: 'landing.step1Title', text: 'landing.step1Text' },
    { title: 'landing.step2Title', text: 'landing.step2Text' },
    { title: 'landing.step3Title', text: 'landing.step3Text' },
];

export default function LandingPage() {
    const t = useT();
    const router = useRouter();
    const { session } = useSession();
    const trialDays = useTrialDays();

    const tariffsQuery = useQuery({
        queryKey: ['public-tariffs'],
        queryFn: listPublicTariffs,
    });

    const start = () => router.push(session ? homeHref(session) : '/register');

    return (
        <div className='bg-background-gray-secondary_alt_2 h-full overflow-y-auto'>
            <header className='border-card-border bg-card-surface-area/90 sticky top-0 z-10 border-b backdrop-blur'>
                <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3'>
                    <Link href='/' aria-label={t('nav.home')}>
                        <AppLogo />
                    </Link>
                    <div className='flex items-center gap-2'>
                        <a
                            href='#tariffs'
                            className='text-text-secondary hover:text-text-primary hidden px-2 text-sm font-medium sm:block'
                        >
                            {t('landing.navTariffs')}
                        </a>
                        <LocaleSwitcher />
                        <ThemeToggle />
                        {session ? (
                            <Button size='md' onPress={start}>
                                {t('landing.openCabinet')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    appearance='outline'
                                    size='md'
                                    onPress={() => router.push('/login')}
                                >
                                    {t('auth.signIn')}
                                </Button>
                                <Button
                                    size='md'
                                    className='hidden sm:flex'
                                    onPress={start}
                                >
                                    {t('landing.startFree')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className='mx-auto max-w-4xl px-5 pt-20 pb-16 text-center'>
                    <span className='border-card-border bg-card-background text-text-secondary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
                        <Rocket1 className='text-brand-accent size-4' />
                        {t('landing.badge', { days: trialDays })}
                    </span>
                    <h1 className='text-text-primary font-display mt-6 text-4xl leading-tight font-semibold sm:text-5xl'>
                        {t('landing.heroTitle')}
                    </h1>
                    <p className='text-text-secondary mx-auto mt-5 max-w-2xl text-lg'>
                        {t('landing.heroText')}
                    </p>
                    <div className='mt-8 flex flex-wrap justify-center gap-3'>
                        <Button size='xl' onPress={start}>
                            {t('landing.startFree')}
                        </Button>
                        <Button
                            appearance='outline'
                            size='xl'
                            onPress={() =>
                                document
                                    .getElementById('tariffs')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            {t('landing.seeTariffs')}
                        </Button>
                    </div>
                    <p className='text-text-tertiary mt-4 text-sm'>
                        {t('landing.noCard')}
                    </p>
                </section>

                <section className='mx-auto max-w-6xl px-5 py-12'>
                    <h2 className='text-text-primary font-display text-center text-2xl font-semibold'>
                        {t('landing.featuresTitle')}
                    </h2>
                    <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className='border-card-border bg-card-background rounded-2xl border p-6'
                            >
                                <span className='bg-brand-accent/10 text-brand-accent flex size-10 items-center justify-center rounded-xl'>
                                    {feature.icon}
                                </span>
                                <h3 className='text-text-primary mt-4 font-semibold'>
                                    {t(feature.title)}
                                </h3>
                                <p className='text-text-tertiary mt-2 text-sm'>
                                    {t(feature.text)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className='mx-auto max-w-6xl px-5 py-12'>
                    <h2 className='text-text-primary font-display text-center text-2xl font-semibold'>
                        {t('landing.stepsTitle')}
                    </h2>
                    <ol className='mt-8 grid gap-4 md:grid-cols-3'>
                        {STEPS.map((step, index) => (
                            <li
                                key={step.title}
                                className='border-card-border bg-card-background rounded-2xl border p-6'
                            >
                                <span className='bg-brand-500 flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white'>
                                    {index + 1}
                                </span>
                                <h3 className='text-text-primary mt-4 font-semibold'>
                                    {t(step.title, { days: trialDays })}
                                </h3>
                                <p className='text-text-tertiary mt-2 text-sm'>
                                    {t(step.text)}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section
                    id='tariffs'
                    className='mx-auto max-w-6xl scroll-mt-20 px-5 py-12'
                >
                    <h2 className='text-text-primary font-display text-center text-2xl font-semibold'>
                        {t('landing.tariffsTitle')}
                    </h2>
                    <p className='text-text-tertiary mt-2 text-center text-sm'>
                        {t('landing.tariffsText', { days: trialDays })}
                    </p>
                    {tariffsQuery.isPending ? (
                        <p className='text-text-tertiary mt-8 text-center text-sm'>
                            …
                        </p>
                    ) : tariffsQuery.error || tariffsQuery.data.length === 0 ? (
                        <div className='border-card-border bg-card-background mx-auto mt-8 flex max-w-md flex-col items-center gap-3 rounded-2xl border p-8 text-center'>
                            <Wallet2 className='text-text-tertiary size-6' />
                            <p className='text-text-secondary text-sm'>
                                {t('landing.tariffsSoon')}
                            </p>
                        </div>
                    ) : (
                        <div className='mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {tariffsQuery.data.map((tariff) => (
                                <TariffCard
                                    key={tariff.id}
                                    tariff={tariff}
                                    action={
                                        <Button
                                            size='lg'
                                            className='w-full'
                                            onPress={start}
                                        >
                                            {t('landing.startFree')}
                                        </Button>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className='mx-auto max-w-4xl px-5 py-16'>
                    <div className='bg-brand-500 rounded-3xl px-8 py-12 text-center text-white'>
                        <h2 className='font-display text-2xl font-semibold'>
                            {t('landing.ctaTitle')}
                        </h2>
                        <p className='mx-auto mt-3 max-w-xl text-white/85'>
                            {t('landing.ctaText', { days: trialDays })}
                        </p>
                        <button
                            type='button'
                            onClick={start}
                            className='text-brand-500 mt-6 rounded-lg bg-white px-6 py-3 text-sm font-semibold transition hover:bg-white/90'
                        >
                            {t('landing.startFree')}
                        </button>
                    </div>
                </section>
            </main>

            <footer className='border-card-border border-t'>
                <div className='text-text-tertiary mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm'>
                    <span>© {new Date().getFullYear()} EduMS</span>
                    <span>
                        {t('auth.contact')}{' '}
                        <a
                            href={SUPPORT_TELEGRAM}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-brand-accent font-medium hover:underline'
                        >
                            @edumsuz
                        </a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
