'use client';

import { Button } from '@/components/tailgrids/core/button';
import {
    CheckboxInput,
    SelectInput,
    TextInput,
} from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { SectionCard } from '@/components/ui/section-card';
import { TelegramIcon } from '@/components/ui/support-modal';
import { useApiErrorToast } from '@/hooks/use-api-error';
import { getSmsSettings, updateSmsSettings } from '@/services/api/sms-settings';
import { sendTelegramTestMessage } from '@/services/api/telegram';
import type { NotificationChannel, SmsSettings } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export function TelegramSettingsCard({
    initialSettings,
}: {
    initialSettings?: SmsSettings;
}) {
    const toastError = useApiErrorToast();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['sms-settings'],
        queryFn: getSmsSettings,
        initialData: initialSettings,
    });

    const settings = query.data;

    const [botToken, setBotToken] = useState('');
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [channel, setChannel] = useState<NotificationChannel | null>(null);
    const [testTarget, setTestTarget] = useState('');

    const isEnabled =
        enabled !== null ? enabled : (settings?.telegram_enabled ?? false);
    const currentChannel =
        channel !== null
            ? channel
            : (settings?.notification_channel ?? 'telegram_first');

    const saveMutation = useMutation({
        mutationFn: () =>
            updateSmsSettings({
                telegram_bot_token: botToken.trim() || undefined,
                telegram_enabled: isEnabled,
                notification_channel: currentChannel,
            }),
        onSuccess: (data) => {
            queryClient.setQueryData(['sms-settings'], data);
            setBotToken('');
            toast.success('Telegram bot sozlamalari muvaffaqiyatli saqlandi');
        },
        onError: (err) => toastError(err),
    });

    const testMutation = useMutation({
        mutationFn: () => sendTelegramTestMessage(testTarget.trim()),
        onSuccess: (res) => {
            toast.success(res.message || 'Sinov xabari yuborildi');
        },
        onError: (err) => toastError(err),
    });

    if (!settings) return null;

    function handleSave(e: FormEvent) {
        e.preventDefault();
        saveMutation.mutate();
    }

    function handleTest(e: FormEvent) {
        e.preventDefault();
        if (!testTarget.trim()) return;
        testMutation.mutate();
    }

    return (
        <SectionCard title='Telegram Bot Integratsiyasi'>
            <div className='flex flex-col gap-5'>
                {/* Status bar */}
                <div className='bg-primary-50/50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/50 flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center'>
                    <div>
                        <div className='text-text-primary flex items-center gap-2 text-sm font-semibold'>
                            <TelegramIcon className='size-4 text-[#229ED9]' />
                            <span>Bot holati:</span>
                            {settings.has_telegram_bot_token &&
                            settings.telegram_bot_username ? (
                                <a
                                    href={`https://t.me/${settings.telegram_bot_username}`}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='text-primary-600 dark:text-primary-400 hover:text-primary-700 inline-flex items-center gap-1 font-semibold hover:underline'
                                >
                                    @{settings.telegram_bot_username}
                                </a>
                            ) : (
                                <span className='text-danger-500 font-medium'>
                                    Bot tokeni ulanmagan
                                </span>
                            )}
                        </div>
                        <p className='text-text-tertiary mt-1 text-xs'>
                            Foydalanuvchilar va ota-onalar ushbu bot orqali
                            tasdiqlash kodlari va xabarnomalarni qabul
                            qilishadi.
                        </p>
                    </div>

                    {settings.has_telegram_bot_token && (
                        <div className='flex items-center gap-2'>
                            <span
                                className={`inline-block size-2.5 rounded-full ${
                                    settings.telegram_enabled
                                        ? 'bg-success-500'
                                        : 'bg-gray-400'
                                }`}
                            />
                            <span className='text-text-secondary text-xs font-medium'>
                                {settings.telegram_enabled
                                    ? 'Faol'
                                    : "O'chirilgan"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Configuration form */}
                <form onSubmit={handleSave} className='flex flex-col gap-4'>
                    <PasswordInput
                        label='Telegram Bot Token'
                        placeholder={
                            settings.has_telegram_bot_token
                                ? "•••••••• (O'zgartirish uchun yangi token kiriting)"
                                : '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'
                        }
                        hint='Telegramda @BotFather orqali yaratilgan bot tokenini kiriting. Saqlanganda bot nomi avtomatik aniqlanadi.'
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                    />

                    <CheckboxInput
                        label='Telegram bot orqali xabarnomalarni faollashtirish'
                        checked={isEnabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />

                    <SelectInput
                        label='Xabar yuborish kanali ustuvorligi'
                        value={currentChannel}
                        onValueChange={(val) =>
                            setChannel(val as NotificationChannel)
                        }
                        hint='SMS balansi tugaganda yoki uzilish bo‘lganda tizim avtomatik ravishda botga ulangan foydalanuvchilarga zaxira Telegram orqali yuboradi.'
                        options={[
                            {
                                value: 'telegram_first',
                                label: "Telegram birinchi (Tavsiya etiladi — botda bo'lsa Telegram, ulanmagan bo'lsa SMS)",
                            },
                            {
                                value: 'sms_first',
                                label: 'SMS birinchi (SMS ishlamay qolsa, Telegram zaxira sifatida)',
                            },
                            {
                                value: 'telegram_only',
                                label: 'Faqat Telegram (Faqat botga ulanganlarga yuboriladi)',
                            },
                            {
                                value: 'sms_only',
                                label: 'Faqat SMS (Telegram ishlatilmaydi)',
                            },
                        ]}
                    />

                    <div className='flex justify-end pt-2'>
                        <Button
                            type='submit'
                            variant='primary'
                            size='md'
                            isDisabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending
                                ? 'Saqlanmoqda...'
                                : 'Sozlamalarni saqlash'}
                        </Button>
                    </div>
                </form>

                {/* Test message form */}
                {settings.has_telegram_bot_token && (
                    <div className='border-card-border mt-2 border-t pt-4'>
                        <h3 className='text-text-primary mb-1 text-sm font-semibold'>
                            Telegram sinov xabari yuborish
                        </h3>
                        <p className='text-text-tertiary mb-3 text-xs'>
                            Bot orqali telefon raqamingizga yoki Telegram Chat
                            ID ga sinov xabari jo‘natib tekshirib ko‘ring.
                        </p>
                        <form
                            onSubmit={handleTest}
                            className='flex flex-col items-end gap-3 sm:flex-row'
                        >
                            <div className='w-full flex-1'>
                                <TextInput
                                    label='Telefon raqam yoki Chat ID'
                                    placeholder='+998901234567 yoki 123456789'
                                    hint="Telefon raqam avval botda /start orqali bog'langan bo'lishi kerak"
                                    value={testTarget}
                                    onChange={(e) =>
                                        setTestTarget(e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                type='submit'
                                variant='primary'
                                appearance='outline'
                                size='md'
                                isDisabled={
                                    testMutation.isPending || !testTarget.trim()
                                }
                            >
                                {testMutation.isPending
                                    ? 'Yuborilmoqda...'
                                    : 'Sinov xabarini yuborish'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </SectionCard>
    );
}
