'use client';

import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import { Close } from '@tailgrids/icons';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import {
    Button as AriaButton,
    type ButtonProps as AriaButtonProps,
    Dialog as AriaDialog,
    type DialogProps as AriaDialogProps,
    type DialogTriggerProps as AriaDialogTriggerProps,
    Heading,
    type HeadingProps,
    Modal,
    ModalOverlay,
    type ModalOverlayProps,
} from 'react-aria-components';

// Sheet (root)

export interface SheetProps extends AriaDialogTriggerProps {}

export interface SheetTriggerProps extends AriaButtonProps {}

export interface SheetOverlayProps extends ModalOverlayProps {
    className?: string;
    isDismissable?: boolean;
}

export function SheetOverlay({
    className,
    isDismissable = true,
    ...props
}: SheetOverlayProps) {
    return (
        <ModalOverlay
            isDismissable={isDismissable}
            className={cn(
                'fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm',
                'transition-opacity duration-300',
                'data-entering:opacity-0',
                'data-exiting:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

// Sheet Content

const sheetVariants = cva(
    'fixed z-50 transition-transform duration-300 ease-in-out outline-none data-entering:translate-x-0 data-entering:translate-y-0',
    {
        variants: {
            side: {
                right: 'inset-y-0 right-0 h-full data-entering:translate-x-full data-exiting:translate-x-full',
                left: 'inset-y-0 left-0 h-full data-entering:-translate-x-full data-exiting:-translate-x-full',
                top: 'inset-x-0 top-0 data-entering:-translate-y-full data-exiting:-translate-y-full',
                bottom: 'inset-x-0 bottom-0 data-entering:translate-y-full data-exiting:translate-y-full',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    },
);

const sheetDialogVariants = cva(
    'relative flex flex-col gap-4 bg-background-100 p-6 shadow-lg outline-none',
    {
        variants: {
            side: {
                right: 'h-full w-full min-w-xs border-l border-base-100 pr-4 sm:max-w-sm',
                left: 'h-full w-full min-w-xs border-r border-base-100 sm:max-w-sm',
                top: 'w-full border-b border-base-100',
                bottom: 'w-full border-t border-base-100',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    },
);

export interface SheetContentProps
    extends AriaDialogProps, VariantProps<typeof sheetVariants> {
    modalProps?: ComponentProps<typeof Modal>;
    showCloseButton?: boolean;
    className?: string;
}

export function SheetContent({
    children,
    className,
    side = 'right',
    modalProps,
    showCloseButton = true,
    ...props
}: SheetContentProps) {
    const t = useT();
    const { className: modalClassName, ...restModalProps } = modalProps || {};

    return (
        <Modal
            className={cn(sheetVariants({ side }), modalClassName)}
            {...restModalProps}
        >
            <AriaDialog
                className={cn(sheetDialogVariants({ side }), className)}
                {...props}
            >
                {({ close }) => (
                    <>
                        {typeof children === 'function'
                            ? children({ close })
                            : children}
                        {showCloseButton && (
                            <AriaButton
                                onPress={close}
                                aria-label={t('common.close')}
                                className={cn(
                                    'text-text-100 focus-visible:ring-primary-500 absolute top-4 right-4 flex size-7 items-center justify-center rounded-md opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 disabled:pointer-events-none [&>svg]:size-5',
                                    side === 'right' && 'sm:right-0',
                                )}
                            >
                                <Close />
                                <span className='sr-only'>
                                    {t('common.close')}
                                </span>
                            </AriaButton>
                        )}
                    </>
                )}
            </AriaDialog>
        </Modal>
    );
}

// Sheet Header

export interface SheetTitleProps extends HeadingProps {
    className?: string;
}

export function SheetTitle({ className, ...props }: SheetTitleProps) {
    return (
        <Heading
            slot='title'
            className={cn(
                'text-title-50 text-lg leading-none font-semibold',
                className,
            )}
            {...props}
        />
    );
}

// Sheet Description
