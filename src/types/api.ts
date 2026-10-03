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
    'branches.view',
    'branches.create',
    'branches.update',
    'branches.delete',
    'courses.view',
    'courses.create',
    'courses.update',
    'courses.delete',
    'groups.view',
    'groups.view_own',
    'groups.create',
    'groups.update',
    'groups.delete',
    'students.view',
    'students.view_own',
    'students.create',
    'students.update',
    'students.delete',
    'leads.view',
    'leads.create',
    'leads.update',
    'leads.delete',
    'payments.view',
    'payments.create',
    'payments.delete',
    'attendance.view',
    'attendance.view_own',
    'attendance.mark',
    'attendance.mark_own',
    'audit.view',
    'settings.manage',
    'reports.view',
    'reports.view_own',
    'expenses.view',
    'expenses.manage',
    'salaries.view',
    'salaries.manage',
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionModule =
    | 'users'
    | 'roles'
    | 'billing'
    | 'branches'
    | 'courses'
    | 'groups'
    | 'students'
    | 'leads'
    | 'payments'
    | 'attendance'
    | 'audit'
    | 'settings'
    | 'reports'
    | 'expenses'
    | 'salaries';

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
    max_students: number | null;
    max_users?: number | null;
    /** Yillik xarid chegirmasi (%); null — tarif yillik sotilmaydi. */
    yearly_discount_percent: number | null;
    /** Bir yil (365 kun) narxi — backend hisoblaydi; null — yillik yo'q. */
    yearly_price: number | null;
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
    max_students?: number | null;
    max_users?: number | null;
    yearly_discount_percent?: number | null;
    is_active?: boolean;
    sort_order?: number;
}

/** Tarif qanday muddatga sotib olinadi. */
export const BILLING_PERIODS = ['month', 'year'] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

/** Markaz hozir tizimdan foydalana oladimi va qachongacha. */
export interface SubscriptionStatus {
    /** false — faqat profil va /billing ochiq, qolgani 402. */
    active: boolean;
    kind: SubscriptionKind | null;
    tariff_name: string | null;
    /** Oldindan to'langan davrlar bilan birga. */
    ends_at: string | null;
    days_left: number;
    max_students: number | null;
    max_users?: number | null;
}

