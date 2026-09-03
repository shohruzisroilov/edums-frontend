import { buildQuery, request } from './client';
import type {
    CreateCenterAdminPayload,
    CreateEducationCenterPayload,
    DataResponse,
    EducationCenter,
    ListEducationCentersQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateEducationCenterPayload,
    User,
} from '@/types/api';

const BASE = '/education_centers';

export function listEducationCenters(query: ListEducationCentersQuery = {}) {
    return request<PaginatedResponse<EducationCenter>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function getEducationCenter(id: string) {
    const res = await request<DataResponse<EducationCenter>>(`${BASE}/${id}`);
    return res.data;
}

export async function createEducationCenter(
    payload: CreateEducationCenterPayload,
) {
    const res = await request<DataResponse<EducationCenter>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateEducationCenter(
    id: string,
    payload: UpdateEducationCenterPayload,
) {
    const res = await request<DataResponse<EducationCenter>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteEducationCenter(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}

/** PATCH /:id/tariff — tarif biriktirish. null yuborilsa tarif uziladi. */
export async function assignTariff(id: string, tariff_id: string | null) {
    const res = await request<DataResponse<EducationCenter>>(
        `${BASE}/${id}/tariff`,
        { method: 'PATCH', body: { tariff_id } },
    );
    return res.data;
}

export async function listCenterAdmins(id: string) {
    const res = await request<DataResponse<User[]>>(`${BASE}/${id}/admins`);
    return res.data;
}

export async function createCenterAdmin(
    id: string,
    payload: CreateCenterAdminPayload,
) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}/admins`, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}
