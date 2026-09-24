type IconProps = React.SVGProps<SVGSVGElement>;

export const Logo = (props: IconProps) => {
    return (
        <svg
            width={32}
            height={32}
            viewBox='0 0 32 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M17.938 29.454c-.94.94-2.547.273-2.547-1.056V18.07c0-1.19.461-2.332 1.287-3.188l4.884-5.061c.87-.901 2.309-.914 3.194-.029l4.394 4.395a2.87 2.87 0 010 4.058L17.938 29.454z'
                fill='url(#paint0_linear_24673_10523)'
            />
            <g filter='url(#filter0_i_24673_10523)'>
                <path
                    d='M13.511 2.546c.94-.94 2.548-.274 2.548 1.056V13.93c0 1.19-.462 2.332-1.288 3.188l-4.884 5.061c-.87.901-2.308.914-3.194.029L2.3 17.813a2.87 2.87 0 010-4.058L13.511 2.546z'
                    fill='#5750F1'
                />
            </g>
            <defs>
                <filter
                    id='filter0_i_24673_10523'
                    x={1.45703}
                    y={2.10645}
                    width={18.0453}
                    height={24.2008}
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood floodOpacity={0} result='BackgroundImageFix' />
                    <feBlend
                        in='SourceGraphic'
                        in2='BackgroundImageFix'
                        result='shape'
                    />
                    <feColorMatrix
                        in='SourceAlpha'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feOffset dx={3.44373} dy={3.44373} />
                    <feGaussianBlur stdDeviation={4.01769} />
                    <feComposite
                        in2='hardAlpha'
                        operator='arithmetic'
                        k2={-1}
                        k3={1}
                    />
                    <feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0' />
                    <feBlend
                        in2='shape'
                        result='effect1_innerShadow_24673_10523'
                    />
                </filter>
                <linearGradient
                    id='paint0_linear_24673_10523'
                    x1={-30.9928}
                    y1={-3.73067}
                    x2={24.107}
                    y2={26.402}
                    gradientUnits='userSpaceOnUse'
                >
                    <stop offset={0.512083} stopColor='#322E8B' />
                    <stop offset={1} stopColor='#5750F1' />
                </linearGradient>
            </defs>
        </svg>
    );
};

const LogoMark = ({ idPrefix }: { idPrefix: string }) => (
    <>
        <path
            d='M17.938 29.454c-.94.94-2.547.273-2.547-1.056V18.07c0-1.19.461-2.332 1.287-3.188l4.884-5.061c.87-.901 2.309-.914 3.194-.029l4.394 4.395a2.87 2.87 0 010 4.058L17.938 29.454z'
            fill={`url(#${idPrefix}_gradient)`}
        />
        <path
            d='M13.511 2.546c.94-.94 2.548-.274 2.548 1.056V13.93c0 1.19-.462 2.332-1.288 3.188l-4.884 5.061c-.87.901-2.308.914-3.194.029L2.3 17.813a2.87 2.87 0 010-4.058L13.511 2.546z'
            fill='#5750F1'
        />
        <defs>
            <linearGradient
                id={`${idPrefix}_gradient`}
                x1={-30.9928}
                y1={-3.73067}
                x2={24.107}
                y2={26.402}
                gradientUnits='userSpaceOnUse'
            >
                <stop offset={0.512083} stopColor='#322E8B' />
                <stop offset={1} stopColor='#5750F1' />
            </linearGradient>
        </defs>
    </>
);

export const LogoWithText = (props: IconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={124}
            height={32}
            viewBox='0 0 124 32'
            fill='none'
            {...props}
        >
            <LogoMark idPrefix='logo_with_text' />
            <text
                x={42}
                y={22.5}
                fontSize={19}
                fontWeight={700}
                letterSpacing={-0.3}
                fill='#27272A'
            >
                EDU MS
            </text>
        </svg>
    );
};

export const LogoWithTextDark = (props: IconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={124}
            height={32}
            viewBox='0 0 124 32'
            fill='none'
            {...props}
        >
            <LogoMark idPrefix='logo_with_text_dark' />
            <text
                x={42}
                y={22.5}
                fontSize={19}
                fontWeight={700}
                letterSpacing={-0.3}
                fill='#fff'
            >
                EDU MS
            </text>
        </svg>
    );
};
