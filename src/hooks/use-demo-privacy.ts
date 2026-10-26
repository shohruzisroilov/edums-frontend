'use client';

import { useSyncExternalStore } from 'react';

export const DEMO_PRIVACY_STORAGE_KEY = 'edums_demo_privacy_mode';

function subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('storage', callback);
    window.addEventListener('edums-demo-privacy-change', callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener('edums-demo-privacy-change', callback);
    };
}

function getSnapshot(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(DEMO_PRIVACY_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function getServerSnapshot(): boolean {
    return false;
}

/**
 * YouTube videolari yoki taqdimotlar paytida shaxsiy ma'lumotlarni (telefon raqamlar)
 * avtomatik niqoblash (masking) uchun global reaktiv hook.
 */
export function useDemoPrivacy() {
    const isPrivacyOn = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const toggle = (force?: boolean) => {
        if (typeof window === 'undefined') return;
        const next = force !== undefined ? force : !getSnapshot();
        try {
            if (next) {
                window.localStorage.setItem(DEMO_PRIVACY_STORAGE_KEY, 'true');
            } else {
                window.localStorage.removeItem(DEMO_PRIVACY_STORAGE_KEY);
            }
            window.dispatchEvent(new CustomEvent('edums-demo-privacy-change'));
        } catch {
            // ignore
        }
    };

    return { isPrivacyOn, toggle };
}