/** Bitta davr: sinov yoki pulli tarif. */
export interface Subscription {
    id: string;
    education_id: string;
    kind: SubscriptionKind;
    tariff_id: string | null;
    tariff_name: string | null;
    price: number;
    max_students: number | null;
    max_users?: number | null;
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
    max_students: number | null;
    max_users?: number | null;
    /** year — bir yillik (365 kun) xarid. */
    period: BillingPeriod;
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

/* ── SMS sozlamalari ──────────────────────────────────────────────────── */

export type SmsDriver = 'eskiz' | 'devsms' | 'console';

/** GET /sms-settings — parol va tokenlarning o'zi hech qachon kelmaydi. */
export interface SmsSettings {
    driver: SmsDriver;
    eskiz_email: string | null;
    has_eskiz_password: boolean;
    eskiz_from: string;
    has_devsms_token: boolean;
    devsms_from: string;
    template: string;
    /** Avtomatik xabarlarning umumiy kaliti (eslatmalar, kelmaganlik). */
    notifications_enabled: boolean;
    /** {education}, {days} */
    subscription_template: string;
    /** {education}, {student}, {group}, {amount} */
    debt_template: string;
    /** {education}, {student}, {group}, {date} */
    absence_template: string;
    updated_at: string;
}

export interface SmsSettingsPayload {
    driver: SmsDriver;
    eskiz_email?: string | null;
    /** Bo'sh yoki yo'q bo'lsa — saqlangan parol o'zgarmaydi. */
    eskiz_password?: string;
    eskiz_from?: string;
    /** Bo'sh yoki yo'q bo'lsa — saqlangan DevSMS token o'zgarmaydi. */
    devsms_token?: string;
    devsms_from?: string;
    template: string;
    notifications_enabled?: boolean;
    subscription_template?: string;
    debt_template?: string;
    absence_template?: string;
}

/* ── Markaz sozlamalari ───────────────────────────────────────────────── */

export interface EducationSettings {
    /** Bugun kelmagan o'quvchining ota-onasiga SMS. */
    notify_absence: boolean;
    /** Har oyning 5-kuni qarzdorlarning ota-onasiga SMS. */
    notify_debtors: boolean;
    /** Super admin avtomatik xabarlarni o'chirib qo'ygan bo'lsa false. */
    notifications_available: boolean;
    updated_at: string;
}

export type EducationSettingsPayload = Partial<
    Pick<EducationSettings, 'notify_absence' | 'notify_debtors'>
>;

/** Markaz saytidagi forma. `null` — o'chirilgan, saytdan lid kelmaydi. */
export interface LeadForm {
    /** Saytga qo'yiladigan kalit — sir emas, faqat lid qo'sha oladi. */
    key: string;
    created_at: string;
    /** Joriy kalit berilgan vaqt. */
    updated_at: string;
}

/* ── Platforma sozlamalari (super admin) ──────────────────────────────── */

export interface PlatformSettings {
    /** Yangi markazning bepul sinov muddati (kun). */
    trial_days: number;
    /** Tarif tanlash sahifasida ko'rsatiladi. */
    payment_instructions: string;
    updated_at: string;
}

export interface PlatformSettingsPayload {
    trial_days: number;
    payment_instructions: string;
}

/** GET /platform-settings/public — login talab qilinmaydi. */
export interface PublicPlatformSettings {
    trial_days: number;
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

/* ── Filiallar ────────────────────────────────────────────────────────── */

export interface Branch {
    id: string;
    education_id: string;
    name: string;
    address: string | null;
    phone_number: string | null;
    /** Nofaol filial yangi guruh va o'quvchilar uchun tanlanmaydi. */
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BranchPayload {
    name: string;
    address?: string | null;
    phone_number?: string | null;
    is_active?: boolean;
}

/* ── Xonalar ──────────────────────────────────────────────────────────── */

export interface Room {
    id: string;
    education_id: string;
    branch_id: string;
    name: string;
    capacity: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateRoomPayload {
    branch_id: string;
    name: string;
    capacity?: number | null;
    is_active?: boolean;
}

/** Xona filialini o'zgartirib bo'lmaydi. */
export type UpdateRoomPayload = Partial<Omit<CreateRoomPayload, 'branch_id'>>;

/* ── Kurslar ──────────────────────────────────────────────────────────── */

export interface Course {
    id: string;
    education_id: string;
    name: string;
    description: string | null;
    /** Oylik narx (so'm) — yangi guruh uchun standart. */
    price: number;
    duration_months: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CoursePayload {
    name: string;
    description?: string | null;
    price: number;
    duration_months?: number | null;
    is_active?: boolean;
}

/* ── Guruhlar ─────────────────────────────────────────────────────────── */

export const GROUP_STATUSES = ['active', 'finished'] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

/** ISO hafta kunlari: 1 — dushanba … 7 — yakshanba. */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface Ref {
    id: string;
    name: string;
}

export interface PersonRef {
    id: string;
    first_name: string;
    last_name: string;
}

export interface Group {
    id: string;
    name: string;
    course: Ref;
    branch: Ref;
    teacher: PersonRef | null;
    /** `capacity` — xona sig'imi; guruh to'lganini ko'rsatish uchun. */
    room: (Ref & { capacity: number | null }) | null;
    /** Oylik narx (so'm). */
    price: number;
    /** YYYY-MM-DD */
    start_date: string;
    end_date: string | null;
    lesson_days: Weekday[];
    /** HH:MM */
    lesson_start: string;
    lesson_end: string;
    status: GroupStatus;
    /** Hozir o'qiyotgan o'quvchilar soni. */
    students_count: number;
    created_at: string;
    updated_at: string;
}

export interface GroupPayload {
    name: string;
    course_id: string;
    branch_id: string;
    teacher_id?: string | null;
    room_id?: string | null;
    /** Berilmasa — kurs narxi. */
    price?: number;
    start_date: string;
    end_date?: string | null;
    lesson_days: Weekday[];
    lesson_start: string;
    lesson_end: string;
    status?: GroupStatus;
}

export interface ListGroupsQuery extends PaginationQuery {
    search?: string;
    branch_id?: string;
    course_id?: string;
    teacher_id?: string;
    status?: GroupStatus;
}

export interface ScheduleQuery {
    branch_id?: string;
    teacher_id?: string;
    room_id?: string;
}

/* ── O'quvchilar ──────────────────────────────────────────────────────── */

export const STUDENT_STATUSES = ['active', 'archived'] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export interface Student {
    id: string;
    branch: Ref;
    first_name: string;
    last_name: string;
    /** O'quvchi yoki ota-ona telefonidan kamida bittasi bor. */
    phone_number: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    /** YYYY-MM-DD */
    birth_date: string | null;
    note: string | null;
    status: StudentStatus;
    /** Hozir o'qiyotgan guruhlari. */
    groups: Ref[];
    /**
     * Faqat ro'yxatda va `payments.view` bo'lsa: to'langan − hisoblangan,
     * barcha guruhlar bo'yicha. Manfiy — qarz.
     */
    balance?: number;
    created_at: string;
    updated_at: string;
}

export interface StudentPayload {
    branch_id: string;
    first_name: string;
    last_name: string;
    phone_number?: string | null;
    parent_name?: string | null;
    parent_phone?: string | null;
    birth_date?: string | null;
    note?: string | null;
    status?: StudentStatus;
}

export interface ListStudentsQuery extends PaginationQuery {
    search?: string;
    branch_id?: string;
    /** Shu guruhda hozir o'qiyotganlar. */
    group_id?: string;
    status?: StudentStatus;
}

/** O'quvchining guruhdagi bitta davri: qo'shilgan kundan chiqqan kungacha. */
export interface Enrollment {
    id: string;
    group: Ref & { status: GroupStatus };
    student: PersonRef & {
        phone_number: string | null;
        parent_phone: string | null;
    };
    /** YYYY-MM-DD */
    joined_at: string;
    left_at: string | null;
    /** Shu o'quvchi uchun oylik narx (chegirma bilan). */
    monthly_price: number;
}

export interface EnrollPayload {
    student_id: string;
    joined_at?: string;
    monthly_price?: number;
}

export interface UpdateEnrollmentPayload {
    joined_at?: string;
    left_at?: string;
    monthly_price?: number;
}

/* ── Lidlar ───────────────────────────────────────────────────────────── */

export const LEAD_STATUSES = [
    'new',
    'contacted',
    'trial',
    'won',
    'lost',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** `won` faqat o'quvchiga aylantirilganda qo'yiladi. */
export const EDITABLE_LEAD_STATUSES = [
    'new',
    'contacted',
    'trial',
    'lost',
] as const satisfies readonly LeadStatus[];
export type EditableLeadStatus = (typeof EDITABLE_LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
    'instagram',
    'telegram',
    'facebook',
    'website',
    'referral',
    'walk_in',
    'call',
    'other',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
    id: string;
    first_name: string;
    last_name: string | null;
    phone_number: string;
    source: LeadSource;
    status: LeadStatus;
    branch: Ref | null;
    /** Qiziqqan kursi. */
    course: Ref | null;
    next_call_date: string | null;
    note: string | null;
    /** Aylantirilgan o'quvchi. */
    student: PersonRef | null;
    created_at: string;
    updated_at: string;
}

export interface LeadPayload {
    first_name: string;
    last_name?: string | null;
    phone_number: string;
    source?: LeadSource;
    status?: EditableLeadStatus;
    branch_id?: string | null;
    course_id?: string | null;
    next_call_date?: string | null;
    note?: string | null;
}

export interface ListLeadsQuery extends PaginationQuery {
    search?: string;
    status?: LeadStatus;
    source?: LeadSource;
    branch_id?: string;
    course_id?: string;
}

export type LeadStats = Record<LeadStatus, number>;

export interface ConvertLeadPayload {
    branch_id: string;
    first_name?: string;
    last_name: string;
    phone_number?: string;
    parent_name?: string | null;
    parent_phone?: string | null;
    /** Darhol shu guruhga (students.update ruxsati kerak). */
    group_id?: string;
    monthly_price?: number;
}

/* ── O'quvchi to'lovlari va balans ────────────────────────────────────── */

export const PAYMENT_METHODS = ['cash', 'card', 'transfer', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface StudentPayment {
    id: string;
    student: PersonRef;
    group: Ref;
    amount: number;
    method: PaymentMethod;
    /** YYYY-MM-DD */
    paid_at: string;
    note: string | null;
    received_by: PersonRef | null;
    created_at: string;
}

export interface CreateStudentPaymentPayload {
    student_id: string;
    group_id: string;
    amount: number;
    method?: PaymentMethod;
    paid_at?: string;
    note?: string | null;
}

export interface ListStudentPaymentsQuery extends PaginationQuery {
    search?: string;
    student_id?: string;
    group_id?: string;
    branch_id?: string;
    method?: PaymentMethod;
    from?: string;
    to?: string;
}

/** GET /payments — sahifa va barcha mos to'lovlar yig'indisi. */
export interface StudentPaymentsResponse extends PaginatedResponse<StudentPayment> {
    sum: number;
}

export interface GroupBalance {
    group: Ref & { status: GroupStatus };
    /** Ochiq davr narxi; guruhdan chiqqan bo'lsa null. */
    monthly_price: number | null;
    /** Davr oylari × oylik narx. */
    charged: number;
    paid: number;
    /** paid − charged; manfiy — qarz. */
    balance: number;
}

export interface StudentBalance {
    groups: GroupBalance[];
    charged: number;
    paid: number;
    balance: number;
}

export interface Debtor {
    student: PersonRef & {
        phone_number: string | null;
        parent_phone: string | null;
    };
    group: Ref;
    monthly_price: number | null;
    charged: number;
    paid: number;
    /** Musbat son. */
    debt: number;
}

export interface ListDebtorsQuery extends PaginationQuery {
    search?: string;
    branch_id?: string;
    group_id?: string;
}

/** GET /debtors — sahifa va barcha mos qarzlar yig'indisi. */
export interface DebtorsResponse extends PaginatedResponse<Debtor> {
    total_debt: number;
}

/* ── Davomat ──────────────────────────────────────────────────────────── */

export const ATTENDANCE_STATUSES = [
    'present',
    'absent',
    'late',
    'excused',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface GroupAttendance {
    /** YYYY-MM */
    month: string;
    /** Oydagi dars kunlari. */
    lesson_dates: string[];
    /** Shu oyda guruhda bo'lganlar; belgilanmagan kunlar `records` da yo'q. */
    students: {
        student: PersonRef;
        /** Shu oyga tegadigan davrlari — belgi faqat shu kunlarga qo'yiladi. */
        stays: { joined_at: string; left_at: string | null }[];
        records: Record<string, AttendanceStatus>;
    }[];
}

export interface MarkAttendancePayload {
    /** Bugun yoki o'tgan kun. */
    date: string;
    records: { student_id: string; status: AttendanceStatus }[];
}

export interface StudentAttendance {
    month: string;
    records: { date: string; group: Ref; status: AttendanceStatus }[];
    summary: Record<AttendanceStatus, number>;
}

/* ── Harakatlar tarixi ────────────────────────────────────────────────── */

/** Backenddagi `AUDIT_ACTIONS` nusxasi — `<obyekt>.<amal>`. */
export const AUDIT_ACTIONS = [
    'user.create',
    'user.update',
    'user.delete',
    'user.password_reset',
    'role.create',
    'role.update',
    'role.delete',
    'branch.create',
    'branch.update',
    'branch.delete',
    'room.create',
    'room.update',
    'room.delete',
    'course.create',
    'course.update',
    'course.delete',
    'group.create',
    'group.update',
    'group.delete',
    'student.create',
    'student.update',
    'student.delete',
    'enrollment.create',
    'enrollment.update',
    'lead.create',
    'lead.update',
    'lead.convert',
    'lead.delete',
    'lead_form.create',
    'lead_form.update',
    'lead_form.delete',
    'payment.create',
    'payment.delete',
    'attendance.mark',
    'billing.request',
    'billing.cancel',
    'billing.approve',
    'billing.reject',
    'settings.update',
    'expense.create',
    'expense.delete',
    'salary.rate',
    'salary.pay',
    'salary.cancel',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
    'user',
    'role',
    'branch',
    'room',
    'course',
    'group',
    'student',
    'enrollment',
    'lead',
    'lead_form',
    'payment',
    'attendance',
    'billing',
    'settings',
    'expense',
    'salary',
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface AuditLog {
    id: string;
    actor: { type: 'user' | 'super_admin'; id: string; name: string };
    action: AuditAction;
    entity_type: AuditEntityType;
    entity_id: string | null;
    /** Yozuvning o'sha paytdagi nomi — ism, guruh, tarif. */
    summary: string;
    /** So'rov maydonlari (parolsiz), summa, soni. */
    details: Record<string, unknown> | null;
    created_at: string;
}

export interface ListAuditLogsQuery extends PaginationQuery {
    entity_type?: AuditEntityType;
    action?: AuditAction;
    entity_id?: string;
    actor_id?: string;
    from?: string;
    to?: string;
}

/* ── Xarajatlar va oyliklar ───────────────────────────────────────────── */

export const EXPENSE_CATEGORIES = [
    'rent',
    'salary',
    'utilities',
    'marketing',
    'supplies',
    'tax',
    'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Qo'lda kiritiladiganlari — "oylik" oyliklar sahifasidan yoziladi. */
export const MANUAL_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES.filter(
    (category) => category !== 'salary',
);

export interface Expense {
    id: string;
    category: ExpenseCategory;
    amount: number;
    /** YYYY-MM-DD */
    spent_at: string;
    branch: Ref | null;
    note: string | null;
    /** Oylik to'lovidan yaratilgan — alohida o'chirilmaydi. */
    is_salary_payout: boolean;
    created_by: PersonRef | null;
    created_at: string;
}

export interface CreateExpensePayload {
    category: ExpenseCategory;
    amount: number;
    spent_at?: string;
    branch_id?: string | null;
    note?: string | null;
}

export interface ListExpensesQuery extends PaginationQuery {
    category?: ExpenseCategory;
    branch_id?: string;
    from?: string;
    to?: string;
}

export interface ExpensesResponse extends PaginatedResponse<Expense> {
    sum: number;
}

export const SALARY_RATE_TYPES = ['fixed', 'percent', 'per_student'] as const;
export type SalaryRateType = (typeof SALARY_RATE_TYPES)[number];

export interface SalaryRate {
    type: SalaryRateType;
    /** fixed va per_student — so'm; percent — 0–100. */
    value: number;
}

export interface SalarySheetRow {
    user: PersonRef;
    rate: SalaryRate | null;
    groups_count: number;
    students_count: number;
    /** Guruhlaridan shu oy tushgan to'lovlar. */
    revenue: number;
    accrued: number;
    paid: number;
    /** accrued − paid */
    balance: number;
}

export interface SalarySheet {
    month: string;
    rows: SalarySheetRow[];
    totals: { accrued: number; paid: number; balance: number };
}

export interface SalaryPayout {
    id: string;
    user: PersonRef;
    /** YYYY-MM — qaysi oy uchun. */
    month: string;
    amount: number;
    paid_at: string;
    note: string | null;
    created_by: PersonRef | null;
    created_at: string;
}

export interface CreateSalaryPayoutPayload {
    user_id: string;
    month: string;
    amount: number;
    paid_at?: string;
    note?: string | null;
}

/* ── Hisobotlar ───────────────────────────────────────────────────────── */

export interface MonthAmount {
    /** YYYY-MM */
    month: string;
    amount: number;
}

/** GET /dashboard — markaz bosh sahifasi uchun hammasi bitta javobda. */
export interface Dashboard {
    students: {
        active: number;
        joined_this_month: number;
        left_this_month: number;
    };
    active_groups: number;
    leads: LeadStats;
    new_leads_this_month: number;
    revenue: {
        this_month: number;
        last_month: number;
        /** Oxirgi 6 oy, eskisi birinchi. */
        by_month: MonthAmount[];
    };
    expenses: { this_month: number; by_month: MonthAmount[] };
    /** Shu oy: tushum − xarajat. */
    profit_this_month: number;
    debt: { total: number; debtors: number };
    /** Oxirgi 30 kun; `rate` — (keldi + kechikdi) / belgilar, belgi yo'q — null. */
    attendance: {
        rate: number | null;
        marked: number;
    } & Record<AttendanceStatus, number>;
    today: {
        group: Ref;
        lesson_start: string;
        lesson_end: string;
        room: string | null;
        teacher: string | null;
        students_count: number;
        /** Bugungi davomat belgilanganmi. */
        attendance_marked: boolean;
    }[];
    /** Boshlash qadamlari uchun sanoq; `staff` — owner'dan boshqa xodimlar. */
    setup: DashboardSetup;
}

export interface DashboardSetup {
    branches: number;
    rooms: number;
    courses: number;
    staff: number;
    groups: number;
    students: number;
    payments: number;
}

/** GET /platform-stats — super admin. */
export interface PlatformStats {
    educations: {
        total: number;
        active: number;
        suspended: number;
        inactive: number;
    };
    subscriptions: { trial: number; paid: number; expired: number };
    /** Oylik takroriy daromad bahosi. */
    mrr: number;
    revenue: { this_month: number; by_month: MonthAmount[] };
    registrations_by_month: { month: string; count: number }[];
    pending_requests: number;
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

/** GET /users/options — faol foydalanuvchilar, faqat ism (tanlash uchun). */
export type UserOption = PersonRef;

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
    /** Kod uzunligi (hozir doim 6). */
    code_length: number;
}

export interface ResetForgottenPasswordPayload {
    phone_number: string;
    /** SMS dagi 6 xonali kod. */
    code: string;
    new_password: string;
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
