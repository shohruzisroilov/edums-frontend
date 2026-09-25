'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { useT } from '@/i18n/provider';
import type {
    AuditAction,
    EducationStatus,
    ExpenseCategory,
    GroupStatus,
    LeadSource,
    LeadStatus,
    PaymentMethod,
    PaymentRequestStatus,
    StudentStatus,
    RoleSummary,
    SubscriptionStatus,
} from '@/types/api';
import { cn } from '@/utils/cn';

type BadgeColor =
    | 'success'
    | 'warning'
    | 'gray'
    | 'error'
    | 'primary'
    | 'blue'
    | 'sky'
    | 'cyan'
    | 'violet'
    | 'pink'
    | 'rose'
    | 'orange';

const EDUCATION_COLORS: Record<EducationStatus, BadgeColor> = {
    active: 'success',
    suspended: 'warning',
    inactive: 'gray',
};

export function EducationStatusBadge({ status }: { status: EducationStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={EDUCATION_COLORS[status]}>
            {t(`educationStatus.${status}`)}
        </Badge>
    );
}

/** Rol nomi markaz o'zi bergan nom — tarjima qilinmaydi. Owner ajratib ko'rsatiladi. */
export function RoleBadge({ role }: { role: RoleSummary }) {
    return (
        <Badge size='sm' color={role.is_system ? 'primary' : 'gray'}>
            {role.name}
        </Badge>
    );
}

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={status === 'active' ? 'success' : 'gray'}>
            {t(`groupStatus.${status}`)}
        </Badge>
    );
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={status === 'active' ? 'success' : 'gray'}>
            {t(`studentStatus.${status}`)}
        </Badge>
    );
}

const LEAD_COLORS: Record<LeadStatus, BadgeColor> = {
    new: 'primary',
    contacted: 'warning',
    trial: 'cyan',
    won: 'success',
    lost: 'gray',
};

/** Badge ranglari bilan bir xil — nuqta va badge bir-birini takrorlaydi. */
const LEAD_DOT_CLASSES: Record<LeadStatus, string> = {
    new: 'bg-badge-primary-icon-color',
    contacted: 'bg-badge-warning-icon-color',
    trial: 'bg-badge-cyan-icon-color',
    won: 'bg-badge-success-icon-color',
    lost: 'bg-badge-neutral-icon-color',
};

/**
 * Holat rangidagi nuqta — holat select bilan o'zgartiriladigan joyda
 * (select'ning o'zini bo'yab bo'lmaydi) va voronka kartalarida legend sifatida.
 */
export function LeadStatusDot({ status }: { status: LeadStatus }) {
    return (
        <span
            aria-hidden='true'
            className={cn(
                'inline-block size-2.5 shrink-0 rounded-full',
                LEAD_DOT_CLASSES[status],
            )}
        />
    );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={LEAD_COLORS[status]}>
            {t(`leadStatus.${status}`)}
        </Badge>
    );
}

export function ActiveBadge({ active }: { active: boolean }) {
    const t = useT();

    return (
        <Badge size='sm' color={active ? 'success' : 'gray'}>
            {t(active ? 'common.active' : 'common.inactive')}
        </Badge>
    );
}

const PAYMENT_COLORS: Record<PaymentRequestStatus, BadgeColor> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'gray',
};

export function PaymentStatusBadge({
    status,
}: {
    status: PaymentRequestStatus;
}) {
    const t = useT();

    return (
        <Badge size='sm' color={PAYMENT_COLORS[status]}>
            {t(`paymentStatus.${status}`)}
        </Badge>
    );
}

/** Super admin uchun: markaz sinovdami, pulli tarifdami yoki muddati tugaganmi. */
export function SubscriptionBadge({
    subscription,
}: {
    subscription: SubscriptionStatus | undefined;
}) {
    const t = useT();

    if (!subscription?.active) {
        return (
            <Badge size='sm' color='error'>
                {t('billing.expired')}
            </Badge>
        );
    }

    return (
        <Badge
            size='sm'
            color={subscription.kind === 'trial' ? 'warning' : 'success'}
        >
            {subscription.kind === 'trial'
                ? t('billing.trialDays', { days: subscription.days_left })
                : t('billing.paidDays', {
                      name: subscription.tariff_name ?? '',
                      days: subscription.days_left,
                  })}
        </Badge>
    );
}

/*
 * Toifa belgilari: har bir qiymatning o'z rangi bor, shuning uchun jadvalda
 * ko'z bilan tez ajraladi. Rang faqat yordamchi — yorliq matni ham bor.
 */

const METHOD_COLORS: Record<PaymentMethod, BadgeColor> = {
    cash: 'success',
    card: 'blue',
    transfer: 'violet',
    other: 'gray',
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
    const t = useT();

    return (
        <Badge size='sm' color={METHOD_COLORS[method]}>
            {t(`paymentMethod.${method}`)}
        </Badge>
    );
}

const EXPENSE_COLORS: Record<ExpenseCategory, BadgeColor> = {
    rent: 'orange',
    salary: 'violet',
    utilities: 'sky',
    marketing: 'pink',
    supplies: 'cyan',
    tax: 'rose',
    other: 'gray',
};

export function ExpenseCategoryBadge({
    category,
}: {
    category: ExpenseCategory;
}) {
    const t = useT();

    return (
        <Badge size='sm' color={EXPENSE_COLORS[category]}>
            {t(`expenseCategory.${category}`)}
        </Badge>
    );
}

const SOURCE_COLORS: Record<LeadSource, BadgeColor> = {
    instagram: 'pink',
    telegram: 'sky',
    facebook: 'blue',
    website: 'violet',
    referral: 'cyan',
    walk_in: 'orange',
    call: 'primary',
    other: 'gray',
};

export function LeadSourceBadge({ source }: { source: LeadSource }) {
    const t = useT();

    return (
        <Badge size='sm' color={SOURCE_COLORS[source]}>
            {t(`leadSource.${source}`)}
        </Badge>
    );
}

/** Amal fe'liga qarab: qo'shish — yashil, o'zgartirish — ko'k, o'chirish — qizil. */
const ACTION_VERB_COLORS: Record<string, BadgeColor> = {
    create: 'success',
    request: 'success',
    approve: 'success',
    convert: 'success',
    pay: 'success',
    update: 'blue',
    rate: 'blue',
    mark: 'blue',
    password_reset: 'blue',
    delete: 'error',
    cancel: 'error',
    reject: 'error',
};

export function AuditActionBadge({ action }: { action: AuditAction }) {
    const t = useT();
    const verb = action.slice(action.indexOf('.') + 1);

    return (
        <Badge size='sm' color={ACTION_VERB_COLORS[verb] ?? 'gray'}>
            {t(`auditAction.${action}`)}
        </Badge>
    );
}
