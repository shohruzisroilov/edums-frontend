'use client';

import { Button } from '@/components/tailgrids/core/button';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import { uploadFiles } from '@/services/api/uploads';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload1 } from '@tailgrids/icons';
import { useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';

/** Backend bir so'rovda maksimum 10 ta faylni qabul qiladi. */
const MAX_FILES = 10;

export function UploadButton() {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: (files: File[]) => uploadFiles(files),
        onSuccess: (results) => {
            queryClient.invalidateQueries({ queryKey: ['uploads'] });
            toast.success(t('uploads.uploaded', { count: results.length }));
            // Mazmuni bir xil fayl qayta saqlanmaydi — buni aytib qo'yamiz,
            // aks holda ro'yxatda yangi yozuv paydo bo'lmagani chalkashtiradi.
            if (results.some((item) => item.is_duplicate)) {
                toast.info(t('uploads.duplicate'));
            }
        },
        onError: (error) => toastError(error),
    });

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []).slice(0, MAX_FILES);
        event.target.value = '';
        if (files.length > 0) mutation.mutate(files);
    }

    return (
        <>
            <Button
                variant='primary'
                appearance='fill'
                size='md'
                isDisabled={mutation.isPending}
                onPress={() => inputRef.current?.click()}
            >
                <Upload1 />
                {mutation.isPending ? t('uploads.uploading') : t('uploads.new')}
            </Button>
            <input
                ref={inputRef}
                type='file'
                multiple
                className='sr-only'
                aria-label={t('uploads.selectFiles')}
                onChange={handleChange}
            />
        </>
    );
}
