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
    EnrollmentEditModal,
    EnrollToGroupModal,
} from '@/components/ui/enrollment-modals';
import { PageHeader } from '@/components/ui/page-header';
import { PaymentModal } from '@/components/ui/payment-modal';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { StudentStatusBadge } from '@/components/ui/status-badge';
import { useFormat } from '@/hooks/use-format';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { PhoneLink } from '@/components/ui/phone-link';
import { getStudent, listStudentEnrollments } from '@/services/api/students';
import type { Enrollment } from '@/types/api';
import { can, canAny } from '@/utils/access';
import { fullName } from '@/utils/format';
import { Pencil1, Plus } from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { StudentFormModal } from '../_components/student-form';
import { StudentAttendanceSection } from './_components/attendance-section';
import { BalanceCard } from './_components/balance-card';
import { FinanceSection } from './_components/finance-section';

export default function StudentDetailPage() {
    return (
        <AccessGuard
            allow={(session) =>
                canAny(session, 'students.view', 'students.view_own')
            }
        >
            <StudentDetailView />
        </AccessGuard>
    );
}

function StudentDetailView() {
    const t = useT();
    const { formatDate, formatPrice } = useFormat();
    const { session } = useSession();
    const { id } = useParams<{ id: string }>();

    const canUpdate = can(session, 'students.update');
    // Guruh tanlash ro'yxati GET /groups dan keladi.
    const canEnroll = canUpdate && can(session, 'groups.view');
    const canOpenGroups = canAny(session, 'groups.view', 'groups.view_own');
    const canViewPayments = can(session, 'payments.view');
    const canPay = can(session, 'payments.create');

    const [editOpen, setEditOpen] = useState(false);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [paying, setPaying] = useState(false);
    const [editingEnrollment, setEditingEnrollment] =
        useState<Enrollment | null>(null);

    const studentQuery = useQuery({
        queryKey: ['student', id],
        queryFn: () => getStudent(id),
    });
    const enrollmentsQuery = useQuery({
        queryKey: ['student-enrollments', id],
        queryFn: () => listStudentEnrollments(id),
    });

    if (studentQuery.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (studentQuery.error) return <ErrorState error={studentQuery.error} />;

    const student = studentQuery.data;

    return (
        <>
            <BackLink href='/students' label={t('students.backToList')} />

            <PageHeader
                title={fullName(student)}
                description={
                    <>
                        <span>{student.branch.name}</span>
                        <StudentStatusBadge status={student.status} />
                    </>
                }
                actions={
                    <>
                        {canUpdate && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => setEditOpen(true)}
                            >
                                <Pencil1 />
                                {t('common.edit')}
                            </Button>
                        )}
                        {canPay && (
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setPaying(true)}
                            >
                                <Plus />
                                {t('cashbox.new')}
                            </Button>
                        )}
                    </>
                }
            />

            <div className='grid grid-cols-2 gap-3.5 px-4 sm:gap-4 sm:px-5 xl:grid-cols-4'>
                {canViewPayments && <BalanceCard studentId={student.id} />}
                <InfoCard
                    label={t('students.phone')}
                    value={<PhoneLink phone={student.phone_number} />}
                />
                <InfoCard
                    label={t('students.parentName')}
                    value={
                        student.parent_name || student.parent_phone ? (
                            <>
                                {student.parent_name && (
                                    <p>{student.parent_name}</p>
                                )}
                                {student.parent_phone && (
                                    <p className='text-text-secondary'>
                                        <PhoneLink
                                            phone={student.parent_phone}
                                        />
                                    </p>
                                )}
                            </>
                        ) : (
                            '—'
                        )
                    }
                />
                <InfoCard
                    label={t('students.birthDate')}
                    value={formatDate(student.birth_date)}
                />
            </div>

            {student.note && (
                <div className='px-4 pt-4 sm:px-5'>
                    <InfoCard
                        label={t('common.note')}
                        value={
                            <p className='font-normal whitespace-pre-line'>
                                {student.note}
                            </p>
                        }
                    />
                </div>
            )}

            {canViewPayments && <FinanceSection student={student} />}

            <DetailSection
                title={t('students.history')}
                action={
                    canEnroll &&
                    student.status === 'active' && (
                        <Button
                            variant='primary'
                            appearance='fill'
                            size='md'
                            onPress={() => setEnrollOpen(true)}
                        >
                            <Plus />
                            {t('students.enroll')}
                        </Button>
                    )
                }
            >
                {enrollmentsQuery.isPending ? (
                    <TableSkeleton rows={2} columns={5} />
                ) : enrollmentsQuery.error ? (
                    <ErrorState error={enrollmentsQuery.error} />
                ) : enrollmentsQuery.data.length === 0 ? (
                    <EmptyState message={t('students.historyEmpty')} />
                ) : (
                    <>
                        {/* Mobile enrollments card list */}
                        <div className='divide-card-border divide-y md:hidden'>
                            {enrollmentsQuery.data.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className='space-y-2 p-4'
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='min-w-0'>
                                            {canOpenGroups ? (
                                                <Link
                                                    href={`/groups/${enrollment.group.id}`}
                                                    className='text-text-primary hover:text-brand-accent block text-sm font-semibold break-words'
                                                >
                                                    {enrollment.group.name}
                                                </Link>
                                            ) : (
                                                <p className='text-text-primary text-sm font-semibold break-words'>
                                                    {enrollment.group.name}
                                                </p>
                                            )}
                                            <div className='mt-1 flex items-center gap-2'>
                                                {enrollment.left_at ? (
                                                    <span className='text-text-tertiary text-xs'>
                                                        {formatDate(
                                                            enrollment.joined_at,
                                                        )}{' '}
                                                        –{' '}
                                                        {formatDate(
                                                            enrollment.left_at,
                                                        )}
                                                    </span>
                                                ) : (
                                                    <Badge
                                                        size='sm'
                                                        color='success'
                                                    >
                                                        {t('students.studying')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className='shrink-0 text-right'>
                                            <span className='text-text-primary block text-sm font-semibold tabular-nums'>
                                                {enrollment.monthly_price === 0 ? (
                                                    <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                                                        🎁 {t('students.grantBadge')}
                                                    </span>
                                                ) : (
                                                    formatPrice(
                                                        enrollment.monthly_price,
                                                        t('common.som'),
                                                    )
                                                )}
                                            </span>
                                            {enrollment.first_month_price != null && (
                                                <span className='text-text-tertiary block text-[11px] tabular-nums'>
                                                    {t('students.firstMonthBadge', {
                                                        price: formatPrice(
                                                            enrollment.first_month_price,
                                                            t('common.som'),
                                                        ),
                                                    })}
                                                </span>
                                            )}
                                            <span className='text-text-tertiary text-xs'>
                                                {formatDate(
                                                    enrollment.joined_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {canUpdate && (
                                        <div className='flex justify-end pt-1'>
                                            <Button
                                                appearance='outline'
                                                size='sm'
                                                onPress={() =>
                                                    setEditingEnrollment(
                                                        enrollment,
                                                    )
                                                }
                                            >
                                                <Pencil1 className='size-3.5' />
                                                {t('common.edit')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className='hidden md:block'>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <RowNumberHead />
                                        <TableHead>
                                            {t('common.group')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.joinedAt')}
                                        </TableHead>
                                        <TableHead>
                                            {t('students.leftAt')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('students.monthlyPrice')}
                                        </TableHead>
                                        {canUpdate && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollmentsQuery.data.map(
                                        (enrollment, index) => (
                                            <TableRow key={enrollment.id}>
                                                <RowNumberCell index={index} />
                                                <TableCell primary>
                                                    {canOpenGroups ? (
                                                        <Link
                                                            href={`/groups/${enrollment.group.id}`}
                                                            className='hover:text-brand-accent hover:underline'
                                                        >
                                                            {
                                                                enrollment.group
                                                                    .name
                                                            }
                                                        </Link>
                                                    ) : (
                                                        enrollment.group.name
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        enrollment.joined_at,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {enrollment.left_at ? (
                                                        formatDate(
                                                            enrollment.left_at,
                                                        )
                                                    ) : (
                                                        <Badge
                                                            size='sm'
                                                            color='success'
                                                        >
                                                            {t(
                                                                'students.studying',
                                                            )}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell numeric>
                                                    <div className='flex flex-col items-end'>
                                                        <span className='font-medium'>
                                                            {enrollment.monthly_price === 0 ? (
                                                                <Badge size='sm' color='success'>
                                                                    🎁 {t('students.grantBadge')}
                                                                </Badge>
                                                            ) : (
                                                                formatPrice(
                                                                    enrollment.monthly_price,
                                                                    t('common.som'),
                                                                )
                                                            )}
                                                        </span>
                                                        {enrollment.first_month_price != null && (
                                                            <span className='text-text-tertiary text-[11px] tabular-nums'>
                                                                {t('students.firstMonthBadge', {
                                                                    price: formatPrice(
                                                                        enrollment.first_month_price,
                                                                        t('common.som'),
                                                                    ),
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {canUpdate && (
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
                                        ),
                                    )}
                                </TableBody>
                            </TableRoot>
                        </div>
                    </>
                )}
            </DetailSection>

            {canAny(session, 'attendance.view', 'attendance.view_own') && (
                <StudentAttendanceSection studentId={student.id} />
            )}

            {paying && (
                <PaymentModal
                    student={student}
                    onClose={() => setPaying(false)}
                />
            )}

            {editOpen && (
                <StudentFormModal
                    student={student}
                    onClose={() => setEditOpen(false)}
                />
            )}

            {enrollOpen && (
                <EnrollToGroupModal
                    student={student}
                    currentGroupIds={student.groups.map((group) => group.id)}
                    onClose={() => setEnrollOpen(false)}
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
