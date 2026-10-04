'use client';

import { cn } from '@/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isPathActive } from './utils';

export default function NavItem({
    icon,
    label,
    href,
    collapsed,
    onItemClick,
}: {
    icon: ReactNode;
    label: string;
    href: string;
    collapsed?: boolean;
    onItemClick?: () => void;
}) {
    const pathname = usePathname();
    const isActive = isPathActive(href, pathname);

    // Yig'ilgan holatda faqat ikonka ko'rinadi; nom `title` va `aria-label`da
    // qoladi, shuning uchun alohida tooltip kutubxonasi kerak emas.
    if (collapsed) {
        return (
            <div className='flex justify-center'>
                <Link
                    href={href}
                    onClick={onItemClick}
                    title={label}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                        'focus-visible:ring-input-primary-focus-border/30 flex items-center justify-center rounded-lg px-3 py-2.5 outline-none focus-visible:ring-4',
                        isActive
                            ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-icon-primary'
                            : 'text-icon-tertiary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-icon-primary transition-colors duration-200',
                    )}
                >
                    {icon}
                </Link>
            </div>
        );
    }

    return (
        <Link
            href={href}
            onClick={onItemClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'focus-visible:ring-input-primary-focus-border/30 relative flex w-full items-center gap-3 rounded-lg py-2 pr-3 pl-4 text-sm transition-colors outline-none focus-visible:ring-4',
                isActive
                    ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary font-semibold'
                    : 'text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary font-medium',
            )}
        >
            {/*
                Faol bo'limni brend rangidagi chap chiziq belgilaydi. Fon
                farqi o'zi juda kuchsiz edi; chiziq esa bir qarashda ko'rinadi
                va rangdan tashqari joylashuv orqali ham ajralib turadi.
            */}
            {isActive && (
                <span
                    aria-hidden='true'
                    className='bg-brand-accent absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full'
                />
            )}
            <span
                className={
                    isActive ? 'text-brand-accent' : 'text-icon-tertiary'
                }
            >
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
