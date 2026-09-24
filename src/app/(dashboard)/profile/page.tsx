'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/tailgrids/core/avatar';
import { Button } from '@/components/tailgrids/core/button';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { TextInput } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { ImageUploadField } from '@/components/ui/image-upload';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/status-badge';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useSession } from '@/hooks/use-session';
import { useT } from '@/i18n/provider';
import {
    changeMyPassword,
    getMe,
    sessionFromAuthUser,
    updateMe,
} from '@/services/api/auth';
import { fileUrl } from '@/services/api/client';
import type { AuthUser } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { session, signOut } = useSession();
    const t = useT();

    const isSuperAdmin = session?.kind === 'super_admin';

    // Super admin uchun /auth/me yo'q — u alohida jadvalda yashaydi.
    const meQuery = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        enabled: !!session && !isSuperAdmin,
    });

    if (!session) return null;

    return (
        <>
            <PageHeader
                title={t('profile.title')}
                description={t('profile.subtitle')}
                actions={
                    <Button
                        variant='danger'
                        appearance='outline'
                        size='md'
                        onPress={signOut}
                    >
                        {t('auth.signOut')}
                    </Button>
                }
            />

            <div className='flex flex-col gap-5 px-5'>
                {isSuperAdmin ? (
                    <Card>
                        <ProfileHeading
                            name={t('profile.superAdmin')}
                            initials='SA'
                            avatarUrl={null}
                            subtitle={session.phone_number}
                        />
                    </Card>
                ) : meQuery.isPending ? (
                    <TableSkeleton rows={4} columns={2} />
                ) : meQuery.error ? (
                    <ErrorState error={meQuery.error} />
                ) : (
                    <UserProfile profile={meQuery.data} />
                )}
            </div>
        </>
    );
}

function UserProfile({ profile }: { profile: AuthUser }) {
    const t = useT();
    const name = `${profile.last_name} ${profile.first_name}`.trim();
    const initials =
        `${profile.last_name[0] ?? ''}${profile.first_name[0] ?? ''}`.toUpperCase();

    return (
        <>
            <Card>
                <ProfileHeading
                    name={name}
                    initials={initials}
                    avatarUrl={profile.avatar_url}
                    subtitle={profile.education.name}
                />

                <dl className='divide-card-border border-card-border mt-6 divide-y border-t'>
                    <Row label={t('common.phoneNumber')}>
                        {profile.phone_number}
                    </Row>
                    <Row label={t('profile.education')}>
                        {profile.education.name}
                    </Row>
                    <Row label={t('users.roles')}>
                        <div className='flex flex-wrap gap-1'>
                            {profile.roles.map((role) => (
                                <RoleBadge key={role.id} role={role} />
                            ))}
                        </div>
                    </Row>
                    <Row label={t('profile.permissions')}>
                        {profile.is_owner
                            ? t('profile.allPermissions')
                            : profile.permissions.length === 0
                              ? t('profile.noPermissions')
                              : profile.permissions
                                    .map((key) => t(`permission.${key}`))
                                    .join(', ')}
                    </Row>
                </dl>
            </Card>

            <div className='grid gap-5 lg:grid-cols-2'>
                <EditProfileCard profile={profile} />
                <ChangePasswordCard />
            </div>
        </>
    );
}

function EditProfileCard({ profile }: { profile: AuthUser }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();
    const { session, signIn } = useSession();

    const [form, setForm] = useState({
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_id: profile.avatar_id,
        avatar_url: profile.avatar_url,
    });

    const mutation = useMutation({
        mutationFn: () =>
            updateMe({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                avatar_id: form.avatar_id,
            }),
        onSuccess: (updated) => {
            queryClient.setQueryData(['me'], updated);
            // Sarlavhadagi ism va rasm ham darhol yangilansin.
            if (session) signIn(sessionFromAuthUser(session.token, updated));
            toast.success(t('profile.updated'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <Card title={t('profile.editTitle')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <TextInput
                        label={t('common.lastName')}
                        required
                        maxLength={100}
                        value={form.last_name}
                        onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                        }
                    />
                    <TextInput
                        label={t('common.firstName')}
                        required
                        maxLength={100}
                        value={form.first_name}
                        onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                        }
                    />
                </div>
                <ImageUploadField
                    label={t('common.avatar')}
                    value={form.avatar_id}
                    previewUrl={form.avatar_url}
                    onChange={(avatar_id, avatar_url) =>
                        setForm({ ...form, avatar_id, avatar_url })
                    }
                />
                <p className='text-text-tertiary text-xs'>
                    {t('profile.phoneHint')}
                </p>
                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={mutation.isPending}
                    >
                        {t(
                            mutation.isPending
                                ? 'common.saving'
                                : 'common.save',
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function ChangePasswordCard() {
    const t = useT();
    const toastError = useApiErrorToast();

    const [form, setForm] = useState({ current: '', next: '', repeat: '' });
    const mismatch = form.repeat !== '' && form.next !== form.repeat;

    const mutation = useMutation({
        mutationFn: () =>
            changeMyPassword({
                current_password: form.current,
                new_password: form.next,
            }),
        onSuccess: () => {
            setForm({ current: '', next: '', repeat: '' });
            toast.success(t('profile.passwordChanged'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!mismatch) mutation.mutate();
    }

    return (
        <Card title={t('profile.passwordTitle')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <PasswordInput
                    label={t('profile.currentPassword')}
                    required
                    autoComplete='current-password'
                    value={form.current}
                    onChange={(e) =>
                        setForm({ ...form, current: e.target.value })
                    }
                />
                <PasswordInput
                    label={t('users.newPassword')}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete='new-password'
                    hint={t('users.passwordHint')}
                    value={form.next}
                    onChange={(e) => setForm({ ...form, next: e.target.value })}
                />
                <PasswordInput
                    label={t('profile.repeatPassword')}
                    required
                    autoComplete='new-password'
                    error={mismatch ? t('profile.passwordMismatch') : undefined}
                    value={form.repeat}
                    onChange={(e) =>
                        setForm({ ...form, repeat: e.target.value })
                    }
                />
                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={mutation.isPending || mismatch}
                    >
                        {t(
                            mutation.isPending
                                ? 'common.saving'
                                : 'profile.changePassword',
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function ProfileHeading({
    name,
    initials,
    avatarUrl,
    subtitle,
}: {
    name: string;
    initials: string;
    avatarUrl: string | null;
    subtitle: string;
}) {
    const avatar = fileUrl(avatarUrl);

    return (
        <div className='flex items-center gap-4'>
            <Avatar className='size-16'>
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback>{initials || 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <p className='text-text-primary font-display text-lg font-semibold'>
                    {name}
                </p>
                <p className='text-text-tertiary text-sm'>{subtitle}</p>
            </div>
        </div>
    );
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <div className='border-card-border bg-card-background rounded-xl border p-6'>
            {title && (
                <h2 className='text-text-primary font-display mb-4 text-base font-semibold'>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className='flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center'>
            <dt className='text-text-tertiary text-sm sm:w-56 sm:shrink-0'>
                {label}
            </dt>
            <dd className='text-text-primary text-sm font-medium'>
                {children}
            </dd>
        </div>
    );
}
