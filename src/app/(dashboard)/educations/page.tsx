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
import { AccessGuard } from '@/components/ui/access-guard';
import { SearchInput } from '@/components/ui/search-input';
import {
    EducationStatusBadge,
    SubscriptionBadge,
} from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT } from '@/i18n/provider';
import { deleteEducation, listEducations } from '@/services/api/educations';
import type { Education, EducationStatus } from '@/types/api';
import { EDUCATION_STATUSES } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { Buildings11, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { EducationFormModal } from './_components/education-form';

export default function EducationsPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <EducationsView />
        </AccessGuard>
    );
}

function EducationsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate } = useFormat();

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Education | null>(null);
    const [deleting, setDeleting] = useState<Education | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['educations', { search, ...filters, limit, offset }],
        queryFn: () =>
            listEducations({
                search: search || undefined,
                status: (filters.status || undefined) as
                    | EducationStatus
                    | undefined,
                limit,
                offset,
            }),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteEducation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            toast.success(t('educations.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('educations.title')}
                count={query.data?.count}
                description={t('educations.subtitle')}
                actions={
                    <Button
                        variant='primary'
                        appearance='fill'
                        size='md'
                        onPress={() => {
                            setEditing(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus />
                        {t('educations.new')}
                    </Button>
                }
            />

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('educations.search')}
                />
                <div className='sm:w-44'>
                    <SelectInput
                        options={EDUCATION_STATUSES.map((status) => ({
                            value: status,
                            label: t(`educationStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={6} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('educations.empty')}
                            icon={<Buildings11 className='size-5' />}
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
                                            {t('common.name')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.phone')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        <TableHead>
                                            {t('billing.subscription')}
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
                                    {query.data.data.map((education) => (
                                        <TableRow key={education.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/educations/${education.id}`}
                                                    className='text-brand-accent font-medium hover:underline'
                                                >
                                                    {education.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {education.phone_number}
                                            </TableCell>
                                            <TableCell>
                                                <EducationStatusBadge
                                                    status={education.status}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <SubscriptionBadge
                                                    subscription={
                                                        education.subscription
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    education.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'common.edit',
                                                        )}
                                                        onPress={() => {
                                                            setEditing(
                                                                education,
                                                            );
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil1 />
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
                                                            setDeleting(
                                                                education,
                                                            )
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

            {formOpen && (
                <EducationFormModal
                    education={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('educations.deleteTitle')}
                message={t('educations.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
