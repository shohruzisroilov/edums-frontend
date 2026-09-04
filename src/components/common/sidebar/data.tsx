import type { TranslationKey } from '@/i18n/dictionaries/uz';
import type { AccessRole } from '@/types/api';
import { ALL_ROLES, CAN_VIEW_STAFF, ORG_ROLES } from '@/utils/access';
import {
    Buildings11,
    DashboardSquare1,
    Folder1,
    IdCard,
    OpenBook,
    Shop,
    User2,
    UserMultiple1,
    UserMultiple4,
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
                roles: ALL_ROLES,
            },
            {
                titleKey: 'nav.groups',
                url: '/groups',
                icon: <UserMultiple4 className='size-5' />,
                roles: ALL_ROLES,
            },
            {
                titleKey: 'nav.courses',
                url: '/courses',
                icon: <OpenBook className='size-5' />,
                roles: ALL_ROLES,
            },
        ],
    },
    {
        labelKey: 'nav.organization',
        items: [
            {
                titleKey: 'nav.centers',
                url: '/education-centers',
                icon: <Shop className='size-5' />,
                roles: ALL_ROLES,
            },
            {
                titleKey: 'nav.staff',
                url: '/staff',
                icon: <IdCard className='size-5' />,
                roles: CAN_VIEW_STAFF,
            },
            {
                titleKey: 'nav.uploads',
                url: '/uploads',
                icon: <Folder1 className='size-5' />,
                roles: ALL_ROLES,
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

/** Tashkilot xodimlari uchun bosh sahifa — o'quvchilar ro'yxati. */
export function homeHrefForRole(role: AccessRole | undefined): string {
    return role && ORG_ROLES.includes(role) ? '/students' : '/';
}
