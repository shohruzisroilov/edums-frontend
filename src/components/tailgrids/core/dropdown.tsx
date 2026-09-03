import { cn } from '@/utils/cn';
import type { ComponentProps } from 'react';
import {
    Button,
    type ButtonProps,
    Header,
    Menu,
    MenuItem,
    type MenuItemProps,
    MenuTrigger,
    type MenuTriggerProps,
    Popover,
    type PopoverProps,
    Separator,
} from 'react-aria-components';

export function DropdownMenu(props: MenuTriggerProps) {
    return <MenuTrigger {...props} />;
}

export function DropdownMenuTrigger({ className, ...props }: ButtonProps) {
    return <Button className={cn('outline-none', className)} {...props} />;
}

type DropdownContentProps = PopoverProps;

export function DropdownMenuContent({
    children,
    className,
    ...props
}: DropdownContentProps) {
    return (
        <Popover {...props}>
            <Menu
                className={cn(
                    'border-card-border bg-background-white-secondary min-w-40 overflow-clip rounded-xl border shadow-md outline-hidden',
                    className,
                )}
            >
                {children}
            </Menu>
        </Popover>
    );
}

type DropdownMenuItemProps = MenuItemProps;

export function DropdownMenuItem({
    className,
    ...props
}: DropdownMenuItemProps) {
    return (
        <MenuItem
            {...props}
            className={cn(
                'group text-text-50 hover:bg-background-gray-secondary_alt focus:bg-background-gray-secondary_alt focus:text-title-50 flex w-full cursor-default items-center gap-3 rounded-md px-1.5 py-1 text-sm outline-hidden',
                className,
            )}
        />
    );
}

export function DropdownMenuLabel({
    className,
    ...props
}: ComponentProps<'header'>) {
    return <Header className={cn('px-3 py-2', className)} {...props} />;
}

export function DropdownMenuSeparator({
    className,
    ...props
}: ComponentProps<'hr'>) {
    return (
        <Separator
            className={cn(
                'bg-border-secondary-alt h-px border-none',
                className,
            )}
            {...props}
        />
    );
}
