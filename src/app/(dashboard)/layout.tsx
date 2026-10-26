'use client';

import Header from '@/components/common/header';
import Sidebar from '@/components/common/sidebar';
import { Spinner } from '@/components/tailgrids/core/spinner';
import {
    SheetContent,
    SheetOverlay,
    SheetTitle,
} from '@/components/tailgrids/core/sheet';
import { SubscriptionBanner } from '@/components/common/subscription-banner';
import { useDemoPrivacy } from '@/hooks/use-demo-privacy';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    getMe,
    sessionFromAuthUser,
    verifySuperAdminToken,
} from '@/services/api/auth';
import {
    PAGES_WITHOUT_SUBSCRIPTION,
    hasActiveSubscription,
} from '@/utils/access';
import { cn } from '@/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/common/bottom-nav';
import { Suspense, useEffect, useState, type ReactNode } from 'react';

const SIDEBAR_STORAGE_KEY = 'edums_sidebar_open';
/**
 * Eng katta planshetlar (iPad Pro 12.9"/13" — 1366px-1376px, Surface Pro — 1368px,
 * Samsung Galaxy Tab S8/S9/S10 Ultra — 1440px) ham ekranni siqib qo'ymaslik
 * uchun ixcham 72px rejimida ishlaydi. 1440px dan yuqori ekranlar (desktop monitorlar)
 * to'liq kenglikda ochiladi.
 */
const TABLET_MAX_WIDTH = 1440;

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { session, loading, signIn } = useSession();
    const { isPrivacyOn } = useDemoPrivacy();
    const router = useRouter();
    const pathname = usePathname();
    const t = useT();

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        // Planshetlarda (768px-1440px) ekranni siqib qo'ymaslik uchun ixcham 72px rejimda boshlanadi
        if (window.innerWidth <= TABLET_MAX_WIDTH) return false;
        try {
            const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            if (stored !== null) return stored === 'true';
        } catch {
            /* localStorage yopiq bo'lishi mumkin */
        }
        return true;
    });
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    // Saqlangan token eskirgan bo'lishi mumkin. Uni bir marta serverda
    // tekshiramiz: super admin uchun /super_admin/verify_token, foydalanuvchi
    // uchun /auth/me. Muvaffaqiyatsiz bo'lsa client 401'ni ushlab, sessiyani
    // tozalaydi va login sahifasiga qaytaradi.
    //
    // /auth/me javobi sessiyaga yoziladi: rollar yoki ruxsatlar oxirgi
    // kirishdan beri o'zgargan bo'lsa, menyu va tugmalar shunga moslashadi.
    useQuery({
        queryKey: ['session-check', session?.id],
        queryFn: async () => {
            if (!session) return false;
            if (session.kind === 'super_admin') {
                await verifySuperAdminToken();
            } else {
                signIn(sessionFromAuthUser(session.token, await getMe()));
            }
            return true;
        },
        enabled: !!session,
        retry: false,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    });

    // Sessiya localStorage'dan o'qilgach tekshiriladi; aks holda har
    // yangilanishda login sahifasiga otib ketardi.
    useEffect(() => {
        if (!loading && !session) router.replace('/login');
    }, [loading, session, router]);

    // Planshet o'lchamlarida (768px - 1440px) yon panel avtomatik ixcham holatga moslashadi
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth <= TABLET_MAX_WIDTH) {
                setIsSidebarOpen(false);
            }
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Obuna tugagan markaz foydalanuvchisi faqat tarif tanlash va profilda
    // qoladi — boshqa sahifalar backendda baribir 402 beradi.
    const blocked =
        session?.kind === 'user' &&
        !hasActiveSubscription(session) &&
        !PAGES_WITHOUT_SUBSCRIPTION.some((page) => pathname.startsWith(page));

    useEffect(() => {
        if (blocked) router.replace('/billing');
    }, [blocked, router]);

    if (loading || !session || blocked) {
        return (
            <div className='flex h-full items-center justify-center'>
                <Spinner />
            </div>
        );
    }

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            } catch {
                /* saqlanmasa ham joriy holat ishlaydi */
            }
            return next;
        });
    };

    return (
        <div className='flex h-full'>
            <aside
                style={{
                    width: isSidebarOpen ? '270px' : '72px',
                    minWidth: isSidebarOpen ? '270px' : '72px',
                    transition:
                        'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)',
                }}
                className='hidden shrink-0 overflow-hidden md:block'
            >
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
            </aside>

            <SheetOverlay
                isOpen={isMobileSheetOpen}
                onOpenChange={setIsMobileSheetOpen}
            >
                <SheetContent
                    side='left'
                    showCloseButton={false}
                    className='border-card-border bg-card-surface-area w-67.5! max-w-67.5! border-r p-0'
                >
                    <SheetTitle className='sr-only'>
                        {t('nav.sidebar')}
                    </SheetTitle>
                    <Sidebar
                        isSidebarOpen
                        isMobileSheet
                        toggleSidebar={() => setIsMobileSheetOpen(false)}
                        onItemClick={() => setIsMobileSheetOpen(false)}
                    />
                </SheetContent>
            </SheetOverlay>

            <div
                className={cn(
                    'min-w-0 flex-1',
                    isSidebarOpen ? 'lg:p-4 xl:pr-4' : 'lg:p-4',
                )}
            >
                <div className='border-card-surface-border bg-card-surface-area flex h-full flex-col overflow-hidden border-[0.5px] lg:rounded-2xl lg:shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.04)]'>
                    <Header onMenuClick={() => setIsMobileSheetOpen(true)} />

                    <main
                        key={isPrivacyOn ? 'privacy-on' : 'privacy-off'}
                        className='min-h-0 flex-1 scrollbar-thin overflow-x-hidden overflow-y-auto'
                    >
                        <div className='mx-auto w-full max-w-384 min-w-0 pb-20 md:pb-6'>
                            <SubscriptionBanner />
                            {/* Sahifalar manzildagi parametrlarni o'qiydi
                                (filtrlar, ?new=1) — Next buning uchun
                                Suspense chegarasini talab qiladi. */}
                            <Suspense
                                fallback={
                                    <div className='flex justify-center py-16'>
                                        <Spinner />
                                    </div>
                                }
                            >
                                {children}
                            </Suspense>
                        </div>
                    </main>
                </div>
            </div>

            <BottomNav onMenuClick={() => setIsMobileSheetOpen(true)} />
        </div>
    );
}
