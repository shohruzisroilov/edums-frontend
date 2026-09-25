'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { useT } from '@/i18n/provider';
import type {
    EducationStatus,
    GroupStatus,
    LeadStatus,
    PaymentRequestStatus,
    StudentStatus,
    RoleSummary,
    SubscriptionStatus,
} from '@/types/api';

type BadgeColor = 'success' | 'warning' | 'gray' | 'error' | 'primary';

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
    trial: 'warning',
    won: 'success',
    lost: 'gray',
};

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
