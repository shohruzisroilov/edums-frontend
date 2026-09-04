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
import { SelectInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { RoleGuard } from '@/components/ui/role-guard';
import { SearchInput } from '@/components/ui/search-input';
import { CourseStatusBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useFormat } from '@/hooks/use-format';
import { useListQuery } from '@/hooks/use-list-query';
import { hasRole, useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import { deleteCourse, listCourses } from '@/services/api/courses';
import { listEducations } from '@/services/api/educations';
import type { Course, CourseStatus } from '@/types/api';
import { COURSE_STATUSES } from '@/types/api';
import { ALL_ROLES, CAN_MANAGE_COURSES } from '@/utils/access';
import { OpenBook, Pencil1, Plus, Trash1 } from '@tailgrids/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CourseFormModal } from './_components/course-form';

export default function CoursesPage() {
    return (
        <RoleGuard allow={ALL_ROLES}>
            <CoursesView />
        </RoleGuard>
    );
}

function CoursesView() {
    const t = useT();
    const toastError = useApiErrorToast();
    const { formatPrice, formatNumber } = useFormat();
    const { session } = useSession();

    const canManage = hasRole(session, ...CAN_MANAGE_COURSES);
    const isSuperAdmin = hasRole(session, 'super_admin');

    const {
        search,
        setSearch,
        filters,
        setFilter,
        limit,
        setLimit,
        offset,
        setOffset,
    } = useListQuery({ status: '', education_id: '' });

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState<Course | null>(null);

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['courses', { search, ...filters, limit, offset }],
        queryFn: () =>
            listCourses({
                search: search || undefined,
                status: (filters.status || undefined) as
                    | CourseStatus
                    | undefined,
                education_id: isSuperAdmin
                    ? filters.education_id || undefined
                    : undefined,
                limit,
                offset,
            }),
    });

    const educationsQuery = useQuery({
        queryKey: ['educations', 'options'],
        queryFn: () => listEducations({ limit: 200 }),
        enabled: isSuperAdmin,
    });

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
                count={query.data?.count}
                description={t('courses.subtitle')}
                actions={
                    canManage && (
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

            <div className='flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center'>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t('courses.search')}
                />
                <div className='sm:w-44'>
                    <SelectInput
                        options={COURSE_STATUSES.map((status) => ({
                            value: status,
                            label: t(`courseStatus.${status}`),
                        }))}
                        placeholder={t('common.allStatuses')}
                        value={filters.status}
                        onValueChange={(next) => setFilter('status', next)}
                    />
                </div>
                {isSuperAdmin && (
                    <div className='sm:w-56'>
                        <SelectInput
                            options={(educationsQuery.data?.data ?? []).map(
                                (education) => ({
                                    value: education.id,
                                    label: education.name,
                                }),
                            )}
                            placeholder={t('courses.allEducations')}
                            value={filters.education_id}
                            onValueChange={(next) =>
                                setFilter('education_id', next)
                            }
                        />
                    </div>
                )}
            </div>

            <div className='px-5'>
                <div className='border-card-border bg-card-background overflow-hidden rounded-xl border'>
                    {query.isPending ? (
                        <TableSkeleton columns={5} />
                    ) : query.error ? (
                        <ErrorState error={query.error} />
                    ) : query.data.data.length === 0 ? (
                        <EmptyState
                            message={t('courses.empty')}
                            icon={<OpenBook className='size-5' />}
                        />
                    ) : (
                        <>
                            <TableRoot
                                fullBleed
                                className='border-x-0 border-t-0'
                            >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('common.name')}
                                        </TableHead>
                                        <TableHead>
                                            {t('courses.level')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('courses.duration')}
                                        </TableHead>
                                        <TableHead numeric>
                                            {t('courses.price')}
                                        </TableHead>
                                        <TableHead>
                                            {t('common.status')}
                                        </TableHead>
                                        {canManage && (
                                            <TableHead className='text-right'>
                                                {t('common.actions')}
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {query.data.data.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell
                                                primary
                                                className='whitespace-normal'
                                            >
                                                {course.name}
                                                {course.description && (
                                                    <span className='text-text-tertiary mt-0.5 block text-xs'>
                                                        {course.description}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {course.level ?? '—'}
                                            </TableCell>
                                            <TableCell numeric>
                                                {course.duration_months === null
                                                    ? '—'
                                                    : t('courses.months', {
                                                          count: formatNumber(
                                                              course.duration_months,
                                                          ),
                                                      })}
                                            </TableCell>
                                            <TableCell numeric>
                                                {formatPrice(
                                                    course.price,
                                                    t('common.som'),
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <CourseStatusBadge
                                                    status={course.status}
                                                />
                                            </TableCell>
                                            {canManage && (
                                                <TableCell>
                                                    <div className='flex justify-end gap-2'>
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
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableRoot>

                            <PaginationBar
                                count={query.data.count}
                                limit={limit}
                                offset={offset}
                                onLimitChange={setLimit}
                                onOffsetChange={setOffset}
                            />
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
