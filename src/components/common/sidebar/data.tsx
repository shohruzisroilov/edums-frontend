import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { AccessRole } from '@/types/api';
import {
    Buildings11,
    DashboardSquare1,
    User2,
    UserMultiple1,
    Wallet2,
} from '@tailgrids/icons';
import type { ReactNode } from 'react';

export interface NavLink {
    /** Tarjima kaliti — matn render paytida tanlanadi. */
    titleKey: TranslationKey;
    url: string;
    icon: ReactNode;
    /** Shu rollarga ko'rinadi. Backenddagi guard'lar bilan mos. */
    roles: AccessRole[];
}

export interface NavSection {
    labelKey: TranslationKey;
    items: NavLink[];
}

const ALL_STAFF: AccessRole[] = [
    'super_admin',
    'center_admin',
    'manager',
    'teacher',
];

const NAV_DATA: NavSection[] = [
    {
        labelKey: 'nav.main',
        items: [
            {
                titleKey: 'nav.dashboard',
                url: '/',
                icon: <DashboardSquare1 className='size-5' />,
                // /api/statistics faqat super admin uchun ochiq.
                roles: ['super_admin'],
            },
            {
                titleKey: 'nav.students',
                url: '/students',
                icon: <UserMultiple1 className='size-5' />,
                roles: ALL_STAFF,
            },
        ],
    },
    {
        labelKey: 'nav.superAdmin',
        items: [
            {
                titleKey: 'nav.centers',
                url: '/education-centers',
                icon: <Buildings11 className='size-5' />,
                roles: ['super_admin'],
            },
            {
                titleKey: 'nav.tariffs',
                url: '/tariffs',
                icon: <Wallet2 className='size-5' />,
                roles: ['super_admin'],
            },
            {
                titleKey: 'nav.users',
                url: '/users',
                icon: <User2 className='size-5' />,
                roles: ['super_admin'],
            },
        ],
    },
];

/** Rolga ko'ra menyuni filtrlaydi; bo'sh bo'lib qolgan bo'limlar tushib qoladi. */
export function navSectionsForRole(role: AccessRole | undefined): NavSection[] {
    if (!role) return [];

    return NAV_DATA.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.roles.includes(role)),
    })).filter((section) => section.items.length > 0);
}
