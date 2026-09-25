import { buildQuery, request } from './client';
import type {
    DataResponse,
    Group,
    GroupPayload,
    ListGroupsQuery,
    MessageResponse,
    PaginatedResponse,
    ScheduleQuery,
} from '@/types/api';

const BASE = '/groups';

export function listGroups(query: ListGroupsQuery = {}) {
    return request<PaginatedResponse<Group>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

/** Barcha faol guruhlar, dars vaqti bo'yicha — haftalik jadval uchun. */
export async function getSchedule(query: ScheduleQuery = {}) {
    const res = await request<DataResponse<Group[]>>(
        `${BASE}/schedule${buildQuery({ ...query })}`,
    );
    return res.data;
}

export async function getGroup(id: string) {
    const res = await request<DataResponse<Group>>(`${BASE}/${id}`);
    return res.data;
}

/** Xona yoki o'qituvchi shu vaqtda band bo'lsa — 409. */
export async function createGroup(payload: GroupPayload) {
    const res = await request<DataResponse<Group>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateGroup(id: string, payload: Partial<GroupPayload>) {
    const res = await request<DataResponse<Group>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** O'quvchilari bor guruh o'chirilmaydi — 409. */
export function deleteGroup(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
