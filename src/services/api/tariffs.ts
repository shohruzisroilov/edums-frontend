import { request } from './client';
import type {
    DataResponse,
    MessageResponse,
    Tariff,
    TariffPayload,
} from '@/types/api';

const BASE = '/tariffs';

/** GET /tariffs/public — sotuvdagi tariflar, login talab qilinmaydi. */
export async function listPublicTariffs() {
    const res = await request<DataResponse<Tariff[]>>(`${BASE}/public`, {
        skipAuth: true,
    });
    return res.data;
}

/** Super admin: nofaollari bilan birga. */
export async function listTariffs() {
    const res = await request<DataResponse<Tariff[]>>(BASE);
    return res.data;
}

export async function createTariff(payload: TariffPayload) {
    const res = await request<DataResponse<Tariff>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateTariff(
    id: string,
    payload: Partial<TariffPayload>,
) {
    const res = await request<DataResponse<Tariff>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteTariff(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
