'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { fileUrl } from '@/services/api/client';
import { uploadFile } from '@/services/api/uploads';
import { useMutation } from '@tanstack/react-query';
import { Trash1, UploadCloud } from '@tailgrids/icons';
import { useRef, type ChangeEvent } from 'react';

/**
 * Rasm maydoni: fayl darhol /uploads ga yuboriladi va formaga faqat `id`
 * qaytadi — backend hamma joyda `*_id` kutadi.
 *
 * Bir xil mazmunli fayl ikkinchi marta saqlanmaydi (backend sha256 bilan
 * tekshiradi), shuning uchun bu yerda alohida dedup mantiqi yo'q.
 */
export function ImageUploadField({
    label,
    hint,
    value,
    previewUrl,
    onChange,
    disabled,
}: {
    label: string;
    hint?: string;
    /** Yuklangan fayl id'si; null = rasm yo'q. */
    value: string | null;
    /** Backenddan kelgan nisbiy URL (mavjud yozuvni tahrirlashda). */
    previewUrl: string | null;
    onChange: (id: string | null, url: string | null) => void;
    disabled?: boolean;
}) {
    const t = useT();
    const toastError = useApiErrorToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadFile(file),
        onSuccess: (upload) => onChange(upload.id, upload.url),
        onError: (error) => toastError(error),
    });

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Bir xil faylni qayta tanlash uchun input qiymati tozalanadi.
        event.target.value = '';
        if (file) mutation.mutate(file);
    }

    const preview = fileUrl(previewUrl);
    const busy = mutation.isPending || disabled;

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-text-primary text-sm font-medium'>
                {label}
            </span>

            <div className='flex items-center gap-3'>
                <div className='border-card-border bg-background-gray-primary text-icon-tertiary flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border'>
                    {preview ? (
                        // Yuklangan fayl istalgan o'lchamda bo'lishi mumkin,
                        // shuning uchun next/image emas, oddiy <img>.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt=''
                            className='size-full object-cover'
                        />
                    ) : (
                        <UploadCloud className='size-5' aria-hidden='true' />
                    )}
                </div>

                <div className='flex flex-wrap gap-2'>
                    <Button
                        appearance='outline'
                        size='md'
                        isDisabled={busy}
                        onPress={() => inputRef.current?.click()}
                    >
                        {mutation.isPending
                            ? t('uploads.uploading')
                            : t('uploads.selectFiles')}
                    </Button>

                    {value && (
                        <Button
                            variant='danger'
                            appearance='outline'
                            size='md'
                            iconOnly
                            aria-label={t('common.delete')}
                            isDisabled={busy}
                            onPress={() => onChange(null, null)}
                        >
                            <Trash1 />
                        </Button>
                    )}
                </div>

                {/* Backend faqat shu to'rt turdagi rasmni qabul qiladi
                    (upload.config.ts) — boshqasini tanlash 400 berardi. */}
                <input
                    ref={inputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/gif'
                    className='sr-only'
                    tabIndex={-1}
                    aria-label={label}
                    onChange={handleChange}
                />
            </div>

            {hint && <p className='text-text-tertiary text-xs'>{hint}</p>}
        </div>
    );
}
