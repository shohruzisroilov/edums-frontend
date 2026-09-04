import type { AccessRole } from '@/types/api';

/**
 * Interfeys darajasidagi rol to'plamlari — menyu va sahifa tugmalari shularga
 * qaraydi. Haqiqiy tekshiruv backend guard'larida; bu yerdagi ro'yxatlar
 * Swagger tavsiflaridan olingan:
 *
 * - filial ochish — owner huquqida, `education_id` ni faqat super admin yuboradi;
 * - filialga xodim qo'shish — owner va manager;
 * - o'quvchi qo'shish — administrator, manager va teacher (super admin qo'sha olmaydi);
 * - kurs va guruh uchun backend rol ro'yxatini e'lon qilmagan, shuning uchun
 *   faqat aniq vakolatli rollar ko'rsatiladi.
 */

export const ALL_ROLES: AccessRole[] = [
    'super_admin',
    'owner',
    'administrator',
    'manager',
    'teacher',
];

/** Tashkilot ichidagi rollar — super admin bundan tashqarida. */
export const ORG_ROLES: AccessRole[] = [
    'owner',
    'administrator',
    'manager',
    'teacher',
];

export const CAN_MANAGE_CENTERS: AccessRole[] = ['super_admin', 'owner'];

export const CAN_MANAGE_CENTER_STAFF: AccessRole[] = [
    'super_admin',
    'owner',
    'manager',
];

export const CAN_MANAGE_COURSES: AccessRole[] = [
    'super_admin',
    'owner',
    'administrator',
];

export const CAN_MANAGE_GROUPS: AccessRole[] = [
    'super_admin',
    'owner',
    'administrator',
    'manager',
];

/** Super admin o'quvchi qo'sha olmaydi — uni filialning o'zi ro'yxatga oladi. */
export const CAN_MANAGE_STUDENTS: AccessRole[] = [
    'owner',
    'administrator',
    'manager',
    'teacher',
];

/** GET /staff — owner butun tashkilotni, manager o'z filiallarini ko'radi. */
export const CAN_VIEW_STAFF: AccessRole[] = ['owner', 'manager'];
