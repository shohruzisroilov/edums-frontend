'use client';

import Header from '@/components/common/header';
import Sidebar from '@/components/common/sidebar';
import { Spinner } from '@/components/tailgrids/core/spinner';
import {
    SheetContent,
    SheetOverlay,
    SheetTitle,
} from '@/components/tailgrids/core/sheet';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getMe, verifySuperAdminToken } from '@/services/api/auth';
import { cn } from '@/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { session, loading } = useSession();
    const router = useRouter();
    const t = useT();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    // Saqlangan token eskirgan bo'lishi mumkin. Uni bir marta serverda
    // tekshiramiz: super admin uchun /super_admin/verify_token, xodimlar
    // uchun /auth/me. Muvaffaqiyatsiz bo'lsa client 401'ni ushlab, sessiyani
    // tozalaydi va login sahifasiga qaytaradi.
    useQuery({
        queryKey: ['session-check', session?.id],
        queryFn: async () => {
            if (session?.role === 'super_admin') await verifySuperAdminToken();
            else await getMe();
            return true;
        },
        enabled: !!session,
        retry: false,
        staleTime: Infinity,
    });

    // Sessiya localStorage'dan o'qilgach tekshiriladi; aks holda har
    // yangilanishda login sahifasiga otib ketardi.
    useEffect(() => {
        if (!loading && !session) router.replace('/login');
    }, [loading, session, router]);

    if (loading || !session) {
        return (
            <div className='flex h-full items-center justify-center'>
                <Spinner />
            </div>
        );
    }

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className='flex h-full'>
            <aside
                style={{
                    width: isSidebarOpen ? '270px' : '72px',
                    minWidth: isSidebarOpen ? '270px' : '72px',
                    transition:
                        'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)',
                }}
                className='hidden shrink-0 overflow-hidden xl:block'
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
                    isSidebarOpen ? 'lg:p-4 xl:pr-4' : 'lg:py-4 xl:px-4',
                )}
            >
                <div className='border-card-surface-border bg-card-surface-area flex h-full flex-col overflow-hidden border-[0.5px] lg:rounded-2xl lg:shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.04)]'>
                    <Header onMenuClick={() => setIsMobileSheetOpen(true)} />

                    <main className='min-h-0 flex-1 scrollbar-thin overflow-y-auto'>
                        <div className='mx-auto w-full max-w-384 pb-6'>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
