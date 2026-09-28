'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import { useLocale } from '@/i18n/provider';
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from '@/i18n/locales';
import { cn } from '@/utils/cn';
import { Check, Globe2 } from '@tailgrids/icons';

export function LocaleSwitcher() {
    const { locale, setLocale, t } = useLocale();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('locale.change')}
                className='border-card-border bg-card-background text-icon-primary hover:bg-background-gray-secondary focus-visible:border-input-primary-focus-border focus-visible:ring-input-primary-focus-border/20 flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-colors outline-none focus-visible:ring-4 sm:h-10 sm:w-auto sm:gap-2 sm:px-3'
            >
                <Globe2 className='text-icon-primary size-5 shrink-0' />
                <span className='text-text-primary hidden text-xs font-semibold uppercase sm:inline sm:text-sm'>
                    {LOCALE_SHORT[locale]}
                </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='min-w-44'>
                {LOCALES.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onAction={() => setLocale(option)}
                    >
                        <span className='flex w-full items-center justify-between gap-3 px-1.5 py-1'>
                            <span
                                className={cn(
                                    option === locale && 'font-medium',
                                )}
                            >
                                {LOCALE_LABELS[option]}
                            </span>
                            {option === locale && (
                                <Check className='text-brand-accent size-4' />
                            )}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
