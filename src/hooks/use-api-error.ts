'use client';

import { useT, type Translate } from '@/i18n/provider';
import { ApiError } from '@/services/api/client';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * English/NestJS system & validation error messages mapping to i18n keys.
 */
function translateErrorText(msg: string, t: Translate): string {
    const trimmed = msg.trim();

    // Exact system matches
    if (trimmed === 'Internal server error')
        return t('error.internalServerError');
    if (trimmed === 'Unauthorized' || trimmed === 'Unauthorized resource')
        return t('error.unauthorized');
    if (trimmed === 'Forbidden' || trimmed === 'Forbidden resource')
        return t('error.forbidden');
    if (trimmed === 'Bad Request') return t('error.badRequest');
    if (trimmed === 'Not Found') return t('error.notFound');
    if (
        trimmed.startsWith('Cannot GET') ||
        trimmed.startsWith('Cannot POST') ||
        trimmed.startsWith('Cannot PUT') ||
        trimmed.startsWith('Cannot DELETE')
    ) {
        return t('error.notFound');
    }

    // Class-validator regex patterns
    if (/must match \+998/i.test(trimmed)) return t('error.phoneFormat');
    if (/should not be empty|must not be empty/i.test(trimmed))
        return t('error.required');
    if (/must be a string/i.test(trimmed)) return t('error.mustBeString');
    if (/must be a number|must be an integer/i.test(trimmed))
        return t('error.mustBeNumber');
    if (/must be a valid enum value/i.test(trimmed))
        return t('error.invalidEnum');
    if (/must be a UUID/i.test(trimmed)) return t('error.invalidId');
    if (/must be a positive number/i.test(trimmed))
        return t('error.mustBePositive');
    if (/must be a boolean/i.test(trimmed)) return t('error.mustBeBoolean');

    // Known backend Uzbek messages to map to active locale if needed
    if (
        trimmed.includes('SMS yuborib bolmadi') ||
        trimmed.includes("SMS yuborib bo'lmadi")
    ) {
        return t('error.smsFailed');
    }
    if (
        trimmed.includes('Joriy parol notogri') ||
        trimmed.includes('Parol notogri') ||
        trimmed.includes("Parol noto'g'ri")
    ) {
        return t('error.invalidPassword');
    }
    if (
        trimmed.includes('Bu nomdagi') &&
        trimmed.includes('allaqachon mavjud')
    ) {
        return t('error.alreadyExists');
    }
    if (
        trimmed.includes('Bu raqam bilan allaqachon') ||
        trimmed.includes('already exists')
    ) {
        return t('error.phoneInUse');
    }

    return trimmed;
}

/**
 * Xato matnini foydalanuvchi tiliga o'giradi.
 */
export function apiErrorMessage(error: unknown, t: Translate): string {
    if (error instanceof ApiError) {
        if (error.messageKey) return t(error.messageKey, error.messageValues);
        const translatedMessages = error.messages.map((msg) =>
            translateErrorText(msg, t),
        );
        return translatedMessages.join('\n');
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
