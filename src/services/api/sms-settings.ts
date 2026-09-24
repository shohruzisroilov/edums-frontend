import { request } from './client';
import type {
    DataResponse,
    MessageResponse,
    SmsSettings,
    SmsSettingsPayload,
} from '@/types/api';

const BASE = '/sms-settings';

/** Super admin: Eskiz ulanishi. */
export async function getSmsSettings() {
    const res = await request<DataResponse<SmsSettings>>(BASE);
    return res.data;
}

export async function updateSmsSettings(payload: SmsSettingsPayload) {
    const res = await request<DataResponse<SmsSettings>>(BASE, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** Saqlangan sozlamalar bilan shablon bo'yicha sinov SMS yuboradi. */
export function sendTestSms(phone_number: string) {
    return request<MessageResponse>(`${BASE}/test`, {
        method: 'POST',
        body: { phone_number },
    });
}
