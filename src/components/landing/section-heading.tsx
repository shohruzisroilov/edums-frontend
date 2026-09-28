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
                <p className='text-brand-accent mb-2 text-sm font-semibold tracking-wider uppercase'>
                    {eyebrow}
                </p>
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
