import { request } from './client';
import type {
    DataResponse,
    MessageResponse,
    TelegramBotInfo,
    TelegramPhoneStatus,
} from '@/types/api';

/** Ommaviy: Telegram bot ma'lumotlarini olish. */
export async function getTelegramBotInfo() {
    const res = await request<DataResponse<TelegramBotInfo>>(
        '/telegram/bot-info',
        {
            skipAuth: true,
        },
    );
    return res.data;
}

/** Telefon raqam botga ulanganmi yoki yo'qligini tekshirish. */
export async function checkTelegramPhoneStatus(phone: string) {
    const res = await request<DataResponse<TelegramPhoneStatus>>(
        `/telegram/status/${encodeURIComponent(phone)}`,
        {
            skipAuth: true,
        },
    );
    return res.data;
}

/** Super admin: Sinov xabari yuborish (telefon yoki chat ID). */
export function sendTelegramTestMessage(target: string) {
    return request<MessageResponse>('/telegram/test', {
        method: 'POST',
        body: { target },
    });
}
