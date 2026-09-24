/**
 * Backend (NestJS) entity va javob shakllarining aynan nusxasi.
 * Manba: `../edums-backend` Swagger (`/api-docs`) va `docs/TZ.md`.
 *
 * Tizim ko'p markazli: super admin o'quv markazlarni (education) yaratadi,
 * har bir markaz ichida esa foydalanuvchilar va dinamik rollar yashaydi.
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

interface PaginationQuery {
    limit?: number;
    offset?: number;
}

/* ── Ruxsatlar ────────────────────────────────────────────────────────── */

/**
 * Backenddagi `PERMISSION_CATALOG` nusxasi. Katalogning o'zi GET /permissions
 * dan keladi; bu ro'yxat faqat TypeScript tipi va lug'at kalitlari uchun.
 * Backendga yangi ruxsat qo'shilsa, shu yerga va lug'atlarga ham qo'shing.
 */
export const PERMISSION_KEYS = [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'roles.view',
    'roles.create',
    'roles.update',
    'roles.delete',
    'billing.manage',
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionModule = 'users' | 'roles' | 'billing';

/** GET /permissions — modul bo'yicha guruhlangan katalog. */
export interface PermissionGroup {
    module: PermissionModule;
    permissions: PermissionKey[];
}

/* ── Enum'lar ─────────────────────────────────────────────────────────── */

export const EDUCATION_STATUSES = ['active', 'suspended', 'inactive'] as const;
export type EducationStatus = (typeof EDUCATION_STATUSES)[number];

export type SubscriptionKind = 'trial' | 'paid';

export const PAYMENT_REQUEST_STATUSES = [
    'pending',
    'approved',
    'rejected',
    'cancelled',
] as const;
export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number];

/* ── Tariflar va obuna ────────────────────────────────────────────────── */

export interface Tariff {
    id: string;
    name: string;
    description: string | null;
    /** So'm */
    price: number;
    duration_days: number;
    /** null — cheksiz */
    max_users: number | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface TariffPayload {
    name: string;
    description?: string | null;
    price: number;
    duration_days: number;
    max_users?: number | null;
    is_active?: boolean;
    sort_order?: number;
}

/** Markaz hozir tizimdan foydalana oladimi va qachongacha. */
export interface SubscriptionStatus {
    /** false — faqat profil va /billing ochiq, qolgani 402. */
    active: boolean;
    kind: SubscriptionKind | null;
    tariff_name: string | null;
    /** Oldindan to'langan davrlar bilan birga. */
    ends_at: string | null;
    days_left: number;
    max_users: number | null;
}

/** Bitta davr: sinov yoki pulli tarif. */
export interface Subscription {
    id: string;
    education_id: string;
    kind: SubscriptionKind;
    tariff_id: string | null;
    tariff_name: string | null;
    price: number;
    max_users: number | null;
    starts_at: string;
    ends_at: string;
    created_at: string;
}

export interface PaymentRequest {
    id: string;
    education_id: string;
    /** Faqat super admin ro'yxatida keladi. */
    education?: Education;
    tariff_id: string | null;
    tariff_name: string;
    price: number;
    duration_days: number;
    max_users: number | null;
    status: PaymentRequestStatus;
    requested_by_id: string | null;
    /** Rad etish sababi. */
    note: string | null;
    reviewed_at: string | null;
    created_at: string;
}

/** GET /billing — tarif tanlash sahifasi uchun hamma narsa. */
export interface BillingOverview {
    subscription: SubscriptionStatus;
    tariffs: Tariff[];
    requests: PaymentRequest[];
    history: Subscription[];
    payment_instructions: string;
}

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
}

/** POST /uploads javobi — mazmuni bir xil fayl qayta saqlanmaydi. */
export interface UploadResult extends Upload {
    is_duplicate: boolean;
}

/* ── O'quv markazlar (super admin) ────────────────────────────────────── */

export interface Education {
    id: string;
    name: string;
    phone_number: string;
    logo_id: string | null;
    logo: Upload | null;
    /** `active` bo'lmasa markaz foydalanuvchilari tizimga kira olmaydi. */
    status: EducationStatus;
    /** Super admin javoblarida keladi. */
    subscription?: SubscriptionStatus;
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
}

export type UpdateEducationPayload = Partial<CreateEducationPayload>;

export interface ListEducationsQuery extends PaginationQuery {
    search?: string;
    status?: EducationStatus;
}

/** Owner markaz orqali yaratiladi — Owner roli avtomatik biriktiriladi. */
export interface CreateEducationOwnerPayload {
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
}

/* ── Rollar ───────────────────────────────────────────────────────────── */

export interface Role {
    id: string;
    name: string;
    description: string | null;
    /** Owner roli — barcha ruxsatlar, tahrirlanmaydi va o'chirilmaydi. */
    is_system: boolean;
    permissions: PermissionKey[];
    users_count: number;
    created_at: string;
    updated_at: string;
}

/** Foydalanuvchi ichida keladigan qisqa rol — ruxsatlarsiz. */
export interface RoleSummary {
    id: string;
    name: string;
    is_system: boolean;
}

export interface CreateRolePayload {
    name: string;
    description?: string | null;
    permissions: PermissionKey[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

/* ── Foydalanuvchilar ─────────────────────────────────────────────────── */

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    avatar_id: string | null;
    avatar: Upload | null;
    education_id: string;
    roles: RoleSummary[];
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
    /** Kamida bitta. */
    role_ids: string[];
    avatar_id?: string | null;
}

/** Parol alohida endpoint orqali — PATCH /users/:id/password. */
export interface UpdateUserPayload {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role_ids?: string[];
    avatar_id?: string | null;
    is_active?: boolean;
}

export interface ListUsersQuery extends PaginationQuery {
    search?: string;
    role_id?: string;
    is_active?: boolean;
}

/* ── Autentifikatsiya ─────────────────────────────────────────────────── */

export interface AuthUser {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    education: { id: string; name: string; logo_url: string | null };
    roles: RoleSummary[];
    /** Owner roliga ega — barcha ruxsatlar. */
    is_owner: boolean;
    /** Barcha rollardagi ruxsatlar birlashmasi. */
    permissions: PermissionKey[];
    subscription: SubscriptionStatus;
    avatar_id: string | null;
    avatar_url: string | null;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: AuthUser;
}

export interface RegisterPayload {
    education_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    /** SMS dagi 6 xonali kod. */
    code: string;
}

export interface SendCodeResponse {
    success: boolean;
    /** Kod necha soniya amal qiladi. */
    expires_in: number;
    /** Qayta yuborish uchun kutish (soniya). */
    resend_in: number;
}

export interface UpdateOwnProfilePayload {
    first_name?: string;
    last_name?: string;
    avatar_id?: string | null;
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

/**
 * Frontend'dagi birlashgan sessiya — ikkala login turini ham qamraydi.
 * Super admin uchun `education`, `roles`, `permissions` va `subscription`
 * bo'sh: u markaz ichida ishlamaydi.
 */
export interface Session {
    token: string;
    kind: 'super_admin' | 'user';
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    education: { id: string; name: string } | null;
    roles: RoleSummary[];
    is_owner: boolean;
    permissions: PermissionKey[];
    subscription: SubscriptionStatus | null;
}
