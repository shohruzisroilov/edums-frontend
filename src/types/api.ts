/**
 * Backend (NestJS) entity va javob shakllarining aynan nusxasi.
 * Manba: https://api.edums.uz/api-docs (OpenAPI 3.0).
 *
 * Ierarxiya: Ta'lim tashkiloti (education) → filial (education_center)
 * → guruh (group) → o'quvchi (student). Kurslar tashkilot darajasida.
 */

/* ── Umumiy javob konvertlari ─────────────────────────────────────────── */

export interface DataResponse<T> {
    success: true;
    data: T;
}

export interface MessageResponse {
    success: true;
    message: string;
}

export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    count: number;
    limit: number;
    offset: number;
}

export interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string | string[];
    path: string;
    timestamp: string;
}

export interface PaginationQuery {
    limit?: number;
    offset?: number;
}

/* ── Enum'lar ─────────────────────────────────────────────────────────── */

/**
 * `owner` — tashkilot egasi, barcha filiallarni qamraydi.
 * Qolgan uch rol aniq filiallarga biriktiriladi.
 */
export const USER_ROLES = [
    'owner',
    'administrator',
    'manager',
    'teacher',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Super admin alohida jadvalda yashaydi — u UserRole emas. */
export type AccessRole = UserRole | 'super_admin';

/** Filialga biriktiriladigan rollar — owner bundan tashqarida. */
export const CENTER_STAFF_ROLES = [
    'administrator',
    'manager',
    'teacher',
] as const;
export type CenterStaffRole = (typeof CENTER_STAFF_ROLES)[number];

/** Tashkilot va filial bir xil holat to'plamiga ega. */
export const ENTITY_STATUSES = ['active', 'suspended', 'inactive'] as const;
export type EducationStatus = (typeof ENTITY_STATUSES)[number];
export type EducationCenterStatus = EducationStatus;
/** Eski nom — sahifalarda shu ro'yxat ishlatiladi. */
export const EDUCATION_CENTER_STATUSES = ENTITY_STATUSES;

export const COURSE_STATUSES = ['active', 'inactive'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const GROUP_STATUSES = ['active', 'finished', 'archived'] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

export const STUDENT_STATUSES = [
    'active',
    'frozen',
    'graduated',
    'left',
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
    'active',
    'replaced',
    'cancelled',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Dars kunlari — backend qisqartmalarni kutadi. */
export const WEEKDAYS = [
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/* ── Uploads ──────────────────────────────────────────────────────────── */

export interface Upload {
    id: string;
    filename: string;
    original_name: string;
    path: string;
    hash: string;
    mime_type: string;
    size: number;
    uploaded_by_id: string;
    uploaded_by_type: 'super_admin' | 'user';
    /** Backend @AfterLoad'da hisoblab beradi. */
    url: string;
    created_at: string;
    deleted_at: string | null;
}

/** POST /uploads javobi — mazmuni bir xil fayl qayta saqlanmaydi. */
export interface UploadResult extends Upload {
    is_duplicate: boolean;
}

export interface ListUploadsQuery extends PaginationQuery {
    search?: string;
    mime_type?: string;
    uploaded_by_id?: string;
}

export interface FileExists {
    path: string;
    url: string;
    exists: boolean;
    registered: boolean;
    on_disk: boolean;
}

/* ── Tariflar ─────────────────────────────────────────────────────────── */

export interface Tariff {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_days: number;
    /** null = cheksiz */
    max_students: number | null;
    /** null = cheksiz */
    max_teachers: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateTariffPayload {
    name: string;
    description?: string;
    price?: number;
    duration_days?: number;
    max_students?: number | null;
    max_teachers?: number | null;
    is_active?: boolean;
}

export type UpdateTariffPayload = Partial<CreateTariffPayload>;

export interface ListTariffsQuery extends PaginationQuery {
    search?: string;
    is_active?: boolean;
}

/* ── Obunalar ─────────────────────────────────────────────────────────── */

/**
 * Har bir obuna davri alohida yozuv: tarif nomi, narxi va limitlari o'sha
 * paytdagi holatida saqlanadi, shuning uchun tarif keyin tahrirlansa ham
 * tarix o'zgarmaydi.
 */
export interface EducationSubscription {
    id: string;
    education_id: string;
    tariff_id: string | null;
    tariff: Tariff | null;
    tariff_name: string;
    price: number;
    duration_days: number;
    max_students: number | null;
    max_teachers: number | null;
    starts_at: string;
    ends_at: string;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
}

/* ── Ta'lim tashkilotlari ─────────────────────────────────────────────── */

export interface Education {
    id: string;
    name: string;
    phone_number: string;
    logo_id: string | null;
    logo: Upload | null;
    status: EducationStatus;
    /** Joriy obuna — tarif butun tashkilotga, barcha filiallariga tegishli. */
    current_subscription: EducationSubscription | null;
    centers: EducationCenter[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateEducationPayload {
    name: string;
    /** +998XXXXXXXXX */
    phone_number: string;
    logo_id?: string | null;
    status?: EducationStatus;
    /** Yuborilsa obuna shu zahoti boshlanadi. */
    tariff_id?: string;
}

/** Tarif bu yerda o'zgartirilmaydi — PATCH /educations/:id/tariff ishlatiladi. */
export interface UpdateEducationPayload {
    name?: string;
    phone_number?: string;
    logo_id?: string | null;
    status?: EducationStatus;
}

export interface ListEducationsQuery extends PaginationQuery {
    search?: string;
    status?: EducationStatus;
    tariff_id?: string;
}

/** Owner tashkilot orqali yaratiladi — rol va tashkilot URL'dan olinadi. */
export interface CreateEducationOwnerPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
}

/* ── Filiallar ────────────────────────────────────────────────────────── */

export interface EducationCenter {
    id: string;
    education_id: string;
    education?: Education | null;
    name: string;
    phone_number: string;
    address: string | null;
    working_hours: string | null;
    status: EducationCenterStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateEducationCenterPayload {
    name: string;
    /** +998XXXXXXXXX */
    phone_number: string;
    address?: string;
    working_hours?: string;
    status?: EducationCenterStatus;
    /** Faqat super admin yuboradi; owner uchun tokendan olinadi. */
    education_id?: string;
}

export type UpdateEducationCenterPayload = Partial<
    Omit<CreateEducationCenterPayload, 'education_id'>
>;

export interface ListEducationCentersQuery extends PaginationQuery {
    search?: string;
    status?: EducationCenterStatus;
    education_id?: string;
}

/** Filialga yangi xodim — rol filial darajasidagilardan tanlanadi. */
export interface CreateCenterStaffPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    role: CenterStaffRole;
}

/* ── Kurslar ──────────────────────────────────────────────────────────── */

export interface Course {
    id: string;
    education_id: string;
    name: string;
    description: string | null;
    duration_months: number | null;
    price: number;
    level: string | null;
    status: CourseStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateCoursePayload {
    name: string;
    description?: string;
    duration_months?: number | null;
    price?: number;
    level?: string;
    status?: CourseStatus;
    /** Faqat super admin yuboradi. */
    education_id?: string;
}

export type UpdateCoursePayload = Partial<
    Omit<CreateCoursePayload, 'education_id'>
>;

export interface ListCoursesQuery extends PaginationQuery {
    search?: string;
    status?: CourseStatus;
    education_id?: string;
}

/* ── Guruhlar ─────────────────────────────────────────────────────────── */

export interface Group {
    id: string;
    education_center_id: string;
    education_center?: EducationCenter | null;
    course_id: string;
    course?: Course | null;
    teacher_id: string | null;
    teacher: User | null;
    name: string;
    weekdays: Weekday[];
    /** HH:MM */
    start_time: string;
    end_time: string;
    room: string | null;
    status: GroupStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateGroupPayload {
    name: string;
    course_id: string;
    weekdays: Weekday[];
    /** HH:MM */
    start_time: string;
    end_time: string;
    teacher_id?: string | null;
    room?: string;
    status?: GroupStatus;
    /** Filialni faqat super admin va owner tanlaydi. */
    education_center_id?: string;
}

/** Filial o'zgartirilmaydi — guruhni ko'chirish o'quvchilarni ham ko'chiradi. */
export type UpdateGroupPayload = Partial<
    Omit<CreateGroupPayload, 'education_center_id'>
>;

export interface ListGroupsQuery extends PaginationQuery {
    search?: string;
    status?: GroupStatus;
    course_id?: string;
    teacher_id?: string;
    weekday?: Weekday;
    education_center_id?: string;
}

/* ── Foydalanuvchilar (xodimlar) ──────────────────────────────────────── */

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: UserRole;
    avatar_id: string | null;
    avatar: Upload | null;
    education_id: string | null;
    education: Education | null;
    /** Owner uchun bo'sh — u barcha filiallarni qamraydi. */
    education_centers: EducationCenter[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateUserPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    role: UserRole;
    /** owner uchun majburiy. */
    education_id?: string;
    /** administrator, manager, teacher uchun — bitta yoki bir nechta filial. */
    education_center_ids?: string[];
    avatar_id?: string | null;
}

/**
 * Backend role, education_id va filial biriktiruvini bu yerda o'zgartirmaydi
 * — filiallar /education_centers/:id/staff/:user_id orqali boshqariladi.
 */
export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    password?: string;
    avatar_id?: string | null;
    is_active?: boolean;
}

export interface ListUsersQuery extends PaginationQuery {
    search?: string;
    role?: UserRole;
    education_id?: string;
    education_center_id?: string;
    is_active?: boolean;
}

/** GET /staff — tashkilot ichidagi xodimlar; query shakli /users bilan bir xil. */
export type ListStaffQuery = ListUsersQuery;

/* ── O'quvchilar ──────────────────────────────────────────────────────── */

export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    /** YYYY-MM-DD */
    birth_date: string | null;
    address: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    avatar_id: string | null;
    avatar: Upload | null;
    status: StudentStatus;
    group_id: string;
    group?: Group | null;
    education_center_id: string;
    education_center?: EducationCenter | null;
    created_by_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateStudentPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    birth_date?: string;
    address?: string;
    parent_name?: string;
    parent_phone?: string;
    avatar_id?: string | null;
    status?: StudentStatus;
    /** Filial guruhdan aniqlanadi — o'quvchi doim guruhga yoziladi. */
    group_id: string;
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>;

export interface ListStudentsQuery extends PaginationQuery {
    search?: string;
    status?: StudentStatus;
    education_center_id?: string;
    group_id?: string;
    birth_date_from?: string;
}

/* ── Autentifikatsiya ─────────────────────────────────────────────────── */

export interface AuthUser {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: UserRole;
    education_id: string | null;
    education_center_ids: string[];
    avatar_id: string | null;
    avatar_url: string | null;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: AuthUser;
}

export interface SuperAdminSummary {
    id: string;
    phone_number: string;
}

export interface SuperAdminLoginResponse {
    success: boolean;
    token: string;
    super_admin: SuperAdminSummary;
}

export interface VerifyTokenResponse {
    valid: boolean;
    id: string;
    phone_number: string;
}

/** Frontend'dagi birlashgan sessiya — ikkala login turini ham qamraydi. */
export interface Session {
    token: string;
    role: AccessRole;
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    education_id: string | null;
    /** Owner va super admin uchun bo'sh — ular filial bilan cheklanmagan. */
    education_center_ids: string[];
    avatar_url: string | null;
}

/* ── Servis holati ────────────────────────────────────────────────────── */

export interface HealthStatus {
    success: boolean;
    message: string;
    timestamp: string;
    database: { connected: boolean };
}

/* ── Statistika ───────────────────────────────────────────────────────── */

export interface SystemStatistics {
    educations: {
        total: number;
        active: number;
        suspended: number;
        inactive: number;
    };
    education_centers: {
        total: number;
        active: number;
        suspended: number;
        inactive: number;
        average_per_education: number;
    };
    tariffs: { total: number; active: number; inactive: number };
    users: { total: number; by_role: Record<string, number> };
    students: { total: number; active: number };
    subscriptions: { expiring_within_days: number; expiring_soon: number };
    educations_by_tariff: { tariff_name: string; count: number }[];
    recent_educations: {
        id: string;
        name: string;
        status: string;
        created_at: string;
    }[];
    generated_at: string;
}
