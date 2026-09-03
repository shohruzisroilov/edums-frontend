export function SidebarExpandedIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={18}
            height={18}
            viewBox='0 0 18 18'
            fill='none'
        >
            <path
                d='M1.5 8.25C1.5 5.42157 1.5 4.00736 2.37868 3.12868C3.25736 2.25 4.67157 2.25 7.5 2.25H10.5C13.3284 2.25 14.7426 2.25 15.6213 3.12868C16.5 4.00736 16.5 5.42157 16.5 8.25V9.75C16.5 12.5784 16.5 13.9926 15.6213 14.8713C14.7426 15.75 13.3284 15.75 10.5 15.75H7.5C4.67157 15.75 3.25736 15.75 2.37868 14.8713C1.5 13.9926 1.5 12.5784 1.5 9.75V8.25Z'
                stroke='currentColor'
                strokeWidth='1.5'
            />
            <path
                d='M4.125 7.5H8.625'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
            />
            <path
                d='M4.875 10.5H7.875'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
            />
            <path
                d='M11.25 15.75L11.25 2.25'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
            />
        </svg>
    );
}

export function CloseIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={18}
            height={18}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
        >
            <line x1='18' y1='6' x2='6' y2='18' />
            <line x1='6' y1='6' x2='18' y2='18' />
        </svg>
    );
}
