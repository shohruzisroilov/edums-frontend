'use client';

import { Button } from '@/components/tailgrids/core/button';
import { AccessGuard } from '@/components/ui/access-guard';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import { TextareaInput } from '@/components/ui/form-field';
import { NumberInput } from '@/components/ui/number-input';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    getPlatformSettings,
    updatePlatformSettings,
} from '@/services/api/platform-settings';
import type { PlatformSettings } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function PlatformSettingsPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <PlatformSettingsView />
        </AccessGuard>
    );
}

function PlatformSettingsView() {
    const t = useT();

    const query = useQuery({
        queryKey: ['platform-settings'],
        queryFn: getPlatformSettings,
    });

    return (
        <>
            <PageHeader
                title={t('platformSettings.title')}
                description={t('platformSettings.subtitle')}
            />

            <div className='px-5'>
                {query.isPending ? (
                    <TableSkeleton rows={4} columns={2} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : (
                    <SettingsForm
                        key={query.data.updated_at}
                        settings={query.data}
                    />
                )}
            </div>
        </>
    );
}

function SettingsForm({ settings }: { settings: PlatformSettings }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [trialDays, setTrialDays] = useState(String(settings.trial_days));
    const [instructions, setInstructions] = useState(
        settings.payment_instructions,
    );

    const days = Number(trialDays);
    const daysValid = Number.isInteger(days) && days >= 1 && days <= 365;

    const mutation = useMutation({
        mutationFn: () =>
            updatePlatformSettings({
                trial_days: days,
                payment_instructions: instructions.trim(),
            }),
        onSuccess: (data) => {
            queryClient.setQueryData(['platform-settings'], data);
            // Landing va ro'yxatdan o'tish sahifalaridagi son ham yangilansin.
            queryClient.invalidateQueries({
                queryKey: ['platform-settings', 'public'],
            });
            toast.success(t('platformSettings.saved'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className='grid items-start gap-5 lg:grid-cols-[2fr_3fr]'
        >
            <SectionCard title={t('platformSettings.trialTitle')}>
                <NumberInput
                    label={t('platformSettings.trialDays')}
                    required
                    unit={t('tariffs.dayUnit')}
                    hint={t('platformSettings.trialDaysHint')}
                    value={trialDays}
                    onValueChange={setTrialDays}
                />
            </SectionCard>

            <SectionCard title={t('platformSettings.paymentTitle')}>
                <TextareaInput
                    label={t('platformSettings.paymentInstructions')}
                    maxLength={2000}
                    rows={5}
                    placeholder={t(
                        'platformSettings.paymentInstructionsPlaceholder',
                    )}
                    hint={t('platformSettings.paymentInstructionsHint')}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
            </SectionCard>

            <div className='flex justify-end lg:col-span-2'>
                <Button
                    type='submit'
                    variant='primary'
                    appearance='fill'
                    size='md'
                    isDisabled={mutation.isPending || !daysValid}
                >
                    {t(mutation.isPending ? 'common.saving' : 'common.save')}
                </Button>
            </div>
        </form>
    );
}
