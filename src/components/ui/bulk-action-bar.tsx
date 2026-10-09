'use client';

import { useT } from '@/i18n/provider';
import { cn } from '@/utils/cn';
import { type ReactNode } from 'react';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    children?: ReactNode;
    className?: string;
}

/**
 * Jadvallarda bir nechta qator tanlanganda ekranning pastki qismida
 * suzib chiquvchi zamonaviy ommaviy amallar paneli (Bulk Actions Bar).
 */
export function BulkActionBar({
    selectedCount,
    onClearSelection,
    children,
    className,
}: BulkActionBarProps) {
    const t = useT();

    if (selectedCount === 0) return null;

    return (
        <div className='pointer-events-none fixed right-0 bottom-20 left-0 z-40 flex justify-center px-4 md:bottom-6'>
            <div
                role='region'
                aria-live='polite'
                aria-label={t('common.selected')}
                className={cn(
                    'border-card-border bg-card-surface-area/95 supports-backdrop-filter:bg-card-surface-area/85 animate-in fade-in slide-in-from-bottom-5 pointer-events-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2 shadow-2xl backdrop-blur-md transition-all duration-200 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-2.5',
                    className,
                )}
            >
                <div className='flex items-center gap-2.5'>
                    <span className='bg-brand-accent/15 text-brand-accent flex size-7 items-center justify-center rounded-lg text-xs font-bold'>
                        {selectedCount}
                    </span>
                    <span className='text-text-primary text-xs font-medium sm:text-sm'>
                        {selectedCount} {t('common.selected').toLowerCase()}
                    </span>
                    <button
                        type='button'
                        onClick={onClearSelection}
                        className='text-text-tertiary hover:text-text-primary ml-1 text-xs underline-offset-4 transition-colors hover:underline'
                    >
                        {t('common.cancel')}
                    </button>
                </div>

                <div className='flex items-center gap-2'>{children}</div>
            </div>
        </div>
    );
}
