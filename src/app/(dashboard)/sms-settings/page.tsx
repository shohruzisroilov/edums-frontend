'use client';

import { Button } from '@/components/tailgrids/core/button';
import { AccessGuard } from '@/components/ui/access-guard';
import { ErrorState, TableSkeleton } from '@/components/ui/data-state';
import {
    CheckboxInput,
    SelectInput,
    TextareaInput,
    TextInput,
} from '@/components/ui/form-field';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { useT } from '@/i18n/provider';
import {
    getSmsSettings,
    sendTestSms,
    updateSmsSettings,
} from '@/services/api/sms-settings';
import type { SmsDriver, SmsSettings } from '@/types/api';
import { isSuperAdmin } from '@/utils/access';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function SmsSettingsPage() {
    return (
        <AccessGuard allow={isSuperAdmin}>
            <SmsSettingsView />
        </AccessGuard>
    );
}

function SmsSettingsView() {
    const t = useT();

    const query = useQuery({
        queryKey: ['sms-settings'],
        queryFn: getSmsSettings,
    });

    return (
        <>
            <PageHeader
                title={t('smsSettings.title')}
                description={t('smsSettings.subtitle')}
            />

            <div className='px-5'>
                {query.isPending ? (
                    <TableSkeleton rows={5} columns={2} />
                ) : query.error ? (
                    <ErrorState error={query.error} />
                ) : (
                    <div className='grid items-start gap-5 lg:grid-cols-[3fr_2fr]'>
                        {/*
                            Saqlangandan keyin forma yangi qiymatlardan qayta
                            boshlanadi: kiritilgan parol maydonda qolib ketmaydi.
                        */}
                        <SettingsForm
                            key={query.data.updated_at}
                            settings={query.data}
                        />
                        <TestSmsCard />
                        <div className='lg:col-span-2'>
                            <NotificationsForm
                                key={query.data.updated_at}
                                settings={query.data}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function SettingsForm({ settings }: { settings: SmsSettings }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        driver: settings.driver,
        eskiz_email: settings.eskiz_email ?? '',
        eskiz_password: '',
        eskiz_from: settings.eskiz_from,
        devsms_token: '',
        devsms_from: settings.devsms_from || '4546',
        template: settings.template,
    });

    const isDevSms = form.driver === 'devsms';
    const isEskiz = form.driver === 'eskiz';

    const mutation = useMutation({
        mutationFn: () =>
            updateSmsSettings({
                driver: form.driver,
                eskiz_email: form.eskiz_email.trim() || null,
                // Bo'sh qoldirilsa backend saqlangan parolni o'zgartirmaydi.
                eskiz_password: form.eskiz_password || undefined,
                eskiz_from: form.eskiz_from.trim(),
                devsms_token: form.devsms_token.trim() || undefined,
                devsms_from: form.devsms_from.trim(),
                template: form.template.trim(),
            }),
        onSuccess: (data) => {
            queryClient.setQueryData(['sms-settings'], data);
            toast.success(t('smsSettings.saved'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <SectionCard title={t('smsSettings.connectionTitle')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <SelectInput
                    label={t('smsSettings.driver')}
                    required
                    options={[
                        {
                            value: 'devsms',
                            label: t('smsSettings.driverDevsms'),
                        },
                        {
                            value: 'eskiz',
                            label: t('smsSettings.driverEskiz'),
                        },
                        {
                            value: 'console',
                            label: t('smsSettings.driverConsole'),
                        },
                    ]}
                    hint={
                        isDevSms
                            ? t('smsSettings.driverDevsmsHint')
                            : isEskiz
                              ? t('smsSettings.driverEskizHint')
                              : t('smsSettings.driverConsoleHint')
                    }
                    value={form.driver}
                    onValueChange={(driver) =>
                        setForm({ ...form, driver: driver as SmsDriver })
                    }
                />

                {isDevSms && (
                    <>
                        <PasswordInput
                            label={t('smsSettings.devsmsToken')}
                            required={!settings.has_devsms_token}
                            autoComplete='off'
                            placeholder={
                                settings.has_devsms_token
                                    ? '••••••••'
                                    : undefined
                            }
                            hint={t(
                                settings.has_devsms_token
                                    ? 'smsSettings.devsmsTokenSavedHint'
                                    : 'smsSettings.devsmsTokenHint',
                            )}
                            value={form.devsms_token}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    devsms_token: e.target.value,
                                })
                            }
                        />

                        <TextInput
                            label={t('smsSettings.devsmsFrom')}
                            required
                            maxLength={20}
                            hint={t('smsSettings.devsmsFromHint')}
                            value={form.devsms_from}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    devsms_from: e.target.value,
                                })
                            }
                        />
                    </>
                )}

                {isEskiz && (
                    <>
                        <TextInput
                            label={t('smsSettings.email')}
                            type='email'
                            required
                            autoComplete='off'
                            placeholder='info@example.uz'
                            value={form.eskiz_email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eskiz_email: e.target.value,
                                })
                            }
                        />

                        <PasswordInput
                            label={t('smsSettings.password')}
                            required={!settings.has_eskiz_password}
                            autoComplete='new-password'
                            placeholder={
                                settings.has_eskiz_password
                                    ? '••••••••'
                                    : undefined
                            }
                            hint={t(
                                settings.has_eskiz_password
                                    ? 'smsSettings.passwordSavedHint'
                                    : 'smsSettings.passwordHint',
                            )}
                            value={form.eskiz_password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eskiz_password: e.target.value,
                                })
                            }
                        />

                        <TextInput
                            label={t('smsSettings.from')}
                            required
                            maxLength={20}
                            hint={t('smsSettings.fromHint')}
                            value={form.eskiz_from}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    eskiz_from: e.target.value,
                                })
                            }
                        />
                    </>
                )}

                <TextareaInput
                    label={t('smsSettings.template')}
                    required
                    maxLength={500}
                    hint={t('smsSettings.templateHint')}
                    error={
                        form.template.includes('{code}')
                            ? undefined
                            : t('smsSettings.templateMissingCode')
                    }
                    value={form.template}
                    onChange={(e) =>
                        setForm({ ...form, template: e.target.value })
                    }
                />

                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='fill'
                        size='md'
                        isDisabled={
                            mutation.isPending ||
                            !form.template.includes('{code}')
                        }
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

