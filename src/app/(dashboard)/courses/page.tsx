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
import { AccessGuard } from '@/components/ui/access-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    EmptyState,
    ErrorState,
    TableSkeleton,
} from '@/components/ui/data-state';
import { PageHeader } from '@/components/ui/page-header';
import { RowNumberCell, RowNumberHead } from '@/components/ui/row-number';
import { ActiveBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useOpenOnNewParam } from '@/hooks/use-new-param';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { deleteCourse, listCourses } from '@/services/api/courses';
import type { Course } from '@/types/api';
import { can } from '@/utils/access';
import { OpenBook, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CourseFormModal } from './_components/course-form';

export default function CoursesPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'courses.view')}>
            <CoursesView />
        </AccessGuard>
    );
}

function CoursesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatPrice } = useFormat();
    const { session } = useSession();
    const queryClient = useQueryClient();

    const canCreate = can(session, 'courses.create');
    const canUpdate = can(session, 'courses.update');
    const canDelete = can(session, 'courses.delete');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState<Course | null>(null);

    useOpenOnNewParam(() => {
        setEditing(null);
        setFormOpen(true);
    }, canCreate);

    const query = useQuery({ queryKey: ['courses'], queryFn: listCourses });

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success(t('courses.deleted'));
            setDeleting(null);
        },
        onError: (error) => toastError(error),
    });

    return (
        <>
            <PageHeader
                title={t('courses.title')}
                count={query.data?.length}
                description={t('courses.subtitle')}
                actions={
                    canCreate && (
                        <Button
                            variant='primary'
                            appearance='fill'
                            size='md'
                            onPress={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        >
                            <Plus />
                            {t('courses.new')}
                        </Button>
                    )
                }
            />

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.length === 0 ? (
                        <EmptyState
                            message={t('courses.empty')}
                            icon={<OpenBook className='size-5' />}
                        />
                    ) : (
                        <TableRoot fullBleed className='border-x-0 border-t-0'>
                            <TableHeader>
                                <TableRow>
                                    <RowNumberHead />
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead numeric>
                                        {t('courses.price')}
                                    </TableHead>
                                    <TableHead numeric>
                                        {t('courses.duration')}
                                    </TableHead>
                                    <TableHead>{t('common.status')}</TableHead>
                                    {(canUpdate || canDelete) && (
                                        <TableHead className='text-right'>
                                            {t('common.actions')}
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {query.data.map((course, index) => (
                                    <TableRow key={course.id}>
                                        <RowNumberCell index={index} />
                                        <TableCell
                                            primary
                                            className='whitespace-normal'
                                        >
                                            {course.name}
                                            {course.description && (
                                                <p className='text-text-tertiary mt-0.5 text-xs font-normal'>
                                                    {course.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell numeric>
                                            {formatPrice(
                                                course.price,
                                                t('common.som'),
                                            )}
                                        </TableCell>
                                        <TableCell numeric>
                                            {course.duration_months === null
                                                ? '—'
                                                : t('courses.durationValue', {
                                                      months: course.duration_months,
                                                  })}
                                        </TableCell>
                                        <TableCell>
                                            <ActiveBadge
                                                active={course.is_active}
                                            />
                                        </TableCell>
                                        {(canUpdate || canDelete) && (
                                            <TableCell>
                                                <div className='flex justify-end gap-2'>
                                                    {canUpdate && (
                                                        <Button
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.edit',
                                                            )}
                                                            onPress={() => {
                                                                setEditing(
                                                                    course,
                                                                );
                                                                setFormOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil1 />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant='danger'
                                                            appearance='outline'
                                                            size='md'
                                                            iconOnly
                                                            aria-label={t(
                                                                'common.delete',
                                                            )}
                                                            onPress={() =>
                                                                setDeleting(
                                                                    course,
                                                                )
                                                            }
                                                        >
                                                            <Trash1 />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>
                    )}
                </div>
            </div>

            {formOpen && (
                <CourseFormModal
                    course={editing}
                    onClose={() => setFormOpen(false)}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                title={t('courses.deleteTitle')}
                message={t('courses.deleteMessage', {
                    name: deleting?.name ?? '',
                })}
                pending={removeMutation.isPending}
                onCancel={() => setDeleting(null)}
                onConfirm={() => deleting && removeMutation.mutate(deleting.id)}
            />
        </>
    );
}
