'use client';

import { useDemoPrivacy } from '@/hooks/use-demo-privacy';
import { cn } from '@/utils/cn';
import { formatPhone } from '@/utils/format';

export function PhoneLink({
    phone,
    className,
}: {
    phone: string | null | undefined;
    className?: string;
}) {
    const { isPrivacyOn } = useDemoPrivacy();
    if (!phone) return <span>—</span>;
    const formatted = formatPhone(phone, { mask: isPrivacyOn });
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    return (
        <a
            href={isPrivacyOn ? undefined : `tel:${cleanPhone}`}
            className={cn(
                // Raqam hech qachon ikki qatorga bo'linmaydi.
                'whitespace-nowrap tabular-nums',
                isPrivacyOn
                    ? 'cursor-default text-text-secondary select-none'
                    : 'hover:text-brand-accent hover:underline',
                className,
            )}
            onClick={(e) => {
                if (isPrivacyOn) e.preventDefault();
                e.stopPropagation();
            }}
            title={isPrivacyOn ? 'Maxfiylik rejimi: raqam yashirilgan' : undefined}
        >
            {formatted}
        </a>
    );
}