/** Avtomatik xabarlar: umumiy kalit va uchta shablon. */
function NotificationsForm({ settings }: { settings: SmsSettings }) {
    const t = useT();
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        notifications_enabled: settings.notifications_enabled,
        subscription_template: settings.subscription_template,
        debt_template: settings.debt_template,
        absence_template: settings.absence_template,
    });

    const mutation = useMutation({
        mutationFn: () =>
            updateSmsSettings({
                notifications_enabled: form.notifications_enabled,
                subscription_template: form.subscription_template.trim(),
                debt_template: form.debt_template.trim(),
                absence_template: form.absence_template.trim(),
            }),
        onSuccess: (data) => {
            queryClient.setQueryData(['sms-settings'], data);
            toast.success(t('smsSettings.saved'));
        },
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    const templates = [
        {
            key: 'subscription_template',
            label: t('smsSettings.subscriptionTemplate'),
            placeholders: '{education}, {days}',
        },
        {
            key: 'debt_template',
            label: t('smsSettings.debtTemplate'),
            placeholders: '{education}, {student}, {group}, {amount}',
        },
        {
            key: 'absence_template',
            label: t('smsSettings.absenceTemplate'),
            placeholders: '{education}, {student}, {group}, {date}',
        },
    ] as const;

    return (
        <SectionCard title={t('smsSettings.notificationsTitle')}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <CheckboxInput
                    label={t('smsSettings.notificationsEnabled')}
                    checked={form.notifications_enabled}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            notifications_enabled: e.target.checked,
                        })
                    }
                />
                <p className='text-text-tertiary -mt-2 text-xs'>
                    {t('smsSettings.notificationsHint')}
                </p>

                <div className='grid gap-4 lg:grid-cols-3'>
                    {templates.map((template) => (
                        <TextareaInput
                            key={template.key}
                            label={template.label}
                            required
                            maxLength={500}
                            rows={4}
                            hint={t('smsSettings.placeholders', {
                                list: template.placeholders,
                            })}
                            value={form[template.key]}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    [template.key]: e.target.value,
                                })
                            }
                        />
                    ))}
                </div>

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

function TestSmsCard() {
    const t = useT();
    const toastError = useApiErrorToast();
    const [phone, setPhone] = useState('');

    const mutation = useMutation({
        mutationFn: () => sendTestSms(phone),
        onSuccess: (res) => toast.success(res.message),
        onError: (error) => toastError(error),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        mutation.mutate();
    }

    return (
        <SectionCard title={t('smsSettings.testTitle')}>
            <p className='text-text-tertiary mb-4 text-sm'>
                {t('smsSettings.testText')}
            </p>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <PhoneInput
                    label={t('common.phoneNumber')}
                    required
                    value={phone}
                    onValueChange={setPhone}
                />
                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        variant='primary'
                        appearance='outline'
                        size='md'
                        isDisabled={mutation.isPending || phone.length < 13}
                    >
                        {t(
                            mutation.isPending
                                ? 'smsSettings.testSending'
                                : 'smsSettings.testSend',
                        )}
                    </Button>
                </div>
            </form>
        </SectionCard>
    );
}
