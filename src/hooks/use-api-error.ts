'use client';

import { useT, type Translate } from '@/i18n/provider';
import { ApiError } from '@/services/api/client';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Xato matnini foydalanuvchi tiliga o'giradi.
 * Backend xabarlari o'zbekcha keladi va o'zgartirilmaydi; client tomonida
 * yuzaga kelgan xatolar esa tarjima kaliti orqali beriladi.
 */
export function apiErrorMessage(error: unknown, t: Translate): string {
    if (error instanceof ApiError) {
        if (error.messageKey) return t(error.messageKey, error.messageValues);
        return error.messages.join('\n');
    }
    return t('error.unknown');
}

/** Xatoni toast sifatida ko'rsatadigan funksiyani qaytaradi. */
export function useApiErrorToast() {
    const t = useT();

    return useCallback(
        (error: unknown, fallbackKey?: Parameters<Translate>[0]) => {
            const message =
                error instanceof ApiError
                    ? apiErrorMessage(error, t)
                    : t(fallbackKey ?? 'error.actionFailed');

            toast.error(message);
        },
        [t],
    );
}
