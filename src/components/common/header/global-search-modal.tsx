'use client';

import { LeadStatusBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { listGroups } from '@/services/api/groups';
import { listLeads } from '@/services/api/leads';
import { listStudents } from '@/services/api/students';
import type { Group, Lead, Student } from '@/types/api';
import { can, canAny } from '@/utils/access';
import { cn } from '@/utils/cn';
import { formatPhone, fullName } from '@/utils/format';
import { balanceTone } from '@/utils/tone';
import {
    Funnel1,
    OpenBook,
    Search1,
    UserCircle1,
    Xmark,
} from '@tailgrids/icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Results {
    students: Student[];
    groups: Group[];
    leads: Lead[];
}

const EMPTY: Results = { students: [], groups: [], leads: [] };

export function GlobalSearchModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const { formatPrice } = useFormat();
    const { session } = useSession();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    /** Oxirgi so'rov raqami — kechikkan eski javob yangisini bosib ketmasin. */
    const requestId = useRef(0);

    // Ruxsati yo'q bo'limga so'rov yuborilmaydi — baribir 403 qaytadi.
    const canStudents = canAny(session, 'students.view', 'students.view_own');
    const canGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canLeads = can(session, 'leads.view');

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Results>(EMPTY);
    const { students, groups, leads } = results;

    const handleClose = useCallback(() => {
        requestId.current += 1;
        setQuery('');
        setResults(EMPTY);
        setLoading(false);
        onClose();
    }, [onClose]);

    const handleQueryChange = (val: string) => {
        setQuery(val);
        if (!val.trim()) {
            requestId.current += 1;
            setResults(EMPTY);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            return;
        }

        const timer = setTimeout(async () => {
            const id = ++requestId.current;
            setLoading(true);
            const none = { data: [] };
            const [stdRes, grpRes, leadRes] = await Promise.all([
                canStudents
                    ? listStudents({ search: trimmed, limit: 5 }).catch(
                          () => none,
                      )
                    : none,
                canGroups
                    ? listGroups({ search: trimmed, limit: 5 }).catch(
                          () => none,
                      )
                    : none,
                canLeads
                    ? listLeads({ search: trimmed, limit: 5 }).catch(() => none)
                    : none,
            ]);

            if (id !== requestId.current) return;
            setResults({
                students: stdRes.data,
                groups: grpRes.data,
                leads: leadRes.data,
            });
            setLoading(false);
        }, 250);

        return () => clearTimeout(timer);
    }, [query, canStudents, canGroups, canLeads]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        if (open) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, handleClose]);

    if (!open) return null;

    const navigateTo = (url: string) => {
        router.push(url);
        handleClose();
    };

    const hasResults =
        students.length > 0 || groups.length > 0 || leads.length > 0;

    return (
        <div
            className='fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24'
            role='dialog'
            aria-modal='true'
            aria-label={t('search.title')}
        >
            <div
                className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity'
                aria-hidden='true'
                onClick={handleClose}
            />
            <div className='border-card-border bg-card-surface-area relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all'>
                {/* Search Header Input */}
                <div className='border-card-border flex items-center gap-3 border-b px-4 py-3.5'>
                    <Search1 className='text-icon-tertiary size-5 shrink-0' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder={t('header.searchPlaceholder')}
                        aria-label={t('search.title')}
                        className='text-text-primary placeholder:text-text-tertiary w-full border-none bg-transparent text-base ring-0 outline-none focus:border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none'
                        style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    <div className='flex shrink-0 items-center gap-2'>
                        {query && (
                            <button
                                type='button'
                                onClick={() => handleQueryChange('')}
                                className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary rounded-lg p-1 transition-colors'
                                title={t('filters.clear')}
                                aria-label={t('filters.clear')}
                            >
                                <Xmark className='size-4' />
                            </button>
                        )}
                        <kbd className='border-card-border bg-background-gray-secondary/70 text-text-tertiary hidden rounded-md border px-1.5 py-0.5 text-[10px] font-semibold sm:inline-block'>
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Search Results List */}
                <div className='flex-1 scrollbar-thin overflow-y-auto p-4'>
                    {loading && (
                        <div className='text-text-tertiary py-10 text-center text-sm font-medium'>
                            {t('search.searching')}
                        </div>
                    )}

                    {!loading && !query.trim() && (
                        <div className='text-text-tertiary flex flex-col items-center justify-center py-10 text-center text-sm'>
                            <div className='border-card-border bg-background-gray-secondary/50 mb-3 flex size-12 items-center justify-center rounded-2xl border'>
                                <Search1 className='text-icon-tertiary size-5' />
                            </div>
                            <p className='text-text-secondary text-sm font-medium'>
                                {t('search.title')}
                            </p>
                            <p className='text-text-tertiary mt-1 max-w-xs text-xs'>
                                {t('search.hint')}
                            </p>
                        </div>
                    )}

                    {!loading && query.trim() && !hasResults && (
                        <div className='text-text-tertiary py-8 text-center text-sm'>
                            {t('header.noResults')}
                        </div>
                    )}

                    {!loading && hasResults && (
                        <div className='space-y-5'>
                            {/* Students */}
                            {students.length > 0 && (
                                <div>
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                        <UserCircle1 className='size-4' />
                                        <span>{t('header.studentsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {students.map((student) => (
                                            <button
                                                key={student.id}
                                                type='button'
                                                onClick={() =>
                                                    navigateTo(
                                                        `/students/${student.id}`,
                                                    )
                                                }
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {fullName(student)}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs tabular-nums'>
                                                        {formatPhone(
                                                            student.phone_number ??
                                                                student.parent_phone,
                                                        )}
                                                    </div>
                                                </div>
                                                {student.balance != null && (
                                                    <span
                                                        className={cn(
                                                            'text-xs font-medium tabular-nums',
                                                            balanceTone(
                                                                student.balance,
                                                            ) ??
                                                                'text-text-tertiary',
                                                        )}
                                                    >
                                                        {student.balance > 0
                                                            ? '+'
                                                            : ''}
                                                        {formatPrice(
                                                            student.balance,
                                                            t('common.som'),
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Groups */}
                            {groups.length > 0 && (
                                <div>
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                        <OpenBook className='size-4' />
                                        <span>{t('header.groupsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {groups.map((group) => (
                                            <button
                                                key={group.id}
                                                type='button'
                                                onClick={() =>
                                                    navigateTo(
                                                        `/groups/${group.id}`,
                                                    )
                                                }
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {group.name}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs'>
                                                        {group.course.name}
                                                    </div>
                                                </div>
                                                <span className='text-text-tertiary text-xs font-medium'>
                                                    {t(
                                                        'schedule.studentsCount',
                                                        {
                                                            count: group.students_count,
                                                        },
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Leads */}
                            {leads.length > 0 && (
                                <div>
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                        <Funnel1 className='size-4' />
                                        <span>{t('header.leadsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {leads.map((lead) => (
                                            <button
                                                key={lead.id}
                                                type='button'
                                                onClick={() =>
                                                    // Ro'yxat qidiruvi manzilning `q`
                                                    // parametridan o'qiydi; telefon —
                                                    // lidni aniq topadi.
                                                    navigateTo(
                                                        `/leads?q=${encodeURIComponent(lead.phone_number)}`,
                                                    )
                                                }
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {[
                                                            lead.last_name,
                                                            lead.first_name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs tabular-nums'>
                                                        {formatPhone(
                                                            lead.phone_number,
                                                        )}
                                                    </div>
                                                </div>
                                                <LeadStatusBadge
                                                    status={lead.status}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
