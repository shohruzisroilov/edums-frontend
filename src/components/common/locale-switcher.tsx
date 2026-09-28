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
import { Check } from '@tailgrids/icons';

export function LocaleSwitcher() {
    const { locale, setLocale, t } = useLocale();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('locale.change')}
                className='border-card-border bg-card-background text-text-primary hover:bg-background-gray-secondary flex h-8 min-w-9 shrink-0 items-center justify-center rounded-lg border px-2 text-xs font-medium shadow-xs transition-colors sm:h-10 sm:min-w-12 sm:px-3 sm:text-sm'
            >
                {LOCALE_SHORT[locale]}
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
