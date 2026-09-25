'use client';

import { useT } from '@/i18n/provider';
import { Check, Copy1 } from '@tailgrids/icons';
import { useState } from 'react';
import { toast } from 'sonner';

/** Nusxa olinadigan kod — foydalanuvchi boshqa joyga qo'yadigan namunalar uchun. */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
    const t = useT();
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success(t('common.copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('common.copyFailed'));
        }
    }

    return (
        <div className='border-card-surface-border bg-card-surface-area relative rounded-lg border'>
            <button
                type='button'
                onClick={copy}
                aria-label={
                    label ? `${t('common.copy')}: ${label}` : t('common.copy')
                }
                title={t('common.copy')}
                className='border-card-border bg-card-background text-text-secondary hover:text-text-primary absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md border transition'
            >
                {copied ? (
                    <Check className='size-4' />
                ) : (
                    <Copy1 className='size-4' />
                )}
            </button>
            <pre className='text-text-primary overflow-x-auto p-3 pr-12 font-mono text-xs leading-relaxed'>
                <code>{code}</code>
            </pre>
        </div>
    );
}
