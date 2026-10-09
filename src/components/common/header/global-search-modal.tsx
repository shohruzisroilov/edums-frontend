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
    CalendarTime,
    DashboardSquare1,
    Funnel1,
    Gear1,
    MoonHalfLeft5,
    OpenBook,
    Search1,
    Sun1,
    UserCircle1,
    UserMultiple1,
    Wallet2,
    Xmark,
} from '@tailgrids/icons';
import { SUPPORT_CONTACTS } from '@/utils/site';
import { SupportHeadsetIcon } from '@/components/ui/support-modal';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

interface Results {
    students: Student[];
    groups: Group[];
    leads: Lead[];
}

const EMPTY: Results = { students: [], groups: [], leads: [] };

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: ReactNode;
    tag?: string;
    url?: string;
    action?: 'theme' | 'support';
    category: 'action' | 'nav' | 'student' | 'group' | 'lead';
}

export function GlobalSearchModal({
    open,
    onClose,
    onOpenSupport,
}: {
    open: boolean;
    onClose: () => void;
    onOpenSupport?: () => void;
}) {
    const t = useT();
    const { formatPrice } = useFormat();
    const { session } = useSession();
    const { resolvedTheme, setTheme } = useTheme();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const requestId = useRef(0);

    const canStudents = canAny(session, 'students.view', 'students.view_own');
    const canGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canLeads = can(session, 'leads.view');

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Results>(EMPTY);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { students, groups, leads } = results;

    const handleClose = useCallback(() => {
        requestId.current += 1;
        setQuery('');
        setResults(EMPTY);
        setLoading(false);
        setSelectedIndex(0);
        onClose();
    }, [onClose]);

    const executeItem = useCallback(
        (item: CommandItem) => {
            if (item.action === 'theme') {
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                handleClose();
            } else if (item.action === 'support') {
                handleClose();
                onOpenSupport?.();
            } else if (item.url) {
                router.push(item.url);
                handleClose();
            }
        },
        [resolvedTheme, setTheme, router, handleClose, onOpenSupport],
    );

    // Barcha tezkor buyruqlar va sahifalar
    const isDark = resolvedTheme === 'dark';
    const baseCommands: CommandItem[] = [];

    // Tezkor amallar (Actions)
    if (can(session, 'students.create')) {
        baseCommands.push({
            id: 'action-student-new',
            title: t('header.quickStudent'),
            subtitle: t('students.new'),
            icon: <UserCircle1 className='text-brand-accent size-4' />,
            tag: '⚡ Action',
            url: '/students?new=1',
            category: 'action',
        });
    }

    if (can(session, 'payments.create')) {
        baseCommands.push({
            id: 'action-payment-new',
            title: t('header.quickPayment'),
            subtitle: t('cashbox.title'),
            icon: <Wallet2 className='text-badge-success-text size-4' />,
            tag: '⚡ Action',
            url: '/cashbox?new=1',
            category: 'action',
        });
    }

    if (can(session, 'groups.create')) {
        baseCommands.push({
            id: 'action-group-new',
            title: t('groups.new'),
            subtitle: t('nav.groups'),
            icon: <UserMultiple1 className='text-badge-violet-text size-4' />,
            tag: '⚡ Action',
            url: '/groups?new=1',
            category: 'action',
        });
    }

    if (can(session, 'leads.create')) {
        baseCommands.push({
            id: 'action-lead-new',
            title: t('header.quickLead'),
            subtitle: t('nav.leads'),
            icon: <Funnel1 className='text-badge-warning-text size-4' />,
            tag: '⚡ Action',
            url: '/leads?new=1',
            category: 'action',
        });
    }

    // Mavzuni almashtirish buyrug'i
    baseCommands.push({
        id: 'action-theme-toggle',
        title: isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish',
        subtitle: isDark ? 'Light mode' : 'Dark mode',
        icon: isDark ? (
            <Sun1 className='size-4 text-amber-500' />
        ) : (
            <MoonHalfLeft5 className='size-4 text-indigo-400' />
        ),
        tag: '⚡ Theme',
        action: 'theme',
        category: 'action',
    });

    if (onOpenSupport) {
        baseCommands.push({
            id: 'action-support-modal',
            title: `${t('support.title')} (Telegram, Telefon)`,
            subtitle: `${SUPPORT_CONTACTS.phoneFormatted} · ${SUPPORT_CONTACTS.telegramPersonal} · ${SUPPORT_CONTACTS.telegramGroup}`,
            icon: <SupportHeadsetIcon className='size-4 text-sky-500' />,
            tag: '⚡ Support',
            action: 'support',
            category: 'action',
        });
    }

    // Sahifalarga o'tish (Navigation)
    if (canAny(session, 'reports.view', 'reports.view_own')) {
        baseCommands.push({
            id: 'nav-dashboard',
            title: t('nav.dashboard'),
            subtitle: '/dashboard',
            icon: <DashboardSquare1 className='size-4' />,
            url: '/dashboard',
            category: 'nav',
        });
    }

    if (canStudents) {
        baseCommands.push({
            id: 'nav-students',
            title: t('nav.students'),
            subtitle: '/students',
            icon: <UserCircle1 className='size-4' />,
            url: '/students',
            category: 'nav',
        });
    }

    if (canGroups) {
        baseCommands.push({
            id: 'nav-groups',
            title: t('nav.groups'),
            subtitle: '/groups',
            icon: <OpenBook className='size-4' />,
            url: '/groups',
            category: 'nav',
        });
    }

    if (can(session, 'payments.view')) {
        baseCommands.push({
            id: 'nav-cashbox',
            title: t('cashbox.title'),
            subtitle: '/cashbox',
            icon: <Wallet2 className='size-4' />,
            url: '/cashbox',
            category: 'nav',
        });
    }

    if (canLeads) {
        baseCommands.push({
            id: 'nav-leads',
            title: t('nav.leads'),
            subtitle: '/leads',
            icon: <Funnel1 className='size-4' />,
            url: '/leads',
            category: 'nav',
        });
    }

    baseCommands.push({
        id: 'nav-schedule',
        title: t('nav.schedule'),
        subtitle: '/schedule',
        icon: <CalendarTime className='size-4' />,
        url: '/schedule',
        category: 'nav',
    });

    if (can(session, 'settings.manage')) {
        baseCommands.push({
            id: 'nav-settings',
            title: t('nav.settings'),
            subtitle: '/settings',
            icon: <Gear1 className='size-4' />,
            url: '/settings',
            category: 'nav',
        });
    }

    // Qidiruv bo'yicha filtrlangan buyruqlar
    const q = query.trim().toLowerCase();
    const filteredCommands = !q
        ? baseCommands
        : baseCommands.filter(
              (c) =>
                  c.title.toLowerCase().includes(q) ||
                  (c.subtitle && c.subtitle.toLowerCase().includes(q)),
          );

    // Barcha tanlanadigan elementlar ro'yxati (klaviatura navigatsiyasi uchun)
    const allSelectableItems: CommandItem[] = [...filteredCommands];

    students.forEach((student) => {
        allSelectableItems.push({
            id: `student-${student.id}`,
            title: fullName(student),
            subtitle: formatPhone(student.phone_number ?? student.parent_phone),
            icon: <UserCircle1 className='text-brand-accent size-4' />,
            tag: student.status,
            url: `/students/${student.id}`,
            category: 'student',
        });
    });

    groups.forEach((group) => {
        allSelectableItems.push({
            id: `group-${group.id}`,
            title: group.name,
            subtitle: group.course.name,
            icon: <OpenBook className='text-badge-violet-text size-4' />,
            url: `/groups/${group.id}`,
            category: 'group',
        });
    });

    leads.forEach((lead) => {
        allSelectableItems.push({
            id: `lead-${lead.id}`,
            title: [lead.last_name, lead.first_name].filter(Boolean).join(' '),
            subtitle: formatPhone(lead.phone_number),
            icon: <Funnel1 className='text-badge-warning-text size-4' />,
            tag: lead.status,
            url: `/leads?q=${encodeURIComponent(lead.phone_number)}`,
            category: 'lead',
        });
    });

    // Qidiruv so'rovi o'zgarganda tanlov indeksini 0 ga tushirish
    const handleQueryChange = (val: string) => {
        setQuery(val);
        setSelectedIndex(0);
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

    // API orqali server qidiruvi (Students, Groups, Leads)
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) return;

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
        }, 200);

        return () => clearTimeout(timer);
    }, [query, canStudents, canGroups, canLeads]);

    const itemsRef = useRef(allSelectableItems);
    useEffect(() => {
        itemsRef.current = allSelectableItems;
    });

    // Klaviatura boshqaruvi: ArrowDown, ArrowUp, Enter, Esc
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const items = itemsRef.current;
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev + 1 < items.length ? prev + 1 : 0,
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev - 1 >= 0 ? prev - 1 : items.length - 1,
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = items[selectedIndex];
                if (selected) {
                    executeItem(selected);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, handleClose, executeItem]);

    if (!open) return null;

    const hasResults =
        students.length > 0 || groups.length > 0 || leads.length > 0;
    const hasCommands = filteredCommands.length > 0;

    return (
        <div
            className='fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 sm:pt-20'
            role='dialog'
            aria-modal='true'
            aria-label={t('search.title')}
        >
            <div
                className='animate-in fade-in-0 fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200'
                aria-hidden='true'
                onClick={handleClose}
            />
            <div className='border-card-border bg-card-surface-area animate-in fade-in-0 zoom-in-95 relative z-10 flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all duration-200'>
                {/* Search Header Input */}
                <div className='border-card-border flex items-center gap-3 border-b px-4 py-3.5'>
                    <Search1 className='text-brand-accent size-5 shrink-0' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder='Qidirish yoki buyruq kiritish… (masalan: "tolov", "yangi")'
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
                        <kbd className='border-card-border bg-background-gray-secondary/70 text-text-tertiary hidden rounded-md border px-1.5 py-0.5 text-xs font-semibold sm:inline-block'>
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className='flex-1 scrollbar-thin overflow-y-auto p-3 sm:p-4'>
                    {loading && (
                        <div className='text-text-tertiary py-6 text-center text-sm font-medium'>
                            {t('search.searching')}
                        </div>
                    )}

                    {!loading &&
                        query.trim() &&
                        !hasResults &&
                        !hasCommands && (
                            <div className='text-text-tertiary py-10 text-center text-sm'>
                                {t('header.noResults')}
                            </div>
                        )}

                    {/* Tezkor buyruqlar va bo'limlar */}
                    {hasCommands && (
                        <div className='mb-4 space-y-1'>
                            <div className='text-text-tertiary mb-1.5 flex items-center justify-between px-2 text-xs font-semibold tracking-wider uppercase'>
                                <span>
                                    {query
                                        ? 'Mos buyruqlar'
                                        : 'Tezkor amallar & Bo‘limlar'}
                                </span>
                                <span className='text-text-tertiary text-[10px] font-normal lowercase'>
                                    ↑↓ yurish • ↵ ochish
                                </span>
                            </div>
                            <div className='space-y-0.5'>
                                {filteredCommands.map((cmd) => {
                                    const index = allSelectableItems.findIndex(
                                        (item) => item.id === cmd.id,
                                    );
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <button
                                            key={cmd.id}
                                            type='button'
                                            onClick={() => executeItem(cmd)}
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                            className={cn(
                                                'group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                                                isSelected
                                                    ? 'bg-brand-accent/10 text-brand-accent font-medium'
                                                    : 'hover:bg-background-gray-secondary text-text-primary',
                                            )}
                                        >
                                            <div className='flex min-w-0 items-center gap-3'>
                                                <span className='bg-card-surface-area border-card-border flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs'>
                                                    {cmd.icon}
                                                </span>
                                                <span className='truncate text-sm font-medium'>
                                                    {cmd.title}
                                                </span>
                                                {cmd.subtitle && (
                                                    <span className='text-text-tertiary hidden truncate text-xs sm:inline'>
                                                        {cmd.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex shrink-0 items-center gap-2'>
                                                {cmd.tag && (
                                                    <span className='bg-badge-neutral-background text-badge-neutral-text rounded-md px-1.5 py-0.5 text-[10px] font-semibold'>
                                                        {cmd.tag}
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <span className='text-brand-accent text-xs font-semibold'>
                                                        ↵
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Server natijalari: O'quvchilar */}
                    {students.length > 0 && (
                        <div className='mb-4 space-y-1'>
                            <div className='text-text-tertiary mb-1.5 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                <UserCircle1 className='size-4' />
                                <span>{t('header.studentsGroup')}</span>
                            </div>
                            <div className='space-y-0.5'>
                                {students.map((student) => {
                                    const item: CommandItem = {
                                        id: `student-${student.id}`,
                                        title: fullName(student),
                                        subtitle: formatPhone(
                                            student.phone_number ??
                                                student.parent_phone,
                                        ),
                                        icon: (
                                            <UserCircle1 className='text-brand-accent size-4' />
                                        ),
                                        tag: student.status,
                                        url: `/students/${student.id}`,
                                        category: 'student',
                                    };
                                    const index = allSelectableItems.findIndex(
                                        (i) => i.id === `student-${student.id}`,
                                    );
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <button
                                            key={student.id}
                                            type='button'
                                            onClick={() => executeItem(item)}
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                            className={cn(
                                                'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                                                isSelected
                                                    ? 'bg-brand-accent/10 text-brand-accent'
                                                    : 'hover:bg-background-gray-secondary',
                                            )}
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
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Server natijalari: Guruhlar */}
                    {groups.length > 0 && (
                        <div className='mb-4 space-y-1'>
                            <div className='text-text-tertiary mb-1.5 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                <OpenBook className='size-4' />
                                <span>{t('header.groupsGroup')}</span>
                            </div>
                            <div className='space-y-0.5'>
                                {groups.map((group) => {
                                    const item: CommandItem = {
                                        id: `group-${group.id}`,
                                        title: group.name,
                                        subtitle: group.course.name,
                                        icon: (
                                            <OpenBook className='text-badge-violet-text size-4' />
                                        ),
                                        url: `/groups/${group.id}`,
                                        category: 'group',
                                    };
                                    const index = allSelectableItems.findIndex(
                                        (i) => i.id === `group-${group.id}`,
                                    );
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <button
                                            key={group.id}
                                            type='button'
                                            onClick={() => executeItem(item)}
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                            className={cn(
                                                'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                                                isSelected
                                                    ? 'bg-brand-accent/10 text-brand-accent'
                                                    : 'hover:bg-background-gray-secondary',
                                            )}
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
                                                {t('schedule.studentsCount', {
                                                    count: group.students_count,
                                                })}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Server natijalari: Lidlar */}
                    {leads.length > 0 && (
                        <div className='mb-4 space-y-1'>
                            <div className='text-text-tertiary mb-1.5 flex items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase'>
                                <Funnel1 className='size-4' />
                                <span>{t('header.leadsGroup')}</span>
                            </div>
                            <div className='space-y-0.5'>
                                {leads.map((lead) => {
                                    const item: CommandItem = {
                                        id: `lead-${lead.id}`,
                                        title: [lead.last_name, lead.first_name]
                                            .filter(Boolean)
                                            .join(' '),
                                        subtitle: formatPhone(
                                            lead.phone_number,
                                        ),
                                        icon: (
                                            <Funnel1 className='text-badge-warning-text size-4' />
                                        ),
                                        tag: lead.status,
                                        url: `/leads?q=${encodeURIComponent(lead.phone_number)}`,
                                        category: 'lead',
                                    };
                                    const index = allSelectableItems.findIndex(
                                        (i) => i.id === `lead-${lead.id}`,
                                    );
                                    const isSelected = index === selectedIndex;

                                    return (
                                        <button
                                            key={lead.id}
                                            type='button'
                                            onClick={() => executeItem(item)}
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                            className={cn(
                                                'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                                                isSelected
                                                    ? 'bg-brand-accent/10 text-brand-accent'
                                                    : 'hover:bg-background-gray-secondary',
                                            )}
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
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer keyboard help */}
                <div className='border-card-border bg-background-gray-secondary/40 text-text-tertiary flex items-center justify-between border-t px-4 py-2 text-xs'>
                    <div className='flex items-center gap-3'>
                        <span>
                            <kbd className='border-card-border bg-card-surface-area rounded border px-1 py-0.5 text-[10px]'>
                                ↑↓
                            </kbd>{' '}
                            Navigatsiya
                        </span>
                        <span>
                            <kbd className='border-card-border bg-card-surface-area rounded border px-1 py-0.5 text-[10px]'>
                                ↵
                            </kbd>{' '}
                            Tanlash
                        </span>
                        <span>
                            <kbd className='border-card-border bg-card-surface-area rounded border px-1 py-0.5 text-[10px]'>
                                Esc
                            </kbd>{' '}
                            Yopish
                        </span>
                    </div>
                    <span className='hidden font-mono text-[10px] opacity-75 sm:inline'>
                        EDUMS Command Center
                    </span>
                </div>
            </div>
        </div>
    );
}
