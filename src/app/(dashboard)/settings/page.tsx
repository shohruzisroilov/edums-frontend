'use client';

import { Button } from '@/components/tailgrids/core/button';
import { AccessGuard } from '@/components/ui/access-guard';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { CheckboxInput } from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    getEducationSettings,
    updateEducationSettings,
} from '@/services/api/education-settings';
import type { EducationSettings } from '@/types/api';
import { can } from '@/utils/access';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { LeadFormSection } from './lead-form-section';

export default function SettingsPage() {
    return (
        <AccessGuard allow={(session) => can(session, 'settings.manage')}>
            <SettingsView />
        </AccessGuard>
    );
}

function SettingsView() {
    const t = useT();

    const query = useQuery({
        queryKey: ['education-settings'],
        queryFn: getEducationSettings,
    });

    return (
        <>
            <PageHeader
                title={t('settings.title')}
                description={t('settings.subtitle')}
            />

            <div className='flex max-w-3xl flex-col gap-5 px-5 pb-6'>
                {query.isPending ? (
                    <TableSkeleton rows={3} columns={1} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : (
                    <SettingsForm
                        key={query.data.updated_at}
                        settings={query.data}
                    />
                )}
                <LeadFormSection />
            </div>
        </>
    );
}

function SettingsForm({ settings }: { settings: EducationSettings }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        notify_absence: settings.notify_absence,
        notify_debtors: settings.notify_debtors,
    });

    const mutation = useMutation({
        mutationFn: () => updateEducationSettings(form),
        onSuccess: (data) => {
            queryClient.setQueryData(['education-settings'], data);
            toast.success(t('settings.saved'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <SectionCard title={t('settings.smsTitle')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {!settings.notifications_available && (
                    <p
                        role='status'
                        className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                    >
                        {t('settings.unavailable')}
                    </p>
                )}
                <p className='text-text-tertiary text-sm'>
                    {t('settings.smsHint')}
                </p>
                <CheckboxInput
                    label={t('settings.notifyAbsence')}
                    checked={form.notify_absence}
                    onChange={(e) =>
                        setForm({ ...form, notify_absence: e.target.checked })
                    }
                />
                <CheckboxInput
                    label={t('settings.notifyDebtors')}
                    checked={form.notify_debtors}
                    onChange={(e) =>
                        setForm({ ...form, notify_debtors: e.target.checked })
                    }
                />
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
        </SectionCard>
    );
}
