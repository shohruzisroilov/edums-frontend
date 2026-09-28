import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { Session } from '@/types/api';
import { can, isSuperAdmin } from '@/utils/access';
import {
    Bank1,
    Buildings11,
    CalendarTime,
    CreditCard,
    Crown1,
    DashboardSquare1,
    FileText,
    Funnel1,
    Gear1,
    MapMarker5,
    Message1,
    OpenBook,
    SackDollar,
    Shield1Check,
    SlidersDoubleHorizontal,
    TrendUp2,
    User2,
    UserCircle1,
    UserMultiple1,
    UserPencil,
    Wallet2,
} from '@tailgrids/icons';
import type { ReactNode } from 'react';

interface NavLink {
    /** Tarjima kaliti — matn render paytida tanlanadi. */
    titleKey: TranslationKey;
    url: string;
    icon: ReactNode;
    /** Shu sessiyaga ko'rinadimi. Backenddagi ruxsatlar bilan mos. */
    visible: (session: Session) => boolean;
}

interface NavSection {
    labelKey: TranslationKey;
    items: NavLink[];
}

const NAV_DATA: NavSection[] = [
    {
        labelKey: 'nav.main',
        items: [
            {
                titleKey: 'nav.dashboard',
                url: '/dashboard',
                icon: <DashboardSquare1 className='size-5' />,
                visible: (session) => can(session, 'reports.view'),
            },
        ],
    },
    {
        labelKey: 'nav.learning',
        items: [
            {
                titleKey: 'nav.students',
                url: '/students',
                icon: <UserCircle1 className='size-5' />,
                visible: (session) => can(session, 'students.view'),
            },
            {
                titleKey: 'nav.groups',
                url: '/groups',
                icon: <UserMultiple1 className='size-5' />,
                visible: (session) => can(session, 'groups.view'),
            },
            {
                titleKey: 'nav.schedule',
                url: '/schedule',
                icon: <CalendarTime className='size-5' />,
                visible: (session) => can(session, 'groups.view'),
            },
            {
                titleKey: 'nav.leads',
                url: '/leads',
                icon: <Funnel1 className='size-5' />,
                visible: (session) => can(session, 'leads.view'),
            },
            {
                titleKey: 'nav.courses',
                url: '/courses',
                icon: <OpenBook className='size-5' />,
                visible: (session) => can(session, 'courses.view'),
            },
        ],
    },
    {
        labelKey: 'nav.finance',
        items: [
            {
                titleKey: 'nav.cashbox',
                url: '/cashbox',
                icon: <Wallet2 className='size-5' />,
                visible: (session) => can(session, 'payments.view'),
            },
            {
                titleKey: 'nav.debtors',
                url: '/debtors',
                icon: <SackDollar className='size-5' />,
                visible: (session) => can(session, 'payments.view'),
            },
            {
                titleKey: 'nav.expenses',
                url: '/expenses',
                icon: <Bank1 className='size-5' />,
                visible: (session) => can(session, 'expenses.view'),
            },
            {
                titleKey: 'nav.salaries',
                url: '/salaries',
                icon: <UserPencil className='size-5' />,
                visible: (session) => can(session, 'salaries.view'),
            },
        ],
    },
    {
        labelKey: 'nav.management',
        items: [
            {
                titleKey: 'nav.users',
                url: '/users',
                icon: <User2 className='size-5' />,
                visible: (session) => can(session, 'users.view'),
            },
            {
                titleKey: 'nav.roles',
                url: '/roles',
                icon: <Shield1Check className='size-5' />,
                visible: (session) => can(session, 'roles.view'),
            },
            {
                titleKey: 'nav.branches',
                url: '/branches',
                icon: <MapMarker5 className='size-5' />,
                visible: (session) => can(session, 'branches.view'),
            },
            {
                titleKey: 'nav.audit',
                url: '/audit',
                icon: <FileText className='size-5' />,
                visible: (session) => can(session, 'audit.view'),
            },
            {
                titleKey: 'nav.settings',
                url: '/settings',
                icon: <SlidersDoubleHorizontal className='size-5' />,
                visible: (session) => can(session, 'settings.manage'),
            },
            {
                titleKey: 'nav.billing',
                url: '/billing',
                icon: <CreditCard className='size-5' />,
                visible: (session) => can(session, 'billing.manage'),
            },
        ],
    },
    {
        labelKey: 'nav.superAdmin',
        items: [
            {
                titleKey: 'nav.overview',
                url: '/overview',
                icon: <TrendUp2 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.educations',
                url: '/educations',
                icon: <Buildings11 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.tariffs',
                url: '/tariffs',
                icon: <Crown1 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.payments',
                url: '/payments',
                icon: <Wallet2 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.smsSettings',
                url: '/sms-settings',
                icon: <Message1 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.platformSettings',
                url: '/platform-settings',
                icon: <Gear1 className='size-5' />,
                visible: isSuperAdmin,
            },
        ],
    },
];

/** Sessiyaga ko'ra menyuni filtrlaydi; bo'sh qolgan bo'limlar tushib qoladi. */
export function navSectionsFor(session: Session | null): NavSection[] {
    if (!session) return [];

    return NAV_DATA.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.visible(session)),
    })).filter((section) => section.items.length > 0);
}
