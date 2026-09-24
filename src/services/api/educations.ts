import { buildQuery, request } from './client';
import type {
    CreateEducationOwnerPayload,
    CreateEducationPayload,
    DataResponse,
    Education,
    ListEducationsQuery,
    MessageResponse,
    PaginatedResponse,
    Subscription,
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

/** Faqat Owner rolidagi foydalanuvchilar uchun. */
export async function resetEducationOwnerPassword(
    id: string,
    userId: string,
    password: string,
) {
    const res = await request<DataResponse<User>>(
        `${BASE}/${id}/owners/${userId}/password`,
        { method: 'PATCH', body: { password } },
    );
    return res.data;
}

/** Sinov va pulli davrlar, yangisi birinchi. */
export async function listEducationSubscriptions(id: string) {
    const res = await request<DataResponse<Subscription[]>>(
        `${BASE}/${id}/subscriptions`,
    );
    return res.data;
}
