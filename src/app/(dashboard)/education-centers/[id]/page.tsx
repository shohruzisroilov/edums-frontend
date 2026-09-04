'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { RoleGuard } from '@/components/ui/role-guard';
import {
    ActiveBadge,
    CenterStatusBadge,
    RoleBadge,
} from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    detachStaffFromCenter,
    getEducationCenter,
    listCenterStaff,
} from '@/services/api/education-centers';
import type { User } from '@/types/api';
import { ALL_ROLES, CAN_MANAGE_CENTER_STAFF } from '@/utils/access';
import { fullName } from '@/utils/format';
import { ArrowLeft, Link1AngularRight, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AttachStaffModal } from './_components/attach-staff';
import { CenterStaffFormModal } from './_components/staff-form';

export default function EducationCenterDetailPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <CenterDetailView />
        </RoleGuard>
    );
}

function CenterDetailView() {
    const t = useT();
    const { formatDate, formatDateTime } = useFormat();
    const toastError = useApiErrorToast();
    const { session } = useSession();
    const params = useParams<{ id: string }>();
    const centerId = params.id;

    const canManageStaff = hasRole(session, ...CAN_MANAGE_CENTER_STAFF);

    const [staffOpen, setStaffOpen] = useState(false);
    const [attachOpen, setAttachOpen] = useState(false);
    const [detaching, setDetaching] = useState<User | null>(null);

    const queryClient = useQueryClient();

    const centerQuery = useQuery({
        queryKey: ['education-center', centerId],
        queryFn: () => getEducationCenter(centerId),
    });

    const staffQuery = useQuery({
        queryKey: ['center-staff', centerId],
        queryFn: () => listCenterStaff(centerId),
    });

    const detachMutation = useMutation({
        mutationFn: (userId: string) => detachStaffFromCenter(centerId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['center-staff', centerId],
            });
            toast.success(t('centers.staffDetached'));
            setDetaching(null);
        },
        onError: (error) => toastError(error),
    });

    if (centerQuery.isPending) return <TableSkeleton rows={4} columns={3} />;
    if (centerQuery.error) return <ErrorState error={centerQuery.error} />;

    const center = centerQuery.data;
    const staff = staffQuery.data ?? [];

    return (
        <>
            <div className='px-5 pt-6'>
                <Link
                    href='/education-centers'
                    className='text-text-tertiary hover:text-text-primary inline-flex items-center gap-1.5 text-sm transition-colors'
                >
                    <ArrowLeft className='size-4' />
                    {t('centers.backToList')}
                </Link>
            </div>

            <PageHeader
                title={center.name}
                description={center.address ?? undefined}
            />

            <div className='grid gap-4 px-5 sm:grid-cols-2 xl:grid-cols-3'>
                <InfoCard
                    label={t('common.phone')}
                    value={center.phone_number}
                />
                <InfoCard
                    label={t('common.status')}
                    value={<CenterStatusBadge status={center.status} />}
                />
                <InfoCard
                    label={t('centers.workingHours')}
                    value={center.working_hours ?? '—'}
                />
                <InfoCard
                    label={t('centers.education')}
                    value={center.education?.name ?? '—'}
                />
                <InfoCard
                    label={t('common.createdAt')}
                    value={formatDateTime(center.created_at)}
                />
            </div>

            <section className='mt-8 px-5'>
                <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <h2 className='text-text-primary font-display text-base font-semibold'>
                        {t('centers.staff')}
                    </h2>
                    {canManageStaff && (
                        <div className='flex flex-wrap gap-2'>
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={() => setAttachOpen(true)}
                            >
                                <Link1AngularRight />
                                {t('centers.attachStaff')}
                            </Button>
                            <Button
                                variant='primary'
                                appearance='fill'
                                size='md'
                                onPress={() => setStaffOpen(true)}
                            >
                                <Plus />
                                {t('centers.addStaff')}
                            </Button>
                        </div>
                    )}
                </div>

                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {staffQuery.isPending ? (
                        <TableSkeleton rows={3} columns={4} />
                    ) : staffQuery.error ? (
                        <ErrorState error={staffQuery.error} />
                    ) : staff.length === 0 ? (
                        <EmptyState message={t('centers.noStaff')} />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {t('common.fullName')}
                                    </TableHead>
                                    <TableHead>{t('common.phone')}</TableHead>
                                    <TableHead>{t('staff.role')}</TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                    <TableHead>
                                        {t('common.createdAt')}
                                    </TableHead>
                                    {canManageStaff && (
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell primary>
                                            {fullName(member)}
                                        </TableCell>
                                        <TableCell>
                                            {member.phone_number}
                                        </TableCell>
                                        <TableCell>
                                            <RoleBadge role={member.role} />
                                        </TableCell>
                                        <TableCell>
                                            <ActiveBadge
                                                active={member.is_active}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(member.created_at)}
                                        </TableCell>
                                        {canManageStaff && (
                                            <TableCell>
                                                <div className='flex justify-end'>
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='md'
                                                        iconOnly
                                                        aria-label={t(
                                                            'centers.detach',
                                                        )}
                                                        onPress={() =>
                                                            setDetaching(member)
                                                        }
                                                    >
                                                        <Trash1 />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>
                    )}
                </div>
            </section>

            {staffOpen && (
                <CenterStaffFormModal
                    centerId={centerId}
                    onClose={() => setStaffOpen(false)}
                />
            )}

            {attachOpen && (
                <AttachStaffModal
                    centerId={centerId}
                    educationId={center.education_id}
                    attachedIds={staff.map((member) => member.id)}
                    onClose={() => setAttachOpen(false)}
                />
            )}

            <ConfirmDialog
                open={detaching !== null}
                title={t('centers.detachTitle')}
                message={t('centers.detachMessage', {
                    name: detaching ? fullName(detaching) : '',
                })}
                confirmLabel={t('centers.detach')}
                pending={detachMutation.isPending}
                onCancel={() => setDetaching(null)}
                onConfirm={() =>
                    detaching && detachMutation.mutate(detaching.id)
                }
            />
        </>
    );
}

function InfoCard({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-4'>
            <p className='text-text-tertiary text-xs'>{label}</p>
            <div className='text-text-primary mt-1.5 text-sm font-medium tabular-nums'>
                {value}
            </div>
        </div>
    );
}
