/** Landing bo'limi sarlavhasi */
export function SectionHeading({
    eyebrow,
    title,
    text,
}: {
    eyebrow?: string;
    title: string;
    text?: string;
}) {
    return (
        <div className='mx-auto max-w-2xl text-center'>
            {eyebrow && (
                <div className='mb-4 inline-flex items-center gap-2'>
                    <div className='border-brand-500/20 bg-brand-500/8 text-brand-500 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide'>
                        {eyebrow}
                    </div>
                </div>
            )}
            <h2 className='text-text-primary font-display text-3xl leading-tight font-bold sm:text-4xl'>
                {title}
            </h2>
            {text && (
                <p className='text-text-secondary mx-auto mt-4 max-w-xl text-lg leading-relaxed'>
                    {text}
                </p>
            )}
        </div>
    );
}
