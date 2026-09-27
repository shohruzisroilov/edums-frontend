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
import { ChevronLeft, ChevronRight, Wallet2 } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

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
        <div id='page-top' className='bg-background-gray-secondary_alt_2 h-full overflow-y-auto scroll-smooth'>
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

/** Tariflar bazadan — super admin qo'shgan faol tariflar. Slider ko'rinishida. */
function Tariffs({
    trialDays,
    onStart,
}: {
    trialDays: number;
    onStart: () => void;
}) {
    const t = useT();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const tariffsQuery = useQuery({
        queryKey: ['public-tariffs'],
        queryFn: listPublicTariffs,
    });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.75;
            scrollContainerRef.current.scrollTo({
                left:
                    direction === 'left'
                        ? scrollLeft - scrollAmount
                        : scrollLeft + scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section
            id='tariffs'
            className='mx-auto max-w-7xl scroll-mt-20 px-5 py-16'
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
                <div className='relative mt-10 px-2 sm:px-4'>
                    {/* Previous Button */}
                    <button
                        type='button'
                        onClick={() => scroll('left')}
                        aria-label='Previous'
                        className='border-card-border bg-card-background text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary active:scale-95 absolute -left-2 sm:left-0 top-1/2 z-20 flex -translate-y-1/2 size-10 sm:size-12 items-center justify-center rounded-full border shadow-lg transition-all cursor-pointer'
                    >
                        <ChevronLeft className='size-5 sm:size-6' />
                    </button>

                    {/* Next Button */}
                    <button
                        type='button'
                        onClick={() => scroll('right')}
                        aria-label='Next'
                        className='border-card-border bg-card-background text-text-secondary hover:text-text-primary hover:bg-background-gray-secondary active:scale-95 absolute -right-2 sm:right-0 top-1/2 z-20 flex -translate-y-1/2 size-10 sm:size-12 items-center justify-center rounded-full border shadow-lg transition-all cursor-pointer'
                    >
                        <ChevronRight className='size-5 sm:size-6' />
                    </button>

                    {/* Horizontal Slider Track */}
                    <div
                        ref={scrollContainerRef}
                        className='flex gap-5 overflow-x-auto py-3 px-6 sm:px-12 scroll-smooth snap-x snap-mandatory rounded-2xl scrollbar-none'
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {tariffsQuery.data.map((tariff) => (
                            <div
                                key={tariff.id}
                                className='w-[280px] sm:w-[320px] lg:w-[330px] shrink-0 snap-center'
                            >
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
                </div>
            )}
        </section>
    );
}

