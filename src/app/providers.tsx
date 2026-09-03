'use client';

import { SessionProvider } from '@/hooks/use-session';
import { LocaleProvider } from '@/i18n/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
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
            <LocaleProvider>
                <SessionProvider>{children}</SessionProvider>
            </LocaleProvider>
        </QueryClientProvider>
    );
}
