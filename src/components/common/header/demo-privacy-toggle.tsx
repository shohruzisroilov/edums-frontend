'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useDemoPrivacy } from '@/hooks/use-demo-privacy';
import { Eye, EyeDisabled } from '@tailgrids/icons';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * YouTube videolari olish yoki taqdimotlar paytida shaxsiy telefon raqamlarni
 * bir marta bosish orqali niqoblash (maskalash) tugmasi.
 */
export default function DemoPrivacyToggle() {
    const { isPrivacyOn, toggle } = useDemoPrivacy();
    const isMounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    if (!isMounted) {
        return <span className='size-10' />;
    }

    const tooltip = isPrivacyOn
        ? "🎥 YouTube rejimi FAOL: barcha raqamlar yashirilgan (O'chirish uchun bosing)"
        : '🎥 YouTube rejimi: video olishda raqamlarni yashirish';

    return (
        <span title={tooltip} className='inline-flex'>
            <Button
                iconOnly
                appearance='outline'
                aria-label={
                    isPrivacyOn
                        ? "Maxfiylik rejimi yoqilgan (Raqamlar yashirilgan). O'chirish uchun bosing"
                        : 'YouTube / Demo maxfiylik rejimini yoqish (Raqamlarni yashirish)'
                }
                onPress={() => toggle()}
                className={`size-10 rounded-lg border shadow-xs transition-all outline-none focus-visible:ring-4 ${
                    isPrivacyOn
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/20 focus-visible:ring-amber-500/30 dark:text-amber-400'
                        : 'border-card-border bg-card-background text-icon-primary hover:bg-background-gray-secondary focus-visible:border-input-primary-focus-border focus-visible:ring-input-primary-focus-border/20'
                }`}
            >
                {isPrivacyOn ? (
                    <EyeDisabled className='size-5' />
                ) : (
                    <Eye className='size-5' />
                )}
            </Button>
        </span>
    );
}
