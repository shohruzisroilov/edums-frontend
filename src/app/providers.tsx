'use client';

import { SessionProvider } from '@/hooks/use-session';
import { LocaleProvider } from '@/i18n/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';

export default function Providers({ children }: { children: ReactNode }) {
    const router = useRouter();
    // QueryClient har so'rovda bir marta yaratiladi.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Ro'yxatlar tez-tez o'zgaradi, lekin har fokusda
                        // qayta yuklash ortiqcha.
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 30_000,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {/* react-aria havolalari (menyu bandidagi `href`) sahifani qayta
                yuklamasdan, Next router orqali ochilsin. */}
            <RouterProvider navigate={router.push}>
                <LocaleProvider>
                    <SessionProvider>{children}</SessionProvider>
                </LocaleProvider>
            </RouterProvider>
        </QueryClientProvider>
    );
}
