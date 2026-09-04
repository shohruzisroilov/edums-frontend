import { buildQuery, request } from './client';
import type {
    CreateCenterStaffPayload,
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

/** Shu filialga biriktirilgan administrator, manager va teacherlar. */
export async function listCenterStaff(id: string) {
    const res = await request<DataResponse<User[]>>(`${BASE}/${id}/staff`);
    return res.data;
}

export async function createCenterStaff(
    id: string,
    payload: CreateCenterStaffPayload,
) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}/staff`, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

/** Mavjud xodimni shu filialga ham biriktiradi. */
export async function attachStaffToCenter(id: string, userId: string) {
    const res = await request<DataResponse<User>>(
        `${BASE}/${id}/staff/${userId}`,
        { method: 'POST' },
    );
    return res.data;
}

/** Hisob o'chirilmaydi — faqat filial biriktiruvi olinadi. */
export function detachStaffFromCenter(id: string, userId: string) {
    return request<MessageResponse>(`${BASE}/${id}/staff/${userId}`, {
        method: 'DELETE',
    });
}
