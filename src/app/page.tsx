'use client';

import { Faq } from '@/components/landing/faq';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { FinalCta } from '@/components/landing/final-cta';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { PainPoints } from '@/components/landing/pain-points';
import { SectionHeading } from '@/components/landing/section-heading';
import { Showcases } from '@/components/landing/showcases';
import { Button } from '@/components/tailgrids/core/button';
import { TariffCard } from '@/components/ui/tariff-card';
import { useSession } from '@/hooks/use-session';
import { useTrialDays } from '@/hooks/use-trial-days';
import { useT } from '@/i18n/provider';
import { listPublicTariffs } from '@/services/api/tariffs';
import { homeHref } from '@/utils/access';
import { Wallet2 } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

/**
 * Landing page. Bo'limlar `components/landing/` da; rasmlar
 * `components/landing/images.ts` orqali qo'yiladi.
 */
export default function LandingPage() {
    const router = useRouter();
    const { session } = useSession();
    const trialDays = useTrialDays();

    const start = () => router.push(session ? homeHref(session) : '/register');

    return (
        <div className='bg-background-gray-secondary_alt_2 h-full overflow-y-auto scroll-smooth'>
            <LandingHeader signedIn={Boolean(session)} onStart={start} />

            <main>
                <Hero onStart={start} />
                <PainPoints />
                <Showcases />
                <FeatureGrid />
                <HowItWorks trialDays={trialDays} />
                <Tariffs trialDays={trialDays} onStart={start} />
                <Faq trialDays={trialDays} />
                <FinalCta trialDays={trialDays} onStart={start} />
            </main>

            <LandingFooter />
        </div>
    );
}

/** Tariflar bazadan — super admin qo'shgan faol tariflar. */
function Tariffs({
    trialDays,
    onStart,
}: {
    trialDays: number;
    onStart: () => void;
}) {
    const t = useT();

    const tariffsQuery = useQuery({
        queryKey: ['public-tariffs'],
        queryFn: listPublicTariffs,
    });

    return (
        <section
            id='tariffs'
            className='mx-auto max-w-6xl scroll-mt-20 px-5 py-16'
        >
            <SectionHeading
                title={t('landing.tariffsTitle')}
                text={t('landing.tariffsText', { days: trialDays })}
            />
            {tariffsQuery.isPending ? (
                <p className='text-text-tertiary mt-10 text-center text-sm'>
                    …
                </p>
            ) : tariffsQuery.error || tariffsQuery.data.length === 0 ? (
                <div className='border-card-border bg-card-background mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-2xl border p-8 text-center'>
                    <Wallet2 className='text-text-tertiary size-6' />
                    <p className='text-text-secondary text-sm'>
                        {t('landing.tariffsSoon')}
                    </p>
                </div>
            ) : (
                // Tariflar markazda: bitta yoki ikkitasi chapga yopishib qolmaydi.
                <div className='mt-10 flex flex-wrap justify-center gap-4'>
                    {tariffsQuery.data.map((tariff) => (
                        <div key={tariff.id} className='w-full sm:w-88'>
                            <TariffCard
                                tariff={tariff}
                                action={
                                    <Button
                                        size='lg'
                                        className='w-full'
                                        onPress={onStart}
                                    >
                                        {t('landing.startFree')}
                                    </Button>
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
