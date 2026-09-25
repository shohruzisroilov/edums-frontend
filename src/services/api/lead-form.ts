import { apiUrl, request } from './client';
import type { DataResponse, LeadForm, MessageResponse } from '@/types/api';

const BASE = '/lead-form';

/** Markaz saytidagi forma (settings.manage). `null` — o'chirilgan. */
export async function getLeadForm() {
    const res = await request<DataResponse<LeadForm | null>>(BASE);
    return res.data;
}

/** Formani yoqadi yoki kalitni yangilaydi — eski kalit darhol ishlamay qoladi. */
export async function issueLeadFormKey() {
    const res = await request<DataResponse<LeadForm>>(BASE, { method: 'POST' });
    return res.data;
}

export function disableLeadForm() {
    return request<MessageResponse>(BASE, { method: 'DELETE' });
}

/** Saytga qo'yiladigan vidjet skripti. */
export function leadFormScriptUrl(): string {
    return apiUrl('/public/lead-form.js');
}

/** Ariza yuboriladigan manzil — o'z formasi va webhook uchun. */
export function leadFormSubmitUrl(key: string): string {
    return apiUrl(`/public/lead-forms/${key}/leads`);
}

/** Markaz nomi va faol kurslar (ochiq). */
export function leadFormInfoUrl(key: string): string {
    return apiUrl(`/public/lead-forms/${key}`);
}
