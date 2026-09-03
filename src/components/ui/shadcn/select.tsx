'use client';

/**
 * shadcn/ui Select (Radix asosida), loyihaning dizayn tokenlariga moslangan.
 *
 * shadcn CLI ishlatilmadi: `shadcn init` globals.css ga o'zining token
 * to'plamini (--background, --foreground, …) yozadi va bu yerdagi iliq
 * palitrani buzardi. shadcn falsafasiga ko'ra komponent kodi loyihaga
 * ko'chiriladi va shu loyihaga moslanadi — shu yo'l tutildi.
 *
 * Manba: https://ui.shadcn.com/docs/components/select
 */

import { cn } from '@/utils/cn';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from '@tailgrids/icons';
import type { ComponentProps } from 'react';

function Select({ ...props }: ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectValue({
    ...props
}: ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

function SelectTrigger({
    className,
    children,
    invalid,
    ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & { invalid?: boolean }) {
    return (
        <SelectPrimitive.Trigger
            data-slot='select-trigger'
            aria-invalid={invalid || undefined}
            className={cn(
                'border-card-border bg-input-background text-title-50 flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-4 text-sm transition outline-none',
                'focus:border-input-primary-focus-border focus:ring-input-primary-focus-border/20 focus:ring-4',
                'disabled:cursor-not-allowed disabled:opacity-60',
                // Tanlanmagan holatda ko'rsatkich matni xira bo'ladi — bu
                // placeholder ekanini bildiradi.
                'data-[placeholder]:text-input-placeholder-text',
                invalid &&
                    'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className='text-text-tertiary size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = 'popper',
    ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot='select-content'
                position={position}
                sideOffset={6}
                className={cn(
                    'border-card-border bg-background-white-secondary text-title-50 relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-xl border shadow-lg',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                    position === 'popper' &&
                        'w-full min-w-[var(--radix-select-trigger-width)]',
                    className,
                )}
                {...props}
            >
                <SelectPrimitive.Viewport className='max-h-72 scrollbar-thin overflow-y-auto p-1.5'>
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectItem({
    className,
    children,
    ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot='select-item'
            className={cn(
                'text-text-secondary relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-3 text-sm outline-none select-none',
                // Klaviatura va sichqoncha bitta ko'rinishga ega bo'lsin —
                // Radix ikkalasi uchun ham `highlighted` beradi.
                'data-[highlighted]:bg-background-gray-primary data-[highlighted]:text-text-primary',
                'data-[state=checked]:text-text-primary data-[state=checked]:font-medium',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            <span className='absolute right-2.5 flex size-4 items-center justify-center'>
                <SelectPrimitive.ItemIndicator>
                    <Check className='text-brand-accent size-4' />
                </SelectPrimitive.ItemIndicator>
            </span>
        </SelectPrimitive.Item>
    );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
