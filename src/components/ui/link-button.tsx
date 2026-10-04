import { cn } from '@/utils/cn';
import Link from 'next/link';
import type { ReactNode } from 'react';

/*
 * `Button` (tailgrids/core) bilan bir xil ko'rinish — o'sha tokenlar va
 * o'lchamlar. Alohida komponent, chunki core primitivlari o'zgartirilmaydi.
 */
const BASE =
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition outline-none focus-visible:ring-4 [&>svg]:size-5 [&>svg]:shrink-0';

const APPEARANCE = {
    fill: 'h-9 bg-button-primary-background text-button-primary-text hover:bg-button-primary-hover-background focus-visible:ring-button-primary-focus-ring',
    outline:
        'h-9.5 border border-button-primary-outline-stroke bg-button-primary-outline-background text-button-primary-outline-text hover:bg-button-primary-outline-hover-background hover:text-button-primary-outline-hover-text focus-visible:ring-button-outline-focus-ring',
    ghost: 'h-9 text-button-primary-outline-text hover:bg-button-primary-outline-hover-background hover:text-button-primary-outline-hover-text focus-visible:ring-button-outline-focus-ring',
};

/**
 * Tugma ko'rinishidagi havola — boshqa sahifaga olib boradigan amal uchun
 * (bo'sh holatdagi "qo'shish", dashboard qadamlari). Tugma emas, chunki
 * yangi oynada ochish va manzilni ko'rish ishlashi kerak.
 */
export function LinkButton({
    href,
    appearance = 'outline',
    className,
    title,
    children,
}: {
    href: string;
    appearance?: keyof typeof APPEARANCE;
    className?: string;
    /** Yozuvi yashiringan (faqat ikonka) holat uchun tooltip. */
    title?: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            title={title}
            className={cn(BASE, APPEARANCE[appearance], className)}
        >
            {children}
        </Link>
    );
}
