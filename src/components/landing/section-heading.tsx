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
