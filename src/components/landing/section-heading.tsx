/** Landing bo'limi sarlavhasi: ixtiyoriy kichik yorliq, sarlavha va izoh. */
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
                <p className='text-brand-accent text-sm font-semibold'>
                    {eyebrow}
                </p>
            )}
            <h2 className='text-text-primary font-display mt-2 text-3xl leading-tight font-semibold sm:text-4xl'>
                {title}
            </h2>
            {text && <p className='text-text-secondary mt-4 text-lg'>{text}</p>}
        </div>
    );
}
