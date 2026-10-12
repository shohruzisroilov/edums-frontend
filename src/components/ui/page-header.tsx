import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

const layoutByBreakpoint: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'sm:flex-row sm:items-start sm:justify-between sm:gap-4',
    md: 'md:flex-row md:items-start md:justify-between md:gap-4',
    lg: 'lg:flex-row lg:items-start lg:justify-between lg:gap-4',
    xl: 'xl:flex-row xl:items-start xl:justify-between xl:gap-4',
};

const actionsBreakpoint: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'sm:w-auto sm:shrink-0',
    md: 'md:w-auto md:shrink-0',
    lg: 'lg:w-auto lg:shrink-0',
    xl: 'xl:w-auto xl:shrink-0',
};

const hideOnDesktopClass: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
};

const hideOnMobileClass: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'hidden sm:flex',
    md: 'hidden md:flex',
    lg: 'hidden lg:flex',
    xl: 'hidden xl:flex',
};

/**
 * Sahifa sarlavhasi. Yozuvlar soni sarlavha yonidagi belgida turadi —
 * "nechta yozuv bor" degan savol ro'yxat sahifasida birinchi bo'lib
 * tug'iladi, uni pastdagi sahifalash qatorigacha kutish shart emas.
 */
export function PageHeader({
    title,
    description,
    count,
    actions,
    className,
    breakpoint = 'lg',
    mobileActionsPosition = 'bottom',
}: {
    title: string;
    /** Matn yoki qisqa qator (masalan, filial · holat belgisi). */
    description?: ReactNode;
    count?: ReactNode;
    actions?: ReactNode;
    className?: string;
    breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
    /** Telefonda amallar sarlavha qatorida ('top') yoki tavsif ostida ('bottom') turishi */
    mobileActionsPosition?: 'bottom' | 'top';
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-6 sm:pb-5',
                layoutByBreakpoint[breakpoint],
                className,
            )}
        >
            <div className='min-w-0 flex-1'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                        <h1 className='text-text-primary font-display text-xl leading-tight font-semibold tracking-[-0.015em] sm:text-2xl'>
                            {title}
                        </h1>
                        {count !== undefined && (
                            <span className='border-card-border bg-background-gray-primary text-text-tertiary shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums'>
                                {count}
                            </span>
                        )}
                    </div>
                    {actions && mobileActionsPosition === 'top' && (
                        <div
                            className={cn(
                                'flex items-center gap-2 shrink-0',
                                hideOnDesktopClass[breakpoint],
                            )}
                        >
                            {actions}
                        </div>
                    )}
                </div>
                {description && (
                    <div className='text-text-tertiary mt-1 max-w-3xl text-xs leading-relaxed sm:text-sm'>
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div
                    className={cn(
                        'w-full flex-wrap items-center gap-2',
                        mobileActionsPosition === 'top'
                            ? hideOnMobileClass[breakpoint]
                            : 'flex',
                        actionsBreakpoint[breakpoint],
                    )}
                >
                    {actions}
                </div>
            )}
        </div>
    );
}
