'use client';

import { useT } from '@/i18n/provider';
import { Gallery } from '@tailgrids/icons';
import Image from 'next/image';
import { LANDING_IMAGES, type LandingImage } from './images';

/**
 * Skrinshot uchun brauzer oynasiga o'xshash ramka. Rasm hali qo'yilmagan
 * bo'lsa (`images.ts` da `null`), o'rnida qaysi rasm kerakligi yoziladi.
 */
export function ImageSlot({
    image,
    label,
    sizes = '(min-width: 1024px) 50vw, 100vw',
    priority = false,
}: {
    image: LandingImage;
    /** Rasm nimani ko'rsatishi — alt matni va bo'sh joydagi yozuv. */
    label: string;
    sizes?: string;
    priority?: boolean;
}) {
    const t = useT();
    const src = LANDING_IMAGES[image];

    return (
        <div className='border-card-border bg-card-background overflow-hidden rounded-2xl border shadow-xl shadow-black/5'>
            <div
                aria-hidden='true'
                className='border-card-border flex items-center gap-1.5 border-b px-4 py-3'
            >
                <span className='bg-card-border size-2.5 rounded-full' />
                <span className='bg-card-border size-2.5 rounded-full' />
                <span className='bg-card-border size-2.5 rounded-full' />
            </div>
            <div className='relative aspect-video'>
                {src ? (
                    <Image
                        src={src}
                        alt={label}
                        fill
                        sizes={sizes}
                        priority={priority}
                        className='object-contain'
                    />
                ) : (
                    <div className='border-card-border text-text-tertiary absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center'>
                        <Gallery className='size-8' />
                        <p className='text-text-secondary text-sm font-medium'>
                            {t('landing.imageSlot')}
                        </p>
                        <p className='text-xs'>{label} · 1600 × 900</p>
                    </div>
                )}
            </div>
        </div>
    );
}
