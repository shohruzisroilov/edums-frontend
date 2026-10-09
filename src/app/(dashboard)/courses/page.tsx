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
import { exportToExcel } from '@/utils/export';
import { Download1, OpenBook, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
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

    const handleExportExcel = async () => {
        const list = query.data ?? [];
        if (list.length === 0) return;
        await exportToExcel(
            t('courses.title'),
            'Courses',
            [
                t('common.name'),
                `${t('courses.price')} (${t('common.som')})`,
                t('courses.duration'),
                t('common.description'),
                t('common.status'),
            ],
            list.map((c) => [
                c.name,
                c.price,
                c.duration_months ? `${c.duration_months} oy` : '—',
                c.description || '',
                c.is_active ? t('common.active') : t('common.inactive'),
            ]),
        );
    };

    return (
        <>
            <PageHeader
                title={t('courses.title')}
                count={query.data?.length}
                description={t('courses.subtitle')}
                actions={
                    <div className='flex flex-wrap items-center gap-2'>
                        {query.data && query.data.length > 0 && (
                            <Button
                                appearance='outline'
                                size='md'
                                onPress={handleExportExcel}
                            >
                                <Download1 />
                                <span className='sr-only sm:not-sr-only'>
                                    {t('common.export')}
                                </span>
                            </Button>
                        )}
                        {canCreate && (
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
                        )}
                    </div>
                }
            />

            <div className='px-4 sm:px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.length === 0 ? (
                        <EmptyState
                            message={t('courses.empty')}
                            hint={t('courses.emptyHint')}
                            icon={<OpenBook className='size-5' />}
                            action={
                                canCreate ? (
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
                                        {t('courses.addFirst')}
                                    </Button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            {/* Mobil kartalar (< md) */}
                            <div className='divide-card-border divide-y md:hidden'>
                                {query.data.map((course, index) => (
                                    <div
                                        key={course.id}
                                        className='hover:bg-background-gray-primary/20 flex flex-col gap-3 p-4 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-text-tertiary text-xs font-semibold tabular-nums'>
                                                        #{index + 1}
                                                    </span>
                                                    <h3 className='text-text-primary text-sm font-semibold'>
                                                        {course.name}
                                                    </h3>
                                                </div>
                                                {course.description && (
                                                    <p className='text-text-tertiary mt-1 text-xs'>
                                                        {course.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ActiveBadge
                                                active={course.is_active}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between text-xs'>
                                            <div>
                                                <span className='text-text-tertiary block text-[11px]'>
                                                    {t('courses.price')}
                                                </span>
                                                <span className='text-text-primary text-xs font-semibold tabular-nums'>
                                                    {formatPrice(
                                                        course.price,
                                                        t('common.som'),
                                                    )}
                                                </span>
                                            </div>
                                            {course.duration_months !==
                                                null && (
                                                <div className='text-right'>
                                                    <span className='text-text-tertiary block text-[11px]'>
                                                        {t('courses.duration')}
                                                    </span>
                                                    <span className='text-text-secondary text-xs tabular-nums'>
                                                        {t(
                                                            'courses.durationValue',
                                                            {
                                                                months: course.duration_months,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {(canUpdate || canDelete) && (
                                            <div className='border-card-border/60 flex items-center justify-end gap-2 border-t pt-2.5'>
                                                {canUpdate && (
                                                    <Button
                                                        appearance='outline'
                                                        size='sm'
                                                        onPress={() => {
                                                            setEditing(course);
                                                            setFormOpen(true);
                                                        }}
                                                        className='gap-1.5'
                                                    >
                                                        <Pencil1 className='size-3.5' />
                                                        <span>
                                                            {t('common.edit')}
                                                        </span>
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant='danger'
                                                        appearance='outline'
                                                        size='sm'
                                                        onPress={() =>
                                                            setDeleting(course)
                                                        }
                                                        className='gap-1.5'
                                                    >
                                                        <Trash1 className='size-3.5' />
                                                        <span>
                                                            {t('common.delete')}
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop / Tablet jadval (>= md) */}
                            <div className='hidden md:block'>
                                <TableRoot
                                    fullBleed
                                    className='border-x-0 border-t-0'
                                >
                                    <TableHeader>
                                        <TableRow>
                                            <RowNumberHead />
                                            <TableHead>
                                                {t('common.name')}
                                            </TableHead>
                                            <TableHead numeric>
                                                {t('courses.price')}
                                            </TableHead>
                                            <TableHead numeric>
                                                {t('courses.duration')}
                                            </TableHead>
                                            <TableHead>
                                                {t('common.status')}
                                            </TableHead>
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
                                                    {course.duration_months ===
                                                    null
                                                        ? '—'
                                                        : t(
                                                              'courses.durationValue',
                                                              {
                                                                  months: course.duration_months,
                                                              },
                                                          )}
                                                </TableCell>
                                                <TableCell>
                                                    <ActiveBadge
                                                        active={
                                                            course.is_active
                                                        }
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
                            </div>
                        </>
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
