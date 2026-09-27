'use client';

import { QuestionMarkCircle } from '@tailgrids/icons';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function HelpTooltip({
    content,
    className,
}: {
    content: string;
    className?: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <span className={cn('relative inline-flex items-center ml-1', className)}>
            <button
                type='button'
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVisible(!visible);
                }}
                className='text-text-tertiary hover:text-brand-accent focus:text-brand-accent focus:outline-none transition-colors'
                aria-label='Ma’lumot'
            >
                <QuestionMarkCircle className='size-4' />
            </button>
            {visible && (
                <div
                    role='tooltip'
                    className='border-card-border bg-card-surface-area text-text-primary absolute bottom-full left-1/2 z-50 mb-1.5 w-64 -translate-x-1/2 rounded-lg border p-2.5 text-xs font-normal shadow-lg transition-all'
                >
                    {content}
                </div>
            )}
        </span>
    );
}
