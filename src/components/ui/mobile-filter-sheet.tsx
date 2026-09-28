'use client';

import { Button } from '@/components/tailgrids/core/button';
import { Modal } from '@/components/ui/modal';
import { Funnel1, Close } from '@tailgrids/icons';
import { useState, type ReactNode } from 'react';

interface MobileFilterSheetProps {
    /** Qancha filtr faolligi (badge uchun) */
    activeCount?: number;
    /** Filtr ichidagi select va kiritish maydonlari */
    children: ReactNode;
    /** Barcha filtrlarni tozalash funksiyasi */
    onClear?: () => void;
    /** Faol filtr chiptalari (misol: [{ key: 'branch', label: 'Filial: Chilonzor', onRemove: ... }]) */
    activeChips?: { key: string; label: string; onRemove: () => void }[];
}

export function MobileFilterSheet({
    activeCount = 0,
    children,
    onClear,
    activeChips = [],
}: MobileFilterSheetProps) {
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
                <span>Filtrlar</span>
                {activeCount > 0 && (
                    <span className='text-brand-accent py-0.2 ml-1 rounded-full bg-white px-1.5 text-[11px] font-bold tabular-nums dark:bg-slate-950'>
                        {activeCount}
                    </span>
                )}
            </Button>

            {open && (
                <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                    title='Filtrlar'
                    description='Qidiruv va saralash mezonlarini tanlang'
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
                                    Tozalash
                                </Button>
                            )}
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                className='flex-1'
                                onPress={() => setOpen(false)}
                            >
                                Qo'llash
                            </Button>
                        </div>
                    }
                >
                    <div className='flex flex-col gap-4 py-2'>{children}</div>
                </Modal>
            )}

            {/* Faol filtrlar chip-chiziqlari (Mobil va Desktop uchun tezkor tozalash) */}
            {activeChips.length > 0 && (
                <div className='flex w-full items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
                    {activeChips.map((chip) => (
                        <span
                            key={chip.key}
                            className='border-card-border bg-card-surface-area text-text-primary flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium shadow-2xs'
                        >
                            {chip.label}
                            <button
                                type='button'
                                onClick={chip.onRemove}
                                className='text-text-tertiary hover:text-badge-error-text ml-0.5 rounded-full p-0.5 transition-colors'
                                aria-label='Filtrni o’chirish'
                            >
                                <Close className='size-3' />
                            </button>
                        </span>
                    ))}
                    {onClear && activeCount > 1 && (
                        <button
                            type='button'
                            onClick={onClear}
                            className='text-badge-error-text shrink-0 px-1 text-xs font-medium hover:underline'
                        >
                            Barchasini tozalash
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
