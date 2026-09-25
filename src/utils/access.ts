import type { PermissionKey, Role, Session, User } from '@/types/api';

/**
 * Interfeys darajasidagi ruxsat tekshiruvi — menyu, sahifa va tugmalar shunga
 * qaraydi. Haqiqiy tekshiruv backenddagi PermissionsGuard'da; bu yerda faqat
 * foydalanuvchi bajara olmaydigan amallar yashiriladi.
 *
 * Ruxsatlar sessiyada `/auth/me` dan olinadi va har kirishda yangilanadi.
 * Super admin markaz ichida ishlamaydi, shuning uchun unda ruxsat yo'q.
 */
export function can(
    session: Session | null,
    ...permissions: PermissionKey[]
): boolean {
    if (session?.kind !== 'user') return false;
    if (session.is_owner) return true;
    return permissions.every((permission) =>
        session.permissions.includes(permission),
    );
}

export function isSuperAdmin(session: Session | null): boolean {
    return session?.kind === 'super_admin';
}

/**
 * Markaz obunasi amaldami. Tugagan bo'lsa backend profil va /billing dan
 * boshqa hamma joyda 402 qaytaradi — interfeys ham shu ikkisini qoldiradi.
 */
export function hasActiveSubscription(session: Session | null): boolean {
    return session?.kind === 'user' && session.subscription?.active === true;
}

/** Obuna tugaganda ham ochiq qoladigan sahifalar. */
export const PAGES_WITHOUT_SUBSCRIPTION = ['/billing', '/profile'];

/**
 * Sessiya egasining bosh sahifasi: super admin — markazlar, foydalanuvchi —
 * ruxsati yetadigan birinchi bo'lim, hech biri bo'lmasa profil.
 */
export function homeHref(session: Session | null): string {
    if (isSuperAdmin(session)) return '/overview';
    if (!hasActiveSubscription(session)) return '/billing';
    if (can(session, 'reports.view')) return '/dashboard';
    if (can(session, 'students.view')) return '/students';
    if (can(session, 'groups.view')) return '/groups';
    if (can(session, 'leads.view')) return '/leads';
    if (can(session, 'payments.view')) return '/cashbox';
    if (can(session, 'users.view')) return '/users';
    if (can(session, 'roles.view')) return '/roles';
    if (can(session, 'branches.view')) return '/branches';
    return '/profile';
}

/**
 * Backenddagi huquqni oshirishdan himoya qoidasining nusxasi: owner hamma
 * narsani qila oladi, qolganlar faqat o'zida bor ruxsatlar bilan ishlaydi.
 */
function coversAll(session: Session, permissions: PermissionKey[]): boolean {
    return (
        session.is_owner ||
        permissions.every((permission) =>
            session.permissions.includes(permission),
        )
    );
}

/** Rolni boshqa odamga biriktira oladimi (yoki rolni tahrirlay oladimi). */
export function canGrantRole(
    session: Session | null,
    role: Pick<Role, 'is_system' | 'permissions'>,
): boolean {
    if (session?.kind !== 'user') return false;
    if (role.is_system) return session.is_owner;
    return coversAll(session, role.permissions);
}

/**
 * Foydalanuvchini tahrirlay/o'chira oladimi: uning ruxsatlari sessiya
 * egasinikidan keng bo'lmasligi kerak. Foydalanuvchidagi rollarning
 * ruxsatlari to'liq rollar ro'yxatidan olinadi.
 */
export function canManageUser(
    session: Session | null,
    user: Pick<User, 'roles'>,
    allRoles: Role[],
): boolean {
    if (session?.kind !== 'user') return false;
    if (session.is_owner) return true;

    return user.roles.every((summary) => {
        const role = allRoles.find((item) => item.id === summary.id);
        return role !== undefined && canGrantRole(session, role);
    });
}
