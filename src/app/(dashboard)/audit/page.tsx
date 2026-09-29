'use client';

import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { AuditActionBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { useT, type Translate } from '@/i18n/provider';
import type { TranslationKey } from '@/i18n/dictionaries/uz';
import { listAuditLogs } from '@/services/api/audit';
import { listUserOptions } from '@/services/api/users';
import {
    AUDIT_ENTITY_TYPES,
    PAYMENT_METHODS,
    type AuditEntityType,
    type AuditLog,
} from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { FileText } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';

export default function AuditPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'audit.view')}>
            <AuditView />
        </AccessGuard>
    );
}

/** UUID formati. */
const UUID_REGEX =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/** Pul sifatida ko'rsatiladigan maydonlar. */
const MONEY_FIELDS = new Set(['amount', 'price', 'monthly_price']);

/** Sana sifatida ko'rsatiladigan maydonlar. */
const DATE_FIELDS = new Set([
    'paid_at',
    'date',
    'joined_at',
    'left_at',
    'start_date',
    'end_date',
    'birth_date',
]);

function AuditView() {
    const t = useT();
    const { formatDateTime } = useFormat();

    const {
        filters,
        setFilter,
        setFilters,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ entity_type: '', actor_id: '', from: '', to: '' });

    const query = useQuery({
        queryKey: ['audit-logs', { ...filters, limit, offset }],
        queryFn: () =>
            listAuditLogs({
                entity_type: (filters.entity_type || undefined) as
                    | AuditEntityType
                    | undefined,
                actor_id: filters.actor_id || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                limit,
                offset,
            }),
    });

    const usersQuery = useQuery({
        queryKey: ['user-options'],
        queryFn: listUserOptions,
    });

    const activeFilterCount =
        (filters.entity_type ? 1 : 0) +
        (filters.actor_id ? 1 : 0) +
        (filters.from || filters.to ? 1 : 0);

    const filterElements = (
        <>
            <div className='w-full sm:w-52'>
                <SelectInput
                    options={AUDIT_ENTITY_TYPES.map((type) => ({
                        value: type,
                        label: t(`auditEntity.${type}`),
                    }))}
                    placeholder={t('audit.allTypes')}
                    value={filters.entity_type}
                    onValueChange={(next) => setFilter('entity_type', next)}
                />
            </div>
            <div className='w-full sm:w-52'>
                <SelectInput
                    options={(usersQuery.data ?? []).map((user) => ({
                        value: user.id,
                        label: fullName(user),
                    }))}
                    placeholder={t('audit.allUsers')}
                    value={filters.actor_id}
                    onValueChange={(next) => setFilter('actor_id', next)}
                />
            </div>
            <DateRangeFilter
                from={filters.from}
                to={filters.to}
                onDateChange={(range) => setFilters(range)}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title={t('audit.title')}
                count={query.data?.count}
                description={t('audit.subtitle')}
            />

            <div className='flex items-center gap-3 px-4 pb-4 sm:px-5'>
                <div className='hidden sm:flex sm:flex-wrap sm:items-center sm:gap-3'>
                    {filterElements}
                </div>
                <div className='flex w-full items-center justify-end sm:hidden'>
                    <MobileFilterSheet
                        activeCount={activeFilterCount}
                        onClear={() => {
                            setFilter('entity_type', '');
                            setFilter('actor_id', '');
                            setFilter('from', '');
                            setFilter('to', '');
                        }}
                    >
                        {filterElements}
                    </MobileFilterSheet>
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
                            message={t('audit.empty')}
                            icon={<FileText className='size-5' />}
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
                                        <TableHead>{t('audit.time')}</TableHead>
                                        <TableHead>
                                            {t('audit.actor')}
                                        </TableHead>
                                        <TableHead>
                                            {t('audit.action')}
                                        </TableHead>
                                        <TableHead>
                                            {t('audit.object')}
                                        </TableHead>
                                        <TableHead>
                                            {t('audit.details')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((log, index) => (
                                        <TableRow key={log.id}>
                                            <RowNumberCell
                                                index={index}
                                                offset={offset}
                                            />
                                            <TableCell className='tabular-nums'>
                                                {formatDateTime(log.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {log.actor.name}
                                            </TableCell>
                                            <TableCell>
                                                <AuditActionBadge
                                                    action={log.action}
                                                />
                                            </TableCell>
                                            <TableCell
                                                primary
                                                className='whitespace-normal'
                                            >
                                                {log.summary}
                                            </TableCell>
                                            <TableCell className='text-text-secondary text-xs whitespace-normal'>
                                                <Details log={log} />
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
        </>
    );
}

/** Ma'lum maydonlar tarjima qilinadi va formatlanadi. Texnik ID'lar va bo'sh qiymatlar yashiriladi. */
function Details({ log }: { log: AuditLog }) {
    const t = useT();
    const { formatPrice, formatDate } = useFormat();

    if (!log.details) return <>—</>;

    const validEntries = Object.entries(log.details).filter(([key, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'string' && UUID_REGEX.test(value)) return false;
        if (key.endsWith('_id') || key === 'id') return false;
        return true;
    });

    if (validEntries.length === 0) return <>—</>;

    return (
        <dl className='flex flex-col gap-0.5'>
            {validEntries.map(([key, value]) => (
                <div key={key} className='flex gap-1'>
                    <dt className='text-text-tertiary font-medium'>
                        {fieldLabel(key, t)}:
                    </dt>
                    <dd className='text-text-primary tabular-nums'>
                        {formatValue(
                            key,
                            value,
                            log.action,
                            t,
                            formatPrice,
                            formatDate,
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function fieldLabel(key: string, t: Translate): string {
    const label = t(`auditField.${key}` as TranslationKey) as
        | string
        | undefined;
    return label ?? key;
}

function formatValue(
    key: string,
    value: unknown,
    action: string,
    t: Translate,
    formatPrice: (value: number, currency: string) => string,
    formatDate: (value: string) => string,
): string {
    if (value === null || value === undefined || value === '') return '—';

    if (typeof value === 'boolean') {
        return t(value ? 'common.active' : 'common.inactive');
    }

    if (
        (MONEY_FIELDS.has(key) ||
            (key === 'value' && action.startsWith('salary.'))) &&
        typeof value === 'number'
    ) {
        return formatPrice(value, t('common.som'));
    }

    if (DATE_FIELDS.has(key) && typeof value === 'string') {
        return formatDate(value);
    }

    if (
        key === 'method' &&
        PAYMENT_METHODS.includes(value as (typeof PAYMENT_METHODS)[number])
    ) {
        return t(`paymentMethod.${value as (typeof PAYMENT_METHODS)[number]}`);
    }

    if (key === 'source' && typeof value === 'string') {
        const sourceKey = `leadSource.${value}` as TranslationKey;
        const translated = t(sourceKey);
        if (translated && translated !== sourceKey) return translated;
    }

    if (key === 'status' && typeof value === 'string') {
        if (action.startsWith('lead.')) {
            const translated = t(`leadStatus.${value}` as TranslationKey);
            if (translated && !translated.startsWith('leadStatus.'))
                return translated;
        }
        if (action.startsWith('group.')) {
            const translated = t(`groupStatus.${value}` as TranslationKey);
            if (translated && !translated.startsWith('groupStatus.'))
                return translated;
        }
        if (action.startsWith('student.')) {
            const translated = t(`studentStatus.${value}` as TranslationKey);
            if (translated && !translated.startsWith('studentStatus.'))
                return translated;
        }
        if (action.startsWith('education.')) {
            const translated = t(`educationStatus.${value}` as TranslationKey);
            if (translated && !translated.startsWith('educationStatus.'))
                return translated;
        }
        if (value === 'active') return t('common.active');
        if (value === 'inactive') return t('common.inactive');
    }

    if (key === 'type' && action.startsWith('salary.')) {
        if (value === 'per_student') return "O'quvchi boshiga";
        if (value === 'fixed') return 'Fikslangan oylik';
        if (value === 'per_hour') return 'Soatbay dars haqisidan';
    }

    if (key === 'lesson_days' && Array.isArray(value)) {
        return value
            .map((dayNum) => {
                const dayKey = `weekday.${dayNum}` as TranslationKey;
                const tr = t(dayKey);
                return tr && !tr.startsWith('weekday.') ? tr : String(dayNum);
            })
            .join(', ');
    }

    if (key === 'capacity' && typeof value === 'number') {
        return `${value} ${t('rooms.personUnit')}`;
    }

    if (key === 'duration_months' && typeof value === 'number') {
        return `${value} ${t('courses.monthUnit')}`;
    }

    if (key === 'duration_days' && typeof value === 'number') {
        return `${value} ${t('tariffs.dayUnit')}`;
    }

    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}
