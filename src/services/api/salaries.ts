import { buildQuery, request } from './client';
import type {
    CreateSalaryPayoutPayload,
    DataResponse,
    MessageResponse,
    SalaryPayout,
    SalaryRate,
    SalarySheet,
} from '@/types/api';

const BASE = '/salaries';

/** Oy varaqasi: har bir xodim uchun hisoblangan, to'langan va qoldiq. */
export async function getSalarySheet(month?: string) {
    const res = await request<DataResponse<SalarySheet>>(
        `${BASE}${buildQuery({ month })}`,
    );
    return res.data;
}

export function setSalaryRate(user_id: string, rate: SalaryRate) {
    return request<MessageResponse>(`${BASE}/rates/${user_id}`, {
        method: 'PUT',
        body: rate,
    });
}

export function removeSalaryRate(user_id: string) {
    return request<MessageResponse>(`${BASE}/rates/${user_id}`, {
        method: 'DELETE',
    });
}

export async function listSalaryPayouts(month?: string) {
    const res = await request<DataResponse<SalaryPayout[]>>(
        `${BASE}/payouts${buildQuery({ month })}`,
    );
    return res.data;
}

/** To'lov bilan birga "oylik" xarajati ham yoziladi. */
export async function paySalary(payload: CreateSalaryPayoutPayload) {
    const res = await request<DataResponse<SalaryPayout>>(`${BASE}/payouts`, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

/** Xarajati ham o'chadi. */
export function cancelSalaryPayout(id: string) {
    return request<MessageResponse>(`${BASE}/payouts/${id}`, {
        method: 'DELETE',
    });
}
