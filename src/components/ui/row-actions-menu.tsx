'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import { MenuMeatballs1 } from '@tailgrids/icons';
import { Fragment, type ReactNode } from 'react';

export interface RowAction {
    label: string;
    icon?: ReactNode;
    /** Boshqa sahifaga olib boradi (yangi oynada ochish ishlaydi). */
    href?: string;
    onAction?: () => void;
    /** O'chirish kabi qaytarib bo'lmaydigan amal — ro'yxat oxirida, qizil. */
    danger?: boolean;
}

/**
 * Jadval qatoridagi kam ishlatiladigan amallar uchun "⋯" menyu. Qatorda
 * faqat asosiy amal tugma bo'lib qoladi — to'rtta ikonka tugma ustunni
 * kengaytirib, jadvalni noutbuk ekranidan chiqarib yuborardi.
 */
export function RowActionsMenu({
    actions,
    label,
    triggerClassName,
}: {
    actions: RowAction[];
    /** Ekran o'quvchi uchun: kimning amallari (masalan, o'quvchi ismi). */
    label: string;
    triggerClassName?: string;
}) {
    const t = useT();

    if (actions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`${t('common.actions')}: ${label}`}
                className={cn(
                    'border-button-primary-outline-stroke bg-button-primary-outline-background text-button-primary-outline-text hover:bg-button-primary-outline-hover-background hover:text-button-primary-outline-hover-text data-[focus-visible]:ring-button-outline-focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition data-[focus-visible]:ring-4',
                    triggerClassName,
                )}
            >
                <MenuMeatballs1 className='size-4' />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                placement='bottom end'
                className='min-w-44 p-1'
            >
                {actions.map((action, index) => (
                    <Fragment key={action.label}>
                        {action.danger && index > 0 && (
                            <DropdownMenuSeparator className='my-1' />
                        )}
                        <DropdownMenuItem
                            {...(action.href ? { href: action.href } : {})}
                            onAction={action.onAction}
                            className={cn(
                                'px-2.5 py-2 [&_svg]:size-4 [&_svg]:shrink-0',
                                action.danger &&
                                    'text-badge-error-text focus:text-badge-error-text',
                            )}
                        >
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
