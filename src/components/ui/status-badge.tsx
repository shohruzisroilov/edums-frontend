'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { useT } from '@/i18n/provider';
import type {
    CourseStatus,
    EducationCenterStatus,
    GroupStatus,
    StudentStatus,
    SubscriptionStatus,
} from '@/types/api';

type BadgeColor = 'success' | 'warning' | 'gray' | 'error' | 'primary';

/** Tashkilot va filial bir xil holat to'plamiga ega. */
const CENTER_COLORS: Record<EducationCenterStatus, BadgeColor> = {
    active: 'success',
    suspended: 'warning',
    inactive: 'gray',
};

const COURSE_COLORS: Record<CourseStatus, BadgeColor> = {
    active: 'success',
    inactive: 'gray',
};

const GROUP_COLORS: Record<GroupStatus, BadgeColor> = {
    active: 'success',
    finished: 'primary',
    archived: 'gray',
};

const STUDENT_COLORS: Record<StudentStatus, BadgeColor> = {
    active: 'success',
    frozen: 'warning',
    graduated: 'primary',
    left: 'gray',
};

const SUBSCRIPTION_COLORS: Record<SubscriptionStatus, BadgeColor> = {
    active: 'success',
    replaced: 'gray',
    cancelled: 'error',
};

export function CenterStatusBadge({
    status,
}: {
    status: EducationCenterStatus;
}) {
    const t = useT();

    return (
        <Badge size='sm' color={CENTER_COLORS[status]}>
            {t(`centerStatus.${status}`)}
        </Badge>
    );
}

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={COURSE_COLORS[status]}>
            {t(`courseStatus.${status}`)}
        </Badge>
    );
}

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={GROUP_COLORS[status]}>
            {t(`groupStatus.${status}`)}
        </Badge>
    );
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={STUDENT_COLORS[status]}>
            {t(`studentStatus.${status}`)}
        </Badge>
    );
}

export function SubscriptionStatusBadge({
    status,
}: {
    status: SubscriptionStatus;
}) {
    const t = useT();

    return (
        <Badge size='sm' color={SUBSCRIPTION_COLORS[status]}>
            {t(`subscriptionStatus.${status}`)}
        </Badge>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const t = useT();

    return (
        <Badge size='sm' color={role === 'owner' ? 'primary' : 'gray'}>
            {t(`role.${role as 'owner'}`)}
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
