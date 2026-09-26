'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Meter } from '@/components/ui/charts';
import { LinkButton } from '@/components/ui/link-button';
import { withNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import type { DashboardSetup } from '@/types/api';
import { cn } from '@/utils/cn';
import { ArrowRight, Check } from '@tailgrids/icons';
import { useEffect, useState } from 'react';

/**
 * Tartib muhim: har qadam oldingisiga tayanadi (guruh kurs va xonani
 * so'raydi, to'lov — guruhdagi o'quvchini). Havola to'g'ridan-to'g'ri
 * yaratish oynasini ochadi.
 */
const STEPS: { key: keyof DashboardSetup; href: string }[] = [
    { key: 'rooms', href: '/branches?rooms=1' },
    { key: 'courses', href: withNewParam('/courses') },
    { key: 'staff', href: withNewParam('/users') },
    { key: 'groups', href: withNewParam('/groups') },
    { key: 'students', href: withNewParam('/students') },
    { key: 'payments', href: withNewParam('/cashbox') },
];

/**
 * Yangi markaz uchun "nimadan boshlayman?" degan savolga javob. Faqat owner
 * ko'radi — markazni sozlash uning ishi. Hamma qadam bajarilgach o'zi
 * yo'qoladi; undan oldin ham yashirib qo'ysa bo'ladi (shu brauzerda).
 */
export function GettingStarted({ setup }: { setup: DashboardSetup }) {
    const t = useT();
    const { session } = useSession();
    const storageKey = `edums_setup_hidden_${session?.education?.id ?? ''}`;

    // null — hali o'qilmagan: karta bir lahza ko'rinib yo'qolmasligi uchun.
    const [hidden, setHidden] = useState<boolean | null>(null);

    useEffect(() => {
        let stored = false;
        try {
            stored = window.localStorage.getItem(storageKey) === '1';
        } catch {
            /* localStorage yopiq bo'lishi mumkin */
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHidden(stored);
    }, [storageKey]);

    const done = STEPS.filter((step) => setup[step.key] > 0).length;
    const nextStep = STEPS.find((step) => setup[step.key] === 0);

    if (!session?.is_owner || hidden !== false || !nextStep) return null;

    function hide() {
        try {
            window.localStorage.setItem(storageKey, '1');
        } catch {
            /* saqlanmasa ham joriy sahifada yashiriladi */
        }
        setHidden(true);
    }

    return (
        <section
            aria-labelledby='getting-started-title'
            className='border-card-border bg-card-background mx-5 mb-5 rounded-xl border p-5'
        >
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                    <h2
                        id='getting-started-title'
                        className='text-text-primary font-display text-base font-semibold'
                    >
                        {t('setup.title')}
                    </h2>
                    <p className='text-text-tertiary mt-1 text-sm'>
                        {t('setup.subtitle')}
                    </p>
                </div>
                <Button appearance='ghost' size='sm' onPress={hide}>
                    {t('setup.hide')}
                </Button>
            </div>

            <div className='mt-4 flex items-center gap-3'>
                <div className='flex-1'>
                    <Meter
                        value={done / STEPS.length}
                        label={t('setup.title')}
                    />
                </div>
                <span className='text-text-secondary mt-2 shrink-0 text-xs font-medium tabular-nums'>
                    {t('setup.progress', { done, total: STEPS.length })}
                </span>
            </div>

            <ol className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {STEPS.map((step, index) => {
                    const complete = setup[step.key] > 0;
                    const current = step === nextStep;

                    return (
                        <li
                            key={step.key}
                            className={cn(
                                'flex gap-3 rounded-lg border p-3.5',
                                current
                                    ? 'border-brand-accent/50 bg-brand-accent/5'
                                    : 'border-card-border',
                            )}
                        >
                            <span
                                aria-hidden='true'
                                className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                                    complete
                                        ? 'bg-badge-success-background text-badge-success-text'
                                        : current
                                          ? 'bg-button-primary-background text-button-primary-text'
                                          : 'bg-background-gray-primary text-text-tertiary',
                                )}
                            >
                                {complete ? (
                                    <Check className='size-4' />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <div className='min-w-0 flex-1'>
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        complete
                                            ? 'text-text-tertiary line-through'
                                            : 'text-text-primary',
                                    )}
                                >
                                    {t(`setup.${step.key}.title`)}
                                    {complete && (
                                        <span className='sr-only'>
                                            {' '}
                                            — {t('setup.done')}
                                        </span>
                                    )}
                                </p>
                                {!complete && (
                                    <>
                                        <p className='text-text-tertiary mt-0.5 text-xs'>
                                            {t(`setup.${step.key}.hint`)}
                                        </p>
                                        <LinkButton
                                            href={step.href}
                                            appearance={
                                                current ? 'fill' : 'ghost'
                                            }
                                            className={cn(
                                                'mt-2.5 h-8 px-3',
                                                !current && '-ml-3',
                                            )}
                                        >
                                            {t(`setup.${step.key}.action`)}
                                            <ArrowRight />
                                        </LinkButton>
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
