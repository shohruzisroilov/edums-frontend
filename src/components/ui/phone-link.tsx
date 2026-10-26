'use client';

import { cn } from '@/utils/cn';
import { formatPhone } from '@/utils/format';

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
                // Raqam hech qachon ikki qatorga bo'linmaydi.
                'hover:text-brand-accent whitespace-nowrap tabular-nums hover:underline',
                className,
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {formatted}
        </a>
    );
}
