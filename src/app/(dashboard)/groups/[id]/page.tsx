'use client';

import { Badge } from '@/components/tailgrids/core/badge';
import { Button } from '@/components/tailgrids/core/button';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { AccessGuard } from '@/components/ui/access-guard';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { BackLink, DetailSection, InfoCard } from '@/components/ui/detail';
import {
    AddStudentToGroupModal,
    EnrollmentEditModal,
} from '@/components/ui/enrollment-modals';
import { CheckboxInput } from '@/components/ui/form-field';
import { LessonSchedule } from '@/components/ui/lesson-schedule';
import { PageHeader } from '@/components/ui/page-header';
import { GroupStatusBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { getGroup } from '@/services/api/groups';
import { listGroupStudents } from '@/services/api/students';
import type { Enrollment } from '@/types/api';
import { can } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GroupFormModal } from '../_components/group-form';

export default function GroupDetailPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'groups.view')}>
            <GroupDetailView />
        </AccessGuard>
    );
}

function GroupDetailView() {
    const t = useT();
    const { formatDate, formatPrice } = useFormat();
    const { session } = useSession();
    const { id } = useParams<{ id: string }>();

    const canEditGroup = can(session, 'groups.update');
    const canUpdateStudents = can(session, 'students.update');
    // O'quvchi qidirish GET /students dan.
    const canAddStudent = canUpdateStudents && can(session, 'students.view');
    const canOpenStudents = can(session, 'students.view');

    const [editOpen, setEditOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [showLeft, setShowLeft] = useState(false);
    const [editingEnrollment, setEditingEnrollment] =
        useState<Enrollment | null>(null);

    const groupQuery = useQuery({
        queryKey: ['group', id],
        queryFn: () => getGroup(id),
    });
    const studentsQuery = useQuery({
        queryKey: ['group-students', id, showLeft],
        queryFn: () => listGroupStudents(id, showLeft),
    });

    if (groupQuery.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (groupQuery.error) return <ErrorState error={groupQuery.error} />;

    const group = groupQuery.data;
    const enrolledIds = (studentsQuery.data ?? [])
        .filter((enrollment) => enrollment.left_at === null)
        .map((enrollment) => enrollment.student.id);

    return (
        <>
            <BackLink href='/groups' label={t('groups.backToList')} />

            <PageHeader
                title={group.name}
                description={`${group.course.name} · ${group.branch.name}`}
                actions={
                    canEditGroup && (
                        <Button
                            appearance='outline'
                            size='md'
                            onPress={() => setEditOpen(true)}
                        >
                            <Pencil1 />
                            {t('common.edit')}
                        </Button>
                    )
                }
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-4'>
                <InfoCard
                    label={t('groups.teacher')}
                    value={group.teacher ? fullName(group.teacher) : '—'}
                />
                <InfoCard
                    label={t('groups.lessons')}
                    value={
                        <>
                            <LessonSchedule group={group} />
                            {group.room && (
                                <p className='text-text-secondary'>
                                    {group.room.name}
                                </p>
                            )}
                        </>
                    }
                />
                <InfoCard
                    label={t('groups.price')}
                    value={formatPrice(group.price, t('common.som'))}
                />
                <InfoCard
                    label={t('common.status')}
                    value={
                        <div className='flex flex-col items-start gap-1'>
                            <GroupStatusBadge status={group.status} />
                            <span className='text-text-secondary font-normal'>
                                {formatDate(group.start_date)} —{' '}
                                {group.end_date
                                    ? formatDate(group.end_date)
                                    : '…'}
                            </span>
                        </div>
                    }
                />
            </div>

            <DetailSection
                title={`${t('groups.students')} · ${group.students_count}`}
                description={t('groups.studentsHint')}
                action={
                    <div className='flex flex-wrap items-center gap-4'>
                        <CheckboxInput
                            label={t('groups.showLeft')}
                            checked={showLeft}
                            onChange={(e) => setShowLeft(e.target.checked)}
                        />
                        {canAddStudent && group.status === 'active' && (
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setAddOpen(true)}
                            >
                                <Plus />
                                {t('groups.addStudent')}
                            </Button>
                        )}
                    </div>
                }
            >
                {studentsQuery.isPending ? (
                    <TableSkeleton rows={3} columns={5} />
                ) : studentsQuery.error ? (
                    <ErrorState error={studentsQuery.error} />
                ) : studentsQuery.data.length === 0 ? (
                    <EmptyState message={t('groups.studentsEmpty')} />
                ) : (
                    <TableRoot fullBleed className='border-x-0 border-t-0'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.fullName')}</TableHead>
                                <TableHead>{t('common.phone')}</TableHead>
                                <TableHead>{t('students.joinedAt')}</TableHead>
                                <TableHead numeric>
                                    {t('students.monthlyPrice')}
                                </TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                {canUpdateStudents && (
                                    <TableHead className='text-right'>
                                        {t('common.actions')}
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsQuery.data.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell primary>
                                        {canOpenStudents ? (
                                            <Link
                                                href={`/students/${enrollment.student.id}`}
                                                className='hover:text-brand-accent hover:underline'
                                            >
                                                {fullName(enrollment.student)}
                                            </Link>
                                        ) : (
                                            fullName(enrollment.student)
                                        )}
                                    </TableCell>
                                    <TableCell className='tabular-nums'>
                                        {enrollment.student.phone_number ??
                                            enrollment.student.parent_phone ??
                                            '—'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(enrollment.joined_at)}
                                    </TableCell>
                                    <TableCell numeric>
                                        {formatPrice(
                                            enrollment.monthly_price,
                                            t('common.som'),
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {enrollment.left_at ? (
                                            <Badge size='sm' color='gray'>
                                                {t('students.leftBadge')} ·{' '}
                                                {formatDate(enrollment.left_at)}
                                            </Badge>
                                        ) : (
                                            <Badge size='sm' color='success'>
                                                {t('students.studying')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    {canUpdateStudents && (
                                        <TableCell>
                                            <div className='flex justify-end'>
                                                <Button
                                                    appearance='outline'
                                                    size='md'
                                                    iconOnly
                                                    aria-label={t(
                                                        'common.edit',
                                                    )}
                                                    onPress={() =>
                                                        setEditingEnrollment(
                                                            enrollment,
                                                        )
                                                    }
                                                >
                                                    <Pencil1 />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableRoot>
                )}
            </DetailSection>

            {editOpen && (
                <GroupFormModal
                    group={group}
                    onClose={() => setEditOpen(false)}
                />
            )}

            {addOpen && (
                <AddStudentToGroupModal
                    group={group}
                    enrolledIds={enrolledIds}
                    onClose={() => setAddOpen(false)}
                />
            )}

            {editingEnrollment && (
                <EnrollmentEditModal
                    enrollment={editingEnrollment}
                    onClose={() => setEditingEnrollment(null)}
                />
            )}
        </>
    );
}
