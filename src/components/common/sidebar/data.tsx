import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { Session } from '@/types/api';
import { can, isSuperAdmin } from '@/utils/access';
import {
    Buildings11,
    CalendarTime,
    CreditCard,
    Gear1,
    MapMarker5,
    Message1,
    OpenBook,
    Shield1Check,
    User2,
    UserMultiple1,
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
        labelKey: 'nav.learning',
        items: [
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
                titleKey: 'nav.courses',
                url: '/courses',
                icon: <OpenBook className='size-5' />,
                visible: (session) => can(session, 'courses.view'),
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
                titleKey: 'nav.billing',
                url: '/billing',
                icon: <Wallet2 className='size-5' />,
                visible: (session) => can(session, 'billing.manage'),
            },
        ],
    },
    {
        labelKey: 'nav.superAdmin',
        items: [
            {
                titleKey: 'nav.educations',
                url: '/educations',
                icon: <Buildings11 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.tariffs',
                url: '/tariffs',
                icon: <Wallet2 className='size-5' />,
                visible: isSuperAdmin,
            },
            {
                titleKey: 'nav.payments',
                url: '/payments',
                icon: <CreditCard className='size-5' />,
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
