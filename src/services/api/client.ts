import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { ErrorResponse } from '@/types/api';

/**
 * Manzillar `.env` dan olinadi. Zaxira qiymat — lokal backend: `.env`
 * unutilsa ham ilova production'ga emas, o'z kompyuteringizdagi API'ga ulanadi.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const FILES_URL = process.env.NEXT_PUBLIC_FILES_URL ?? 'http://localhost:4000';

export const TOKEN_STORAGE_KEY = 'edums_token';
export const SESSION_STORAGE_KEY = 'edums_session';

/**
 * Backend xatolari bitta konvertda keladi (AllExceptionsFilter):
 * { success: false, statusCode, message, path, timestamp }.
 * `message` validatsiya xatolarida massiv bo'ladi.
 */
export class ApiError extends Error {
    readonly statusCode: number;
    /** Backenddan kelgan xabarlar — ular allaqachon o'zbekcha. */
    readonly messages: string[];
    /**
     * Xato client tomonida yuzaga kelgan bo'lsa (tarmoq uzilishi, bo'sh javob),
     * matn o'rniga tarjima kaliti beriladi — u foydalanuvchi tilida ko'rsatiladi.
     */
    readonly messageKey?: TranslationKey;
    readonly messageValues?: Record<string, string | number>;

    constructor(
        statusCode: number,
        message: string | string[],
        translation?: {
            key: TranslationKey;
            values?: Record<string, string | number>;
        },
    ) {
        const list = Array.isArray(message) ? message : [message];
        super(list[0] ?? 'Unknown error');
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.messages = list;
        this.messageKey = translation?.key;
        this.messageValues = translation?.values;
    }
}

function readToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
        return null;
    }
}

/** 401 kelganda sessiyani tozalab, login sahifasiga qaytaradi. */
function handleUnauthorized() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
        /* localStorage yopiq bo'lishi mumkin */
    }
    if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
    }
}

/**
 * 402 — obuna muddati tugagan. Foydalanuvchi tarif tanlash sahifasiga
 * yuboriladi: u yerdagi so'rovlar backendda 402 bermaydi.
 */
function handlePaymentRequired() {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/billing')) {
        window.location.href = '/billing';
    }
}

type QueryValue = string | number | boolean | undefined | null;

export function buildQuery(params?: Record<string, QueryValue>): string {
    if (!params) return '';
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') continue;
        search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** FormData yuborilganda Content-Type brauzer tomonidan qo'yiladi. */
    formData?: FormData;
    /** Login endpointlari uchun token shart emas. */
    skipAuth?: boolean;
}

export async function request<T>(
    path: string,
    { method = 'GET', body, formData, skipAuth }: RequestOptions = {},
): Promise<T> {
    const headers: Record<string, string> = {};

    if (!skipAuth) {
        const token = readToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body:
                formData ??
                (body !== undefined ? JSON.stringify(body) : undefined),
        });
    } catch {
        throw new ApiError(0, 'Network request failed', {
            key: 'error.network',
        });
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = null;
        }
    }

    if (!response.ok) {
        if (response.status === 401 && !skipAuth) handleUnauthorized();
        if (response.status === 402) handlePaymentRequired();

        const error = payload as ErrorResponse | null;

        if (error?.message) {
            throw new ApiError(response.status, error.message);
        }

        throw new ApiError(
            response.status,
            `Request failed (${response.status})`,
            {
                key: 'error.requestFailed',
                values: { status: response.status },
            },
        );
    }

    return payload as T;
}

/** Yuklangan fayl uchun to'liq URL. Backend nisbiy `/uploads/...` qaytaradi. */
export function fileUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${FILES_URL}${url}`;
}
