import { buildQuery, request } from './client';
import type {
    CreateEducationOwnerPayload,
    CreateEducationPayload,
    DataResponse,
    Education,
    EducationSubscription,
    ListEducationsQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateEducationPayload,
    User,
} from '@/types/api';

const BASE = '/educations';

export function listEducations(query: ListEducationsQuery = {}) {
    return request<PaginatedResponse<Education>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function getEducation(id: string) {
    const res = await request<DataResponse<Education>>(`${BASE}/${id}`);
    return res.data;
}

export async function createEducation(payload: CreateEducationPayload) {
    const res = await request<DataResponse<Education>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateEducation(
    id: string,
    payload: UpdateEducationPayload,
) {
    const res = await request<DataResponse<Education>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteEducation(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}

/**
 * PATCH /:id/tariff — obuna butun tashkilotga tegishli. Joriy davr yopiladi
 * va bugundan yangisi ochiladi; null yuborilsa obuna bekor qilinadi.
 */
export async function assignEducationTariff(
    id: string,
    tariff_id: string | null,
) {
    const res = await request<DataResponse<Education>>(`${BASE}/${id}/tariff`, {
        method: 'PATCH',
        body: { tariff_id },
    });
    return res.data;
}

export async function listEducationSubscriptions(id: string) {
    const res = await request<DataResponse<EducationSubscription[]>>(
        `${BASE}/${id}/subscriptions`,
    );
    return res.data;
}

export async function listEducationOwners(id: string) {
    const res = await request<DataResponse<User[]>>(`${BASE}/${id}/owners`);
    return res.data;
}

export async function createEducationOwner(
    id: string,
    payload: CreateEducationOwnerPayload,
) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}/owners`, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}
