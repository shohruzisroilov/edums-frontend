import { buildQuery, request } from './client';
import type {
    CreateGroupPayload,
    DataResponse,
    Group,
    ListGroupsQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateGroupPayload,
} from '@/types/api';

const BASE = '/groups';

export function listGroups(query: ListGroupsQuery = {}) {
    return request<PaginatedResponse<Group>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function createGroup(payload: CreateGroupPayload) {
    const res = await request<DataResponse<Group>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateGroup(id: string, payload: UpdateGroupPayload) {
    const res = await request<DataResponse<Group>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteGroup(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
