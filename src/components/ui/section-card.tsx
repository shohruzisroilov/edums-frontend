import type { ReactNode } from 'react';

/** Sarlavhali karta — sozlamalar va hisobot sahifalaridagi bo'limlar uchun. */
export function SectionCard({
    title,
    actions,
    children,
}: {
    title: string;
    /** Sarlavha o'ng tomonidagi tugma yoki filtr. */
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-6'>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                <h2 className='text-text-primary font-display text-base font-semibold'>
                    {title}
                </h2>
                {actions}
            </div>
            {children}
        </div>
    );
}
