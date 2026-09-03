'use client';

import { cn } from '@/utils/cn';
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import * as React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const sizeClasses: Record<AvatarSize, string> = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-14',
    xxl: 'size-16',
};

const fontWeightClasses: Record<AvatarSize, string> = {
    xs: 'font-medium',
    sm: 'font-medium',
    md: 'font-semibold',
    lg: 'font-semibold',
    xl: 'font-semibold',
    xxl: 'font-semibold',
};

export interface AvatarProps extends AvatarPrimitive.Root.Props {
    size?: AvatarSize;
}

export function Avatar({
    className,
    size = 'md',
    children,
    ...props
}: AvatarProps) {
    return (
        <AvatarPrimitive.Root
            data-slot='avatar'
            data-size={size}
            className={cn(
                'group/avatar relative flex shrink-0 rounded-full select-none',
                sizeClasses[size],
                fontWeightClasses[size],
                className,
            )}
            {...props}
        >
            {children}
        </AvatarPrimitive.Root>
    );
}

export interface AvatarImageProps extends AvatarPrimitive.Image.Props {}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
    return (
        <AvatarPrimitive.Image
            data-slot='avatar-image'
            className={cn(
                'flex aspect-square size-full items-center rounded-full object-cover',
                className,
            )}
            {...props}
        />
    );
}

export interface AvatarFallbackProps extends AvatarPrimitive.Fallback.Props {}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
    return (
        <AvatarPrimitive.Fallback
            data-slot='avatar-fallback'
            className={cn(
                'bg-primary-100 text-primary-500 absolute inset-0 flex items-center justify-center rounded-full uppercase',
                className,
            )}
            {...props}
        />
    );
}
