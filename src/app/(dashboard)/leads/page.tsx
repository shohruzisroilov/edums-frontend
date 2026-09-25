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
import { AccessGuard } from '@/components/ui/access-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { SearchInput } from '@/components/ui/search-input';
import { LeadStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    deleteLead,
    getLeadStats,
    listLeads,
    updateLead,
} from '@/services/api/leads';
import {
    EDITABLE_LEAD_STATUSES,
    LEAD_SOURCES,
    LEAD_STATUSES,
    type Lead,
    type LeadPayload,
    type LeadSource,
    type LeadStatus,
} from '@/types/api';
import { can } from '@/utils/access';
import { cn } from '@/utils/cn';
import { Funnel1, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConvertLeadModal } from './_components/convert-lead';
import { LeadFormModal } from './_components/lead-form';

export default function LeadsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'leads.view')}>
            <LeadsView />
        </AccessGuard>
    );
}

function leadName(lead: Pick<Lead, 'first_name' | 'last_name'>) {
    return [lead.last_name, lead.first_name].filter(Boolean).join(' ');
}

function LeadsView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatDate, formatNumber } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'leads.create');
    const canUpdate = can(session, 'leads.update');
    const canDelete = can(session, 'leads.delete');
    const canConvert = canUpdate && can(session, 'students.create');
    const canOpenStudents = can(session, 'students.view');

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '', source: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Lead | null>(null);
    const [converting, setConverting] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState<Lead | null>(null);

    const query = useQuery({
        queryKey: ['leads', { search, ...filters, limit, offset }],
        queryFn: () =>
            listLeads({
                search: search || undefined,
                status: (filters.status || undefined) as LeadStatus | undefined,
                source: (filters.source || undefined) as LeadSource | undefined,
                limit,
                offset,
            }),
    });
    const statsQuery = useQuery({
        queryKey: ['lead-stats'],
        queryFn: getLeadStats,
    });

    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    }

    const statusMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: NonNullable<LeadPayload['status']>;
        }) => updateLead(id, { status }),
        onSuccess: () => {
            invalidate();
            toast.success(t('leads.updated'));
        },
        onError: (error) => toastError(error),
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteLead(id),
        onSuccess: () => {
            invalidate();
            toast.success(t('leads.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('leads.title')}
                count={query.data?.count}
                description={t('leads.subtitle')}
                actions={
                    canCreate && (
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
                            {t('leads.new')}
                        </Button>
                    )
                }
            />

            {/* Voronka: karta bosilsa shu holat bo'yicha filtrlanadi. */}
            <div className='grid grid-cols-2 gap-3 px-5 pb-4 sm:grid-cols-3 lg:grid-cols-5'>
                {LEAD_STATUSES.map((status) => {
                    const active = filters.status === status;

                    return (
                        <button
                            key={status}
                            type='button'
                            aria-pressed={active}
                            onClick={() =>
                                setFilter('status', active ? '' : status)
                            }
                            className={cn(
                                'bg-card-background rounded-xl border p-4 text-left transition',
                                active
                                    ? 'border-brand-accent'
                                    : 'border-card-border hover:border-text-tertiary',
                            )}
                        >
                            <p className='text-text-tertiary text-xs'>
                                {t(`leadStatus.${status}`)}
                            </p>
                            <p className='text-text-primary font-display mt-1 text-2xl font-semibold tabular-nums'>
                                {statsQuery.data
                                    ? formatNumber(statsQuery.data[status])
                                    : '—'}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className='flex flex-wrap gap-3 px-5 pb-4'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('leads.search')}
                />
                <div className='w-full sm:w-44'>
                    <SelectInput
                        options={LEAD_STATUSES.map((status) => ({
                            value: status,
                            label: t(`leadStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
                <div className='w-full sm:w-44'>
                    <SelectInput
                        options={LEAD_SOURCES.map((source) => ({
                            value: source,
                            label: t(`leadSource.${source}`),
                        }))}
                        placeholder={t('leads.allSources')}
                        value={filters.source}
                        onValueChange={(next) => setFilter('source', next)}
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
                            message={t('leads.empty')}
                            icon={<Funnel1 className='size-5' />}
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
                                            {t('common.fullName')}
                                        </TableHead>
                                        <TableHead>
                                            {t('leads.source')}
                                        </TableHead>
                                        <TableHead>
                                            {t('leads.interest')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
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
                                    {query.data.data.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell primary>
                                                {leadName(lead)}
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal tabular-nums'>
                                                    {lead.phone_number}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {t(`leadSource.${lead.source}`)}
                                            </TableCell>
                                            <TableCell>
                                                {lead.course?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {canUpdate &&
                                                lead.status !== 'won' ? (
                                                    <div className='w-40'>
                                                        <SelectInput
                                                            options={EDITABLE_LEAD_STATUSES.map(
                                                                (status) => ({
                                                                    value: status,
                                                                    label: t(
                                                                        `leadStatus.${status}`,
                                                                    ),
                                                                }),
                                                            )}
                                                            value={lead.status}
                                                            disabled={
                                                                statusMutation.isPending
                                                            }
                                                            onValueChange={(
                                                                status,
                                                            ) =>
                                                                statusMutation.mutate(
                                                                    {
                                                                        id: lead.id,
                                                                        status: status as NonNullable<
                                                                            LeadPayload['status']
                                                                        >,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <LeadStatusBadge
                                                        status={lead.status}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(lead.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    {lead.student &&
                                                        canOpenStudents && (
                                                            <Link
                                                                href={`/students/${lead.student.id}`}
                                                                className='text-brand-accent self-center text-sm font-medium hover:underline'
                                                            >
                                                                {t(
                                                                    'leads.openStudent',
                                                                )}
                                                            </Link>
                                                        )}
                                                    {canConvert &&
                                                        lead.status !==
                                                            'won' && (
                                                            <Button
                                                                variant='primary'
                                                                appearance='outline'
                                                                size='md'
                                                                onPress={() =>
                                                                    setConverting(
                                                                        lead,
                                                                    )
                                                                }
                                                            >
                                                                {t(
                                                                    'leads.convert',
                                                                )}
                                                            </Button>
                                                        )}
                                                    {canUpdate && (
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.edit',
                                                            )}
                                                            onPress={() => {
                                                                setEditing(
                                                                    lead,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil1 />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
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
                                                                    lead,
                                                                )
                                                            }
                                                        >
                                                            <Trash1 />
                                                        </Button>
                                                    )}
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
                <LeadFormModal
                    lead={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {converting && (
                <ConvertLeadModal
                    lead={converting}
                    onClose={() => setConverting(null)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('leads.deleteTitle')}
                message={t('leads.deleteMessage', {
                    name: deleting ? leadName(deleting) : '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
