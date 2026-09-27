'use client';

import { useT } from '@/i18n/provider';
import { listGroups } from '@/services/api/groups';
import { listLeads } from '@/services/api/leads';
import { listStudents } from '@/services/api/students';
import type { Group, Lead, Student } from '@/types/api';
import { formatPhone } from '@/utils/format';
import { Funnel1, OpenBook, Search1, UserCircle1, Xmark } from '@tailgrids/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function GlobalSearchModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const t = useT();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setStudents([]);
            setGroups([]);
            setLeads([]);
        }
    }, [open]);

    useEffect(() => {
        if (!query.trim()) {
            setStudents([]);
            setGroups([]);
            setLeads([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const [stdRes, grpRes, leadRes] = await Promise.all([
                    listStudents({ search: query, limit: 5 }).catch(() => ({ data: [] })),
                    listGroups({ search: query, limit: 5 }).catch(() => ({ data: [] })),
                    listLeads({ search: query, limit: 5 }).catch(() => ({ data: [] })),
                ]);

                setStudents(stdRes.data || []);
                setGroups(grpRes.data || []);
                setLeads(leadRes.data || []);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const navigateTo = (url: string) => {
        router.push(url);
        onClose();
    };

    const hasResults = students.length > 0 || groups.length > 0 || leads.length > 0;

    return (
        <div className='fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24'>
            <div
                className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity'
                aria-hidden='true'
                onClick={onClose}
            />
            <div className='border-card-border bg-card-surface-area relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all'>
                {/* Search Header Input */}
                <div className='border-card-border flex items-center gap-3 border-b px-4 py-3.5'>
                    <Search1 className='text-icon-tertiary size-5 shrink-0' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('header.searchPlaceholder')}
                        className='text-text-primary placeholder:text-text-tertiary w-full bg-transparent text-base border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0'
                        style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    <div className='flex items-center gap-2 shrink-0'>
                        {query && (
                            <button
                                type='button'
                                onClick={() => setQuery('')}
                                className='text-icon-tertiary hover:text-text-primary hover:bg-background-gray-secondary rounded-lg p-1 transition-colors'
                                title='Tozalash'
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
                <div className='scrollbar-thin flex-1 overflow-y-auto p-4'>
                    {loading && (
                        <div className='text-text-tertiary py-10 text-center text-sm font-medium'>
                            Qidirilmoqda…
                        </div>
                    )}

                    {!loading && !query.trim() && (
                        <div className='text-text-tertiary flex flex-col items-center justify-center py-10 text-center text-sm'>
                            <div className='border-card-border bg-background-gray-secondary/50 mb-3 flex size-12 items-center justify-center rounded-2xl border'>
                                <Search1 className='text-icon-tertiary size-5' />
                            </div>
                            <p className='text-text-secondary text-sm font-medium'>Tezkor qidiruv</p>
                            <p className='text-text-tertiary mt-1 max-w-xs text-xs'>
                                Ism, familiya, telefon raqami yoki guruh nomini kiritib qidiring
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
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider'>
                                        <UserCircle1 className='size-4' />
                                        <span>{t('header.studentsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {students.map((student) => (
                                            <button
                                                key={student.id}
                                                type='button'
                                                onClick={() => navigateTo(`/students/${student.id}`)}
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {student.first_name} {student.last_name}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs'>
                                                        {formatPhone(student.phone_number)}
                                                    </div>
                                                </div>
                                                <span className='text-text-tertiary text-xs'>
                                                    {student.balance != null ? (
                                                        student.balance < 0 ? (
                                                            <span className='text-red-600 font-medium dark:text-red-400'>
                                                                {student.balance.toLocaleString()} so'm
                                                            </span>
                                                        ) : (
                                                            <span className='text-emerald-600 font-medium dark:text-emerald-400'>
                                                                +{student.balance.toLocaleString()} so'm
                                                            </span>
                                                        )
                                                    ) : null}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Groups */}
                            {groups.length > 0 && (
                                <div>
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider'>
                                        <OpenBook className='size-4' />
                                        <span>{t('header.groupsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {groups.map((group) => (
                                            <button
                                                key={group.id}
                                                type='button'
                                                onClick={() => navigateTo(`/groups/${group.id}`)}
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {group.name}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs'>
                                                        {group.course?.name || ''}
                                                    </div>
                                                </div>
                                                <span className='text-text-tertiary text-xs font-medium'>
                                                    {group.students_count ?? 0} o'quvchi
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Leads */}
                            {leads.length > 0 && (
                                <div>
                                    <div className='text-text-tertiary mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider'>
                                        <Funnel1 className='size-4' />
                                        <span>{t('header.leadsGroup')}</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {leads.map((lead) => (
                                            <button
                                                key={lead.id}
                                                type='button'
                                                onClick={() => navigateTo(`/leads?search=${encodeURIComponent(lead.first_name)}`)}
                                                className='hover:bg-background-gray-secondary flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors'
                                            >
                                                <div>
                                                    <div className='text-text-primary text-sm font-medium'>
                                                        {lead.first_name} {lead.last_name || ''}
                                                    </div>
                                                    <div className='text-text-tertiary text-xs'>
                                                        {formatPhone(lead.phone_number)}
                                                    </div>
                                                </div>
                                                <span className='bg-background-gray-secondary text-text-secondary rounded-lg px-2 py-0.5 text-xs'>
                                                    {lead.status || 'Lid'}
                                                </span>
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
