import { buildQuery, request } from './client';
import type {
    CreateTariffPayload,
    DataResponse,
    ListTariffsQuery,
    MessageResponse,
    PaginatedResponse,
    Tariff,
    UpdateTariffPayload,
} from '@/types/api';

const BASE = '/tariffs';

export function listTariffs(query: ListTariffsQuery = {}) {
    return request<PaginatedResponse<Tariff>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function createTariff(payload: CreateTariffPayload) {
    const res = await request<DataResponse<Tariff>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateTariff(id: string, payload: UpdateTariffPayload) {
    const res = await request<DataResponse<Tariff>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteTariff(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
