import { buildQuery, request } from './client';
import type {
    CreateUserPayload,
    DataResponse,
    ListUsersQuery,
    MessageResponse,
    PaginatedResponse,
    UpdateUserPayload,
    User,
} from '@/types/api';

const BASE = '/users';

export function listUsers(query: ListUsersQuery = {}) {
    return request<PaginatedResponse<User>>(
        `${BASE}${buildQuery({ ...query })}`,
    );
}

export async function createUser(payload: CreateUserPayload) {
    const res = await request<DataResponse<User>>(BASE, {
        method: 'POST',
        body: payload,
    });
    return res.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
    const res = await request<DataResponse<User>>(`${BASE}/${id}`, {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

export function deleteUser(id: string) {
    return request<MessageResponse>(`${BASE}/${id}`, { method: 'DELETE' });
}
