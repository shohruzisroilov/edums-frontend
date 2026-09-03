'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { useT } from '@/i18n/provider';
import type { EducationCenterStatus, StudentStatus } from '@/types/api';

type BadgeColor = 'success' | 'warning' | 'gray' | 'error' | 'primary';

const CENTER_COLORS: Record<EducationCenterStatus, BadgeColor> = {
    active: 'success',
    suspended: 'warning',
    inactive: 'gray',
};

const STUDENT_COLORS: Record<StudentStatus, BadgeColor> = {
    active: 'success',
    frozen: 'warning',
    graduated: 'primary',
    left: 'gray',
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

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
    const t = useT();

    return (
        <Badge size='sm' color={STUDENT_COLORS[status]}>
            {t(`studentStatus.${status}`)}
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
