'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RoleGuard } from '@/components/ui/role-guard';
import { SearchInput } from '@/components/ui/search-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT } from '@/i18n/provider';
import { fileUrl } from '@/services/api/client';
import { deleteUpload, listUploads } from '@/services/api/uploads';
import type { Upload } from '@/types/api';
import { ALL_ROLES } from '@/utils/access';
import { Copy1, Folder1, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { UploadButton } from './_components/upload-button';

/**
 * `mime_type` backendda aniq moslik bilan solishtiriladi ("image" hech narsa
 * topmaydi), shuning uchun filtrda to'liq turlar turadi.
 */
const MIME_FILTERS = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
];

export default function UploadsPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <UploadsView />
        </RoleGuard>
    );
}

function UploadsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDateTime, formatFileSize } = useFormat();

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ mime_type: '' });

    const [deleting, setDeleting] = useState<Upload | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['uploads', { search, ...filters, limit, offset }],
        queryFn: () =>
            listUploads({
                search: search || undefined,
                mime_type: filters.mime_type || undefined,
                limit,
                offset,
            }),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteUpload(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['uploads'] });
            toast.success(t('uploads.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    async function copyLink(upload: Upload) {
        const url = fileUrl(upload.url);
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            toast.success(t('uploads.linkCopied'));
        } catch {
            // Clipboard API HTTPS'siz kontekstda yoki ruxsatsiz ishlamaydi.
            toast.error(t('error.actionFailed'));
        }
    }

    return (
        <>
            <PageHeader
                title={t('uploads.title')}
                count={query.data?.count}
                description={t('uploads.subtitle')}
                actions={<UploadButton />}
            />

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('uploads.search')}
                />
                <div className='sm:w-52'>
                    <SelectInput
                        options={MIME_FILTERS.map((mime) => ({
                            value: mime,
                            label: mime,
                        }))}
                        placeholder={t('uploads.allTypes')}
                        value={filters.mime_type}
                        onValueChange={(next) => setFilter('mime_type', next)}
                    />
                </div>
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('uploads.empty')}
                            icon={<Folder1 className='size-5' />}
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('uploads.file')}
                                        </TableHead>
                                        <TableHead>
                                            {t('uploads.type')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('uploads.size')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.createdAt')}
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((upload) => (
                                        <TableRow key={upload.id}>
                                            <TableCell className='whitespace-normal'>
                                                <a
                                                    href={
                                                        fileUrl(upload.url) ??
                                                        '#'
                                                    }
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-brand-accent font-medium hover:underline'
                                                >
                                                    {upload.original_name}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                {upload.mime_type}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatFileSize(upload.size)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    upload.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'uploads.copyLink',
                                                        )}
                                                        onPress={() =>
                                                            void copyLink(
                                                                upload,
                                                            )
                                                        }
                                                    >
                                                        <Copy1 />
                                                    </Button>
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.delete',
                                                        )}
                                                        onPress={() =>
                                                            setDeleting(upload)
                                                        }
                                                    >
                                                        <Trash1 />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableRoot>

                            <PaginationBar
                                count={query.data.count}
                                limit={limit}
                                offset={offset}
                                onLimitChange={setLimit}
                                onOffsetChange={setOffset}
                            />
                        </>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                title={t('uploads.deleteTitle')}
                message={t('uploads.deleteMessage', {
                    name: deleting?.original_name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
