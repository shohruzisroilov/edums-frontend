'use client';

import { formatPhone } from '@/utils/format';
import { cn } from '@/utils/cn';

export function PhoneLink({
    phone,
    className,
}: {
    phone: string | null | undefined;
    className?: string;
}) {
    if (!phone) return <span>—</span>;
    const formatted = formatPhone(phone);
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    return (
        <a
            href={`tel:${cleanPhone}`}
            className={cn(
                'hover:text-brand-accent tabular-nums hover:underline',
                className,
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {formatted}
        </a>
    );
}
