/**
 * Backend (NestJS) entity va javob shakllarining aynan nusxasi.
 * Manba: edums-backend/src/**\/entities va dtos.
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

export const USER_ROLES = ['center_admin', 'manager', 'teacher'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Super admin alohida jadvalda yashaydi — u UserRole emas. */
export type AccessRole = UserRole | 'super_admin';

export const EDUCATION_CENTER_STATUSES = [
    'active',
    'suspended',
    'inactive',
] as const;
export type EducationCenterStatus = (typeof EDUCATION_CENTER_STATUSES)[number];

export const STUDENT_STATUSES = [
    'active',
    'frozen',
    'graduated',
    'left',
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

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

/* ── O'quv markazlari ─────────────────────────────────────────────────── */

export interface EducationCenter {
    id: string;
    name: string;
    phone_number: string;
    address: string | null;
    logo_id: string | null;
    logo: Upload | null;
    telegram: string | null;
    instagram: string | null;
    status: EducationCenterStatus;
    tariff_id: string | null;
    tariff: Tariff | null;
    subscription_ends_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateEducationCenterPayload {
    name: string;
    /** +998XXXXXXXXX */
    phone_number: string;
    address?: string;
    logo_id?: string | null;
    telegram?: string;
    instagram?: string;
    status?: EducationCenterStatus;
    tariff_id?: string;
}

export type UpdateEducationCenterPayload =
    Partial<CreateEducationCenterPayload>;

export interface ListEducationCentersQuery extends PaginationQuery {
    search?: string;
    status?: EducationCenterStatus;
    tariff_id?: string;
}

/** Markaz admini markaz orqali yaratiladi — role va markaz URL'dan olinadi. */
export interface CreateCenterAdminPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
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
    education_center_id: string | null;
    education_center: EducationCenter | null;
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
    education_center_id?: string;
    avatar_id?: string | null;
}

/** Backend role va education_center_id'ni bu yerda o'zgartirtirmaydi. */
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
    education_center_id?: string;
    is_active?: boolean;
}

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
    /** Faqat super admin yuboradi; markaz xodimlariniki tokendan olinadi. */
    education_center_id?: string;
}

export type UpdateStudentPayload = Partial<
    Omit<CreateStudentPayload, 'education_center_id'>
>;

export interface ListStudentsQuery extends PaginationQuery {
    search?: string;
    status?: StudentStatus;
    education_center_id?: string;
    birth_date_from?: string;
}

/* ── Autentifikatsiya ─────────────────────────────────────────────────── */

export interface AuthUser {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: UserRole;
    education_center_id: string | null;
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
    education_center_id: string | null;
    avatar_url: string | null;
}

/* ── Statistika ───────────────────────────────────────────────────────── */

export interface SystemStatistics {
    education_centers: {
        total: number;
        active: number;
        suspended: number;
        inactive: number;
    };
    tariffs: { total: number; active: number; inactive: number };
    users: { total: number; by_role: Record<string, number> };
    students: { total: number; active: number };
    subscriptions: { expiring_within_days: number; expiring_soon: number };
    centers_by_tariff: { tariff_name: string; count: number }[];
    recent_centers: {
        id: string;
        name: string;
        status: string;
        created_at: string;
    }[];
    generated_at: string;
}
