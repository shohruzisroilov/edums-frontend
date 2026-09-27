type IconProps = React.SVGProps<SVGSVGElement>;

const LogoMark = ({
    idPrefix,
    isDark = false,
    isWhite = false,
}: {
    idPrefix: string;
    isDark?: boolean;
    isWhite?: boolean;
}) => {
    let leftFaceColor = isDark ? '#3B82F6' : '#0038B8';
    let rightFaceColor = isDark ? '#38BDF8' : '#0088FF';
    let capColor = isDark ? '#60A5FA' : '#0055FE';
    let strokeColor = isDark ? '#93C5FD' : '#0038B8';
    let undersideOpacity = '0.3';

    if (isWhite) {
        leftFaceColor = '#FFFFFF';
        rightFaceColor = 'rgba(255, 255, 255, 0.8)';
        capColor = '#FFFFFF';
        strokeColor = '#FFFFFF';
        undersideOpacity = '0.35';
    }

    return (
        <g id={`${idPrefix}_mark`}>
            {/* Graduation Cap Top Diamond */}
            <path
                d='M 16 2 L 28.5 7 L 16 12 L 3.5 7 Z'
                fill={capColor}
            />
            {/* Cap Underside Shadow/Band */}
            <path
                d='M 7.5 8.8 L 16 12 L 24.5 8.8 L 27 9.8 L 16 13.8 L 5 9.8 Z'
                fill={leftFaceColor}
                opacity={undersideOpacity}
            />
            {/* Tassel */}
            <path
                d='M 25.5 8.2 L 26.5 13.5'
                stroke={strokeColor}
                strokeWidth='1.2'
                strokeLinecap='round'
            />
            <circle
                cx='26.5'
                cy='14.8'
                r='1.2'
                fill={strokeColor}
            />

            {/* Left 3D Face - "E" Shape */}
            <path
                d='M 4 10.8 L 15 15.2 L 15 17.2 L 6.5 13.8 L 6.5 16.2 L 15 19.6 L 15 21.6 L 6.5 18.2 L 6.5 20.6 L 15 24 L 15 28.2 L 4 23.8 Z'
                fill={leftFaceColor}
            />

            {/* Right 3D Face - "M" / Arch Shape */}
            <path
                d='M 17 15.2 L 28 10.8 L 28 23.8 L 24.8 25.1 L 24.8 20.8 C 24.8 19 20.2 20.8 20.2 22.6 L 20.2 26.9 L 17 28.2 Z'
                fill={rightFaceColor}
            />
        </g>
    );
};

export const Logo = ({ isDark = false, isWhite = false, ...props }: IconProps & { isDark?: boolean; isWhite?: boolean }) => {
    return (
        <svg
            width={38}
            height={38}
            viewBox='0 0 32 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <LogoMark idPrefix='logo_collapsed' isDark={isDark} isWhite={isWhite} />
        </svg>
    );
};

export const LogoWithText = (props: IconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={155}
            height={38}
            viewBox='0 0 155 38'
            fill='none'
            {...props}
        >
            <g transform='scale(1.18)'>
                <LogoMark idPrefix='logo_with_text' />
            </g>
            <text
                x={44}
                y={27}
                fontSize={23}
                fontWeight={900}
                fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                letterSpacing={0.2}
            >
                <tspan fill='#0038B8'>EDU </tspan>
                <tspan fill='#0088FF'>MS</tspan>
            </text>
        </svg>
    );
};

export const LogoWithTextDark = (props: IconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={155}
            height={38}
            viewBox='0 0 155 38'
            fill='none'
            {...props}
        >
            <g transform='scale(1.18)'>
                <LogoMark idPrefix='logo_with_text_dark' isWhite />
            </g>
            <text
                x={44}
                y={27}
                fontSize={23}
                fontWeight={900}
                fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                letterSpacing={0.2}
            >
                <tspan fill='#FFFFFF'>EDU </tspan>
                <tspan fill='#38BDF8'>MS</tspan>
            </text>
        </svg>
    );
};
