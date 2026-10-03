'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { useT } from '@/i18n/provider';
import { Funnel1, Close } from '@tailgrids/icons';
import { cn } from '@/utils/cn';
import { useState, type ReactNode } from 'react';

interface MobileFilterSheetProps {
    /** Qancha filtr faolligi (badge uchun) */
    activeCount?: number;
    /** Filtr ichidagi select va kiritish maydonlari */
    children: ReactNode;
    /** Barcha filtrlarni tozalash funksiyasi */
    onClear?: () => void;
}

/**
 * Tanlangan filtrlarni bir bosishda tozalaydi — faqat biror filtr faol
 * bo'lsa ko'rinadi. Har bir filtr uchun alohida "×" belgisi o'rniga bitta
 * tugma: filtr qatori desktopda bir qatorda qoladi.
 */
export function ClearFiltersButton({
    activeCount,
    onClear,
    className,
}: {
    activeCount: number;
    onClear: () => void;
    className?: string;
}) {
    const t = useT();

    if (activeCount === 0) return null;

    return (
        <Button
            appearance='outline'
            size='md'
            onPress={onClear}
            aria-label={t('filters.reset')}
            className={cn('shrink-0', className)}
        >
            <Close className='size-4' />
            {t('filters.clear')}
        </Button>
    );
}

/**
 * Telefonda filtrlar oynada ochiladi; desktopda filtrlar sahifaning o'zida
 * turadi, bu komponent esa qator oxiriga "Filtrni tozalash" tugmasini qo'yadi.
 */
export function MobileFilterSheet({
    activeCount = 0,
    children,
    onClear,
}: MobileFilterSheetProps) {
    const t = useT();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                appearance={activeCount > 0 ? 'fill' : 'outline'}
                variant={activeCount > 0 ? 'primary' : undefined}
                size='md'
                onPress={() => setOpen(true)}
                className='shrink-0 sm:hidden'
            >
                <Funnel1 className='size-4' />
                <span>{t('filters.title')}</span>
                {activeCount > 0 && (
                    <span className='text-brand-accent bg-card-background ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums'>
                        {activeCount}
                    </span>
                )}
            </Button>

            {open && (
                <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                    title={t('filters.title')}
                    description={t('filters.description')}
                    footer={
                        <div className='flex w-full items-center justify-between gap-2'>
                            {onClear && (
                                <Button
                                    appearance='outline'
                                    variant='danger'
                                    size='md'
                                    onPress={() => {
                                        onClear();
                                        setOpen(false);
                                    }}
                                >
                                    {t('filters.clear')}
                                </Button>
                            )}
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                className='flex-1'
                                onPress={() => setOpen(false)}
                            >
                                {t('filters.apply')}
                            </Button>
                        </div>
                    }
                >
                    <div className='flex flex-col gap-4 py-2'>{children}</div>
                </Modal>
            )}

            {onClear && (
                <ClearFiltersButton
                    activeCount={activeCount}
                    onClear={onClear}
                    className='hidden sm:order-last sm:inline-flex'
                />
            )}
        </>
    );
}
