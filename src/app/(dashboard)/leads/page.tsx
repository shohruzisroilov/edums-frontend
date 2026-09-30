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
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { SearchInput } from '@/components/ui/search-input';
import {
    LeadSourceBadge,
    LeadStatusBadge,
    LeadStatusDot,
} from '@/components/ui/status-badge';
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
import { Funnel1, Globe2, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

import { LeadKanbanBoard } from '@/components/ui/lead-kanban-board';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { Column, Table2 } from '@tailgrids/icons';

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
    // Saytdagi forma sozlamalarda yoqiladi.
    const canManageSettings = can(session, 'settings.manage');
    const router = useRouter();

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

    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Lead | null>(null);
    const [converting, setConverting] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState<Lead | null>(null);

    const query = useQuery({
        queryKey: [
            'leads',
            {
                search,
                ...filters,
                limit,
                offset: viewMode === 'kanban' ? 0 : offset,
                limitVal: viewMode === 'kanban' ? 100 : limit,
            },
        ],
        queryFn: () =>
            listLeads({
                search: search || undefined,
                status: (filters.status || undefined) as LeadStatus | undefined,
                source: (filters.source || undefined) as LeadSource | undefined,
                limit: viewMode === 'kanban' ? 100 : limit,
                offset: viewMode === 'kanban' ? 0 : offset,
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
                    <div className='flex flex-wrap items-center gap-2'>
                        <div className='border-card-border bg-background-gray-secondary/60 flex items-center rounded-xl border p-1'>
                            <button
                                type='button'
                                onClick={() => setViewMode('kanban')}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                                    viewMode === 'kanban'
                                        ? 'bg-card-surface-area text-text-primary shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                <Column className='size-3.5' />
                                Kanban
                            </button>
                            <button
                                type='button'
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                                    viewMode === 'table'
                                        ? 'bg-card-surface-area text-text-primary shadow-xs'
                                        : 'text-text-tertiary hover:text-text-primary',
                                )}
                            >
                                <Table2 className='size-3.5' />
                                Jadval
                            </button>
                        </div>
                        {canManageSettings && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => router.push('/settings')}
                            >
                                <Globe2 />
                                {t('leads.fromWebsite')}
                            </Button>
                        )}
                        {canCreate && (
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
                        )}
                    </div>
                }
            />

            {/* Voronka: karta bosilsa shu holat bo'yicha filtrlanadi. */}
            <div className='grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 sm:px-5 lg:grid-cols-5'>
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
                                'bg-card-background rounded-xl border p-3.5 text-left transition sm:p-4',
                                active
                                    ? 'border-brand-accent ring-brand-accent/20 ring-2'
                                    : 'border-card-border hover:border-text-tertiary',
                            )}
                        >
                            <p className='text-text-tertiary flex items-center gap-1.5 text-xs font-medium'>
                                <LeadStatusDot status={status} />
                                <span className='truncate'>
                                    {t(`leadStatus.${status}`)}
                                </span>
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

            <div className='flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-5'>
                <div className='min-w-[220px] flex-1'>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t('leads.search')}
                    />
                </div>

                <MobileFilterSheet
                    activeCount={
                        (filters.status ? 1 : 0) + (filters.source ? 1 : 0)
                    }
                    onClear={() => {
                        setFilter('status', '');
                        setFilter('source', '');
                    }}
                    activeChips={[
                        ...(filters.status
                            ? [
                                  {
                                      key: 'status',
                                      label: `Holat: ${t(`leadStatus.${filters.status as LeadStatus}`)}`,
                                      onRemove: () => setFilter('status', ''),
                                  },
                              ]
                            : []),
                        ...(filters.source
                            ? [
                                  {
                                      key: 'source',
                                      label: `Manba: ${t(`leadSource.${filters.source as LeadSource}`)}`,
                                      onRemove: () => setFilter('source', ''),
                                  },
                              ]
                            : []),
                    ]}
                >
                    <SelectInput
                        label={t('common.allStatuses')}
                        options={LEAD_STATUSES.map((status) => ({
                            value: status,
                            label: t(`leadStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                    <SelectInput
                        label={t('leads.allSources')}
                        options={LEAD_SOURCES.map((source) => ({
                            value: source,
                            label: t(`leadSource.${source}`),
                        }))}
                        placeholder={t('leads.allSources')}
                        value={filters.source}
                        onValueChange={(next) => setFilter('source', next)}
                    />
                </MobileFilterSheet>

                <div className='hidden items-center gap-3 sm:flex'>
                    <div className='w-44'>
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
                    <div className='w-44'>
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
            </div>

            <div className='px-4 sm:px-5'>
                {query.isPending ? (
                    <TableSkeleton columns={6} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : query.data.data.length === 0 ? (
                    <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                        <EmptyState
                            message={t('leads.empty')}
                            icon={<Funnel1 className='size-5' />}
                            action={
                                Boolean(
                                    search || filters.status || filters.source,
                                ) ? (
                                    <Button
                                        appearance='outline'
                                        size='md'
                                        onPress={() => {
                                            setSearch('');
                                            setFilter('status', '');
                                            setFilter('source', '');
                                        }}
                                    >
                                        Filtrni tozalash
                                    </Button>
                                ) : canCreate ? (
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
                                        Birinchi lidni qo'shish
                                    </Button>
                                ) : null
                            }
                        />
                    </div>
                ) : viewMode === 'kanban' ? (
                    <LeadKanbanBoard
                        leads={query.data.data}
                        onStatusChange={(id, status) =>
                            statusMutation.mutate({
                                id,
                                status: status as NonNullable<
                                    LeadPayload['status']
                                >,
                            })
                        }
                        onEdit={(lead) => {
                            setEditing(lead);
                            setFormOpen(true);
                        }}
                        onConvert={(lead) => setConverting(lead)}
                        canUpdate={canUpdate}
                        canConvert={canConvert}
                    />
                ) : (
                    <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.data.map((lead, index) => (
                                    <div
                                        key={lead.id}
                                        className='flex flex-col gap-3 p-4 transition-colors hover:bg-background-gray-primary/20'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{offset + index + 1}
                                                    </span>
                                                    <span className='text-text-primary text-sm font-semibold truncate'>
                                                        {leadName(lead)}
                                                    </span>
                                                </div>
                                                <p className='text-text-tertiary mt-0.5 text-xs tabular-nums'>
                                                    {lead.phone_number}
                                                </p>
                                            </div>
                                            <LeadStatusBadge status={lead.status} />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <div className='flex items-center gap-2'>
                                                <LeadSourceBadge source={lead.source} />
                                                {lead.course && (
                                                    <span className='text-text-secondary text-xs'>
                                                        {lead.course.name}
                                                    </span>
                                                )}
                                            </div>
                                            <span className='text-text-tertiary tabular-nums text-[11px]'>
                                                {formatDate(lead.created_at)}
                                            </span>
                                        </div>

                                        <div className='flex items-center justify-end gap-1.5 border-t border-card-border/60 pt-2.5'>
                                            {lead.student && canOpenStudents && (
                                                <Link
                                                    href={`/students/${lead.student.id}`}
                                                    className='text-brand-accent text-xs font-medium hover:underline mr-auto'
                                                >
                                                    {t('leads.openStudent')}
                                                </Link>
                                            )}
                                            {canConvert && lead.status !== 'won' && (
                                                <Button
                                                    variant='primary'
                                                    appearance='outline'
                                                    size='sm'
                                                    onPress={() => setConverting(lead)}
                                                    className='text-xs'
                                                >
                                                    {t('leads.convert')}
                                                </Button>
                                            )}
                                            {canUpdate && (
                                                <Button
                                                    appearance='outline'
                                                    size='sm'
                                                    iconOnly
                                                    aria-label={t('common.edit')}
                                                    onPress={() => {
                                                        setEditing(lead);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <Pencil1 className='size-3.5' />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant='danger'
                                                    appearance='outline'
                                                    size='sm'
                                                    iconOnly
                                                    aria-label={t('common.delete')}
                                                    onPress={() => setDeleting(lead)}
                                                >
                                                    <Trash1 className='size-3.5' />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop / Tablet jadval (>= md) */}
                            <div className='hidden md:block'>
                                <TableRoot
                                    fullBleed
                                    className='border-x-0 border-t-0'
                                >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
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
                                    {query.data.data.map((lead, index) => (
                                        <TableRow key={lead.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell primary>
                                                {leadName(lead)}
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal tabular-nums'>
                                                    {lead.phone_number}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <LeadSourceBadge
                                                    source={lead.source}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {lead.course?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {canUpdate &&
                                                lead.status !== 'won' ? (
                                                    <div className='flex w-44 items-center gap-2'>
                                                        <LeadStatusDot
                                                            status={lead.status}
                                                        />
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
                            </div>

                            <PaginationBar
                                count={query.data.count}
                                limit={limit}
                                offset={offset}
                                onLimitChange={setLimit}
                                onOffsetChange={setOffset}
                            />
                        </>
                    </div>
                )}
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
