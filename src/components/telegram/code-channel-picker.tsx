'use client';

import { TelegramIcon } from '@/components/ui/support-modal';
import {
    checkTelegramPhoneStatus,
    getTelegramBotInfo,
} from '@/services/api/telegram';
import {
    CheckCircle1,
    InfoCircle,
    Message1,
    RefreshCircle1Clockwise,
} from '@tailgrids/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface CodeChannelPickerProps {
    phone: string;
    channel: 'sms' | 'telegram';
    onChannelChange: (channel: 'sms' | 'telegram') => void;
    isValidPhone: boolean;
}

export function CodeChannelPicker({
    phone,
    channel,
    onChannelChange,
    isValidPhone,
}: CodeChannelPickerProps) {
    const [recheckKey, setRecheckKey] = useState(0);

    const botInfoQuery = useQuery({
        queryKey: ['telegram-bot-info'],
        queryFn: getTelegramBotInfo,
        staleTime: 60_000,
    });

    const statusQuery = useQuery({
        queryKey: ['telegram-phone-status', phone, recheckKey],
        queryFn: () => checkTelegramPhoneStatus(phone),
        enabled: isValidPhone && botInfoQuery.data?.is_active === true,
        staleTime: 5_000,
    });

    const botInfo = botInfoQuery.data;
    const isBotActive = !!botInfo?.is_active && !!botInfo?.username;
    const isLinked = statusQuery.data?.is_linked;

    // Agar Telegram bot yoqilmagan bo'lsa, tanlovni ko'rsatmaymiz (faqat SMS ishlaydi)
    if (!isBotActive) {
        return null;
    }

    return (
        <div className='flex flex-col gap-2.5'>
            <label className='text-text-primary text-xs font-semibold'>
                Tasdiqlash kodini olish usuli:
            </label>

            <div className='grid grid-cols-2 gap-2'>
                <button
                    type='button'
                    onClick={() => onChannelChange('sms')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                        channel === 'sms'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                            : 'border-border text-text-secondary hover:bg-background-secondary'
                    }`}
                >
                    <Message1 className='size-4 shrink-0' />
                    <span>SMS orqali</span>
                </button>

                <button
                    type='button'
                    onClick={() => onChannelChange('telegram')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                        channel === 'telegram'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                            : 'border-border text-text-secondary hover:bg-background-secondary'
                    }`}
                >
                    <TelegramIcon className='size-4 shrink-0 text-[#229ED9]' />
                    <span>Telegram</span>
                </button>
            </div>

            {/* Telegram tanlanganda yo'riqnoma */}
            {channel === 'telegram' && isValidPhone && (
                <div className='rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200'>
                    {isLinked ? (
                        <div className='flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400'>
                            <CheckCircle1 className='size-4 shrink-0' />
                            <span>
                                Raqamingiz @{botInfo.username} ga ulangan. Kod
                                botga yuboriladi.
                            </span>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400'>
                                <InfoCircle className='size-4 shrink-0' />
                                <span>
                                    Ushbu telefon raqam hali botga ulanmagan.
                                </span>
                            </div>
                            <p className='text-xs opacity-90'>
                                Kodni Telegram orqali olish uchun quyidagi
                                havola orqali botga kiring va{' '}
                                <b>«Telefon raqamni ulash»</b> tugmasini bosing:
                            </p>
                            <div className='flex items-center gap-2 pt-1'>
                                <a
                                    href={`https://t.me/${botInfo.username}`}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-700'
                                >
                                    <TelegramIcon className='size-3.5 shrink-0' />
                                    <span>@{botInfo.username} ga kirish</span>
                                </a>
                                <button
                                    type='button'
                                    onClick={() => setRecheckKey((k) => k + 1)}
                                    className='inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-2.5 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
                                >
                                    <RefreshCircle1Clockwise className='size-3.5 shrink-0' />
                                    <span>Ulandim (tekshirish)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
