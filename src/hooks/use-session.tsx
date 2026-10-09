'use client';

import { SESSION_STORAGE_KEY, TOKEN_STORAGE_KEY } from '@/services/api/client';
import type { Session } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

interface SessionContextValue {
    session: Session | null;
    /** localStorage o'qilgunicha true — bu paytda yo'naltirish qilinmaydi. */
    loading: boolean;
    signIn: (session: Session) => void;
    signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): Session | null {
    try {
        const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (!token || !raw) return null;
        const parsed = JSON.parse(raw) as Session;
        // Eski versiyadan qolgan (rol asosidagi) sessiya — qayta kirish kerak.
        if (parsed.kind !== 'super_admin' && parsed.kind !== 'user') {
            return null;
        }
        return { ...parsed, token };
    } catch {
        return null;
    }
}

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const queryClient = useQueryClient();

    // localStorage faqat brauzerda mavjud. Uni render paytida o'qib bo'lmaydi:
    // server HTML'i har doim sessiyasiz chiziladi, shuning uchun qiymat
    // hydration tugagach — mount effektida bir marta o'qiladi.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession(readStoredSession());
        setLoading(false);
    }, []);

    const signIn = useCallback(
        (next: Session) => {
            try {
                window.localStorage.setItem(TOKEN_STORAGE_KEY, next.token);
                window.localStorage.setItem(
                    SESSION_STORAGE_KEY,
                    JSON.stringify(next),
                );
            } catch {
                /* localStorage o'chirilgan bo'lsa ham sessiya xotirada ishlaydi */
            }
            setSession((prev) => {
                // Agar boshqa foydalanuvchi yoki boshqa markaz kelsa, keshni butunlay tozalaymiz
                if (
                    prev &&
                    (prev.id !== next.id ||
                        prev.token !== next.token ||
                        prev.education?.id !== next.education?.id)
                ) {
                    queryClient.clear();
                }
                return next;
            });
        },
        [queryClient],
    );

    const signOut = useCallback(() => {
        try {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
            /* e'tiborsiz */
        }
        queryClient.clear();
        setSession(null);
        router.replace('/login');
    }, [queryClient, router]);

    const value = useMemo(
        () => ({ session, loading, signIn, signOut }),
        [session, loading, signIn, signOut],
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession faqat SessionProvider ichida ishlaydi');
    }
    return context;
}
